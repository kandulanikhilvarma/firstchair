// Scan orchestrator — §2.5 core. One brand, N prompts × 3 engines.
// DB-free: deps injected; the worker route feeds real engine calls + spend reads.

import type { EngineName, EngineResult } from "./engines/types";
import { aggregateDaily, type DailyScoreRow, type PromptScanResult } from "./scoring/aggregate";
import { extractMentions, type ExtractedMention } from "./scoring/extract";
import type { TrackedBrand } from "./scoring/mentions";

export class CircuitBreakerOpen extends Error {
  constructor(spent: number, cap: number) {
    super(`daily LLM spend $${spent.toFixed(2)} >= cap $${cap.toFixed(2)}`);
  }
}

export interface ScanDeps {
  callEngine: (
    engine: EngineName,
    systemPrompt: string,
    userPrompt: string,
  ) => Promise<EngineResult>;
  /** LLM extraction call (gpt-4o-mini temp 0) */
  callExtractionLlm: (systemPrompt: string, userPrompt: string) => Promise<string>;
  /** Global spend today across all brands, USD (worker reads SUM(cost_usd)) */
  todaySpendUsd: () => Promise<number>;
  maxDailyUsd: number;
  scanSystemPrompt: string;
  engines?: EngineName[];
}

export interface PromptEngineRecord {
  prompt: string;
  engine: EngineName;
  response: EngineResult | null;
  mentions: ExtractedMention[];
  error: string | null;
}

export interface ScanOutcome {
  records: PromptEngineRecord[];
  /** per engine, for the scanned brand */
  dailyScores: Record<string, DailyScoreRow>;
  totalCostUsd: number;
  failedCalls: number;
}

const DEFAULT_ENGINES: EngineName[] = ["openai", "gemini", "perplexity"];

/**
 * Runs the full scan for one brand. Individual call failures don't abort the
 * scan (recorded, prompt×engine marked failed); the circuit breaker does.
 */
export async function runBrandScan(
  brand: TrackedBrand,
  competitors: TrackedBrand[],
  prompts: string[],
  deps: ScanDeps,
): Promise<ScanOutcome> {
  const tracked = [brand, ...competitors];
  const engines = deps.engines ?? DEFAULT_ENGINES;
  const records: PromptEngineRecord[] = [];
  let totalCostUsd = 0;

  for (const prompt of prompts) {
    for (const engine of engines) {
      const spent = (await deps.todaySpendUsd()) + totalCostUsd;
      if (spent >= deps.maxDailyUsd) throw new CircuitBreakerOpen(spent, deps.maxDailyUsd);

      try {
        const response = await deps.callEngine(engine, deps.scanSystemPrompt, prompt);
        totalCostUsd += response.costUsd;
        const mentions = await extractMentions(
          response.rawText,
          tracked,
          deps.callExtractionLlm,
        );
        records.push({ prompt, engine, response, mentions, error: null });
      } catch (err) {
        records.push({
          prompt,
          engine,
          response: null,
          mentions: [],
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  const dailyScores: Record<string, DailyScoreRow> = {};
  for (const engine of engines) {
    const perPrompt: PromptScanResult[] = prompts.map((p) => {
      const rec = records.find(
        (r) => r.prompt === p && r.engine === engine && r.response !== null,
      );
      return {
        entities:
          rec?.mentions.map((m) => ({
            brandId: m.brandId,
            position: m.position,
            isRecommendation: m.isRecommendation,
          })) ?? [],
        citations: rec?.response?.citations ?? [],
      };
    });
    dailyScores[engine] = aggregateDaily(brand.brandId, perPrompt);
  }

  return {
    records,
    dailyScores,
    totalCostUsd,
    failedCalls: records.filter((r) => r.error !== null).length,
  };
}
