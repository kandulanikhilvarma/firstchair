// Day 10 worker — §2.5. Vercel Cron hits this once daily; it enqueues one
// scan_job per active brand then drains the queue in the same invocation.
//
// ponytail: draining in-process (a while-loop) instead of self-re-invoking
// HTTP calls, per the plan's "worker self-re-invokes while jobs remain".
// At MVP brand counts this finishes well inside maxDuration; move to
// self-invocation (or a real queue) if brand count outgrows one function call.
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CircuitBreakerOpen } from "@/lib/scan";
import { shouldRequeue } from "@/lib/queue";
import { processScanJob, today } from "@/lib/worker";

export const runtime = "nodejs";
export const maxDuration = 300;

async function enqueueJobs(supabase: ReturnType<typeof createAdminClient>) {
  const { data: workspaces, error: wsErr } = await supabase
    .from("workspaces")
    .select("id")
    .neq("plan", "canceled");
  if (wsErr) throw new Error(`enqueue: ${wsErr.message}`);

  const { data: brands, error: brandsErr } = await supabase
    .from("brands")
    .select("id")
    .is("is_competitor_of", null)
    .in("workspace_id", workspaces.map((w) => w.id));
  if (brandsErr) throw new Error(`enqueue: ${brandsErr.message}`);
  if (brands.length === 0) return;

  const { error: insertErr } = await supabase.from("scan_jobs").upsert(
    brands.map((b) => ({ brand_id: b.id, scheduled_for: today() })),
    { onConflict: "brand_id,scheduled_for", ignoreDuplicates: true },
  );
  if (insertErr) throw new Error(`enqueue: ${insertErr.message}`);
}

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  await enqueueJobs(supabase);

  let processed = 0;
  let failed = 0;
  let breakerTripped = false;

  while (true) {
    // no generated Database types in this project, so rpc()'s return is
    // untyped — the shape is exactly scan_jobs, per the function definition.
    const { data, error: claimErr } = await supabase.rpc("claim_scan_job").maybeSingle();
    const job = data as { id: string; brand_id: string; attempts: number } | null;
    if (claimErr) {
      console.error("claim_scan_job failed:", claimErr.message);
      break;
    }
    if (!job?.id) break;

    try {
      await processScanJob(supabase, job);
      await supabase
        .from("scan_jobs")
        .update({ status: "done", finished_at: new Date().toISOString() })
        .eq("id", job.id);
      processed++;
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      const isBreaker = err instanceof CircuitBreakerOpen;
      await supabase
        .from("scan_jobs")
        .update({
          status: !isBreaker && shouldRequeue(job.attempts) ? "queued" : "failed",
          error: message,
          finished_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      if (isBreaker) {
        console.error("circuit breaker tripped:", message);
        breakerTripped = true;
        // ponytail: any other still-queued jobs for today are left as-is —
        // they won't be reclaimed (scheduled_for is fixed to today) so this
        // is a manual-retry situation. Fine at MVP brand counts; revisit if
        // breaker trips become routine.
        break;
      }
    }
  }

  return NextResponse.json({ processed, failed, breakerTripped });
}
