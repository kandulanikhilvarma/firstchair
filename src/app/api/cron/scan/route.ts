// Day 10 worker — §2.5. Vercel Cron hits this once daily; it enqueues one
// scan_job per active brand then drains the queue in the same invocation.
//
// ponytail: draining in-process (a while-loop) instead of self-re-invoking
// HTTP calls, per the plan's "worker self-re-invokes while jobs remain".
// At MVP brand counts this finishes well inside maxDuration; move to
// self-invocation (or a real queue) if brand count outgrows one function call.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { callEngine } from "@/lib/engines";
import { callExtractionLlmOpenAI } from "@/lib/engines/extraction-llm";
import { CircuitBreakerOpen, runBrandScan } from "@/lib/scan";
import {
  shouldRequeue,
  sumCostUsd,
  toDailyScoreRow,
  toEngineResponseRow,
  toMentionRows,
} from "@/lib/queue";
import type { TrackedBrand } from "@/lib/scoring/mentions";

export const runtime = "nodejs";
export const maxDuration = 300;

const SCAN_SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "prompts", "scan-system-v1.txt"),
  "utf8",
);
const MAX_DAILY_USD = Number(process.env.MAX_DAILY_LLM_USD ?? 20);

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

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

async function processJob(
  supabase: ReturnType<typeof createAdminClient>,
  job: { id: string; brand_id: string; attempts: number },
) {
  const { data: brandRow, error: brandErr } = await supabase
    .from("brands")
    .select("id, name, aliases")
    .eq("id", job.brand_id)
    .single();
  if (brandErr || !brandRow) throw new Error(`brand lookup: ${brandErr?.message ?? "not found"}`);

  const { data: competitorRows, error: compErr } = await supabase
    .from("brands")
    .select("id, name, aliases")
    .eq("is_competitor_of", job.brand_id);
  if (compErr) throw new Error(`competitor lookup: ${compErr.message}`);

  const { data: promptRows, error: promptErr } = await supabase
    .from("prompts")
    .select("id, text")
    .eq("brand_id", job.brand_id)
    .eq("is_active", true);
  if (promptErr) throw new Error(`prompt lookup: ${promptErr.message}`);
  const promptIdByText = new Map(promptRows.map((p) => [p.text, p.id] as const));

  const { data: spendRows, error: spendErr } = await supabase
    .from("engine_responses")
    .select("cost_usd")
    .gte("created_at", `${today()}T00:00:00.000Z`);
  if (spendErr) throw new Error(`spend lookup: ${spendErr.message}`);
  // ponytail: read once per job, not per engine call — re-querying live spend
  // on every call adds DB round-trips the cap doesn't need at this brand volume.
  const startingSpend = sumCostUsd(spendRows);

  const brand: TrackedBrand = { brandId: brandRow.id, name: brandRow.name, aliases: brandRow.aliases };
  const competitors: TrackedBrand[] = competitorRows.map((c) => ({
    brandId: c.id,
    name: c.name,
    aliases: c.aliases,
  }));

  const outcome = await runBrandScan(brand, competitors, promptRows.map((p) => p.text), {
    callEngine,
    callExtractionLlm: callExtractionLlmOpenAI,
    todaySpendUsd: async () => startingSpend,
    maxDailyUsd: MAX_DAILY_USD,
    scanSystemPrompt: SCAN_SYSTEM_PROMPT,
  });

  for (const record of outcome.records) {
    if (!record.response) continue;
    const promptId = promptIdByText.get(record.prompt);
    if (!promptId) continue;

    const { data: respRow, error: respErr } = await supabase
      .from("engine_responses")
      .insert(toEngineResponseRow(job.id, promptId, record.response))
      .select("id")
      .single();
    if (respErr || !respRow) throw new Error(`engine_responses insert: ${respErr?.message}`);

    if (record.mentions.length > 0) {
      const { error: mentionErr } = await supabase
        .from("mentions")
        .insert(toMentionRows(respRow.id, record.mentions));
      if (mentionErr) throw new Error(`mentions insert: ${mentionErr.message}`);
    }
  }

  const dailyScoreRows = Object.entries(outcome.dailyScores).map(([engine, row]) =>
    toDailyScoreRow(brand.brandId, today(), engine as never, row),
  );
  const { error: scoreErr } = await supabase
    .from("daily_scores")
    .upsert(dailyScoreRows, { onConflict: "brand_id,date,engine" });
  if (scoreErr) throw new Error(`daily_scores upsert: ${scoreErr.message}`);
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
      await processJob(supabase, job);
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
