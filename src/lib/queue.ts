// Day 10 worker helpers — pure mapping/decision logic kept DB-free so it's
// testable without a live Supabase project. The route wires these to real
// tables. §2.5 pseudocode.

import type { DailyScoreRow } from "./scoring/aggregate";
import type { ExtractedMention } from "./scoring/extract";
import type { EngineResult, EngineName } from "./engines/types";

const MAX_ATTEMPTS = 3;

/** attempts is post-increment (claim_scan_job() already did attempts+1). */
export function shouldRequeue(attempts: number): boolean {
  return attempts < MAX_ATTEMPTS;
}

export function sumCostUsd(rows: Array<{ cost_usd: number | null }>): number {
  return rows.reduce((sum, r) => sum + (r.cost_usd ?? 0), 0);
}

export interface EngineResponseRow {
  scan_job_id: string;
  prompt_id: string;
  engine: EngineName;
  raw_text: string;
  citations: string[];
  model: string;
  latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: number;
}

export function toEngineResponseRow(
  scanJobId: string,
  promptId: string,
  r: EngineResult,
): EngineResponseRow {
  return {
    scan_job_id: scanJobId,
    prompt_id: promptId,
    engine: r.engine,
    raw_text: r.rawText,
    citations: r.citations,
    model: r.model,
    latency_ms: r.latencyMs,
    prompt_tokens: r.promptTokens,
    completion_tokens: r.completionTokens,
    cost_usd: r.costUsd,
  };
}

export interface MentionRow {
  engine_response_id: string;
  brand_id: string;
  matched_alias: string;
  position: number;
  sentiment: "positive" | "neutral" | "negative" | null;
  is_recommendation: boolean;
  method: "exact" | "llm";
  needs_review: boolean;
}

export function toMentionRows(
  engineResponseId: string,
  mentions: ExtractedMention[],
): MentionRow[] {
  return mentions.map((m) => ({
    engine_response_id: engineResponseId,
    brand_id: m.brandId,
    matched_alias: m.matchedAlias,
    position: m.position,
    sentiment: m.sentiment,
    is_recommendation: m.isRecommendation,
    method: m.method,
    needs_review: m.needsReview,
  }));
}

export interface DailyScoreDbRow {
  brand_id: string;
  date: string;
  engine: EngineName;
  visibility_score: number;
  share_of_voice: number;
  mention_count: number;
  recommendation_count: number;
  top_citations: Array<{ url: string; count: number }>;
}

export function toDailyScoreRow(
  brandId: string,
  date: string,
  engine: EngineName,
  row: DailyScoreRow,
): DailyScoreDbRow {
  return {
    brand_id: brandId,
    date,
    engine,
    visibility_score: row.visibilityScore,
    share_of_voice: row.shareOfVoice,
    mention_count: row.mentionCount,
    recommendation_count: row.recommendationCount,
    top_citations: row.topCitations,
  };
}
