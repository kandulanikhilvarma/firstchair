// Instant first scan — the onboarding page calls this so a new user sees real
// data immediately instead of waiting for the 6am cron. Authenticated: runs
// the scan only for the caller's own primary brand (ownership checked via the
// RLS-scoped user client before any admin-scoped write).
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CircuitBreakerOpen } from "@/lib/scan";
import { processScanJob, today } from "@/lib/worker";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // RLS scopes this to the caller's workspace — confirms ownership.
  const { data: brands } = await supabase
    .from("brands")
    .select("id")
    .is("is_competitor_of", null)
    .order("created_at", { ascending: true })
    .limit(1);
  const brandId = brands?.[0]?.id;
  if (!brandId) return NextResponse.json({ error: "no brand to scan" }, { status: 400 });

  const admin = createAdminClient();

  // Reuse today's job if one exists (avoids a duplicate on re-entry).
  const { data: job, error: jobErr } = await admin
    .from("scan_jobs")
    .upsert(
      { brand_id: brandId, scheduled_for: today(), status: "running", started_at: new Date().toISOString() },
      { onConflict: "brand_id,scheduled_for" },
    )
    .select("id")
    .single();
  if (jobErr || !job) return NextResponse.json({ error: "could not queue scan" }, { status: 500 });

  try {
    await processScanJob(admin, { id: job.id, brand_id: brandId });
    await admin
      .from("scan_jobs")
      .update({ status: "done", finished_at: new Date().toISOString() })
      .eq("id", job.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Leave the job queued so the daily cron finishes it — the breaker or a
    // transient engine error shouldn't strand the user with nothing.
    await admin
      .from("scan_jobs")
      .update({ status: "queued", error: message })
      .eq("id", job.id);
    const atCapacity = err instanceof CircuitBreakerOpen;
    return NextResponse.json(
      { error: atCapacity ? "at_capacity" : "scan_failed", queuedForDaily: true },
      { status: atCapacity ? 503 : 500 },
    );
  }
}
