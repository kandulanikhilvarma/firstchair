// Shared scan-and-persist for one brand: load brand/competitors/active prompts,
// run the scan, write engine_responses + mentions + daily_scores. Used by both
// the daily cron worker (api/cron/scan) and the instant first-scan route
// (api/scan/run) so the persistence logic lives in exactly one place.
import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { createAdminClient } from "@/lib/supabase/admin";
import { callEngine } from "@/lib/engines";
import { callExtractionLlmOpenAI } from "@/lib/engines/extraction-llm";
import { runBrandScan } from "@/lib/scan";
import { sumCostUsd, toDailyScoreRow, toEngineResponseRow, toMentionRows } from "@/lib/queue";
import type { TrackedBrand } from "@/lib/scoring/mentions";

type Admin = ReturnType<typeof createAdminClient>;

const SCAN_SYSTEM_PROMPT = readFileSync(join(process.cwd(), "prompts", "scan-system-v1.txt"), "utf8");
const MAX_DAILY_USD = Number(process.env.MAX_DAILY_LLM_USD ?? 20);

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Runs the scan for one brand+job and persists all rows. Throws on lookup /
 * insert failure and on the circuit breaker (callers decide requeue vs abort).
 */
export async function processScanJob(
  supabase: Admin,
  job: { id: string; brand_id: string },
): Promise<void> {
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
