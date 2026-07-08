// Pure transforms turning raw Supabase rows into the shapes the dashboard
// renders. Kept DB-free so every number is unit-testable and traceable to its
// inputs (§1.5 F6). The page does the fetching and feeds these.

import type { EngineName } from "./engines/types";
import type { CitationGap } from "./scoring/recommend";
import type { PromptRow, SovSlice, TrendPoint } from "./seed";

export interface DailyScoreDbRow {
  date: string;
  engine: EngineName;
  visibility_score: number;
  share_of_voice: number;
  mention_count: number;
  recommendation_count: number;
}

/** engine_responses row with its mentions nested (Supabase embed). */
export interface ScanResponseRow {
  prompt_id: string;
  engine: EngineName;
  citations: string[];
  mentions: Array<{
    brand_id: string;
    position: number;
    is_recommendation: boolean;
    sentiment: PromptRow["sentiment"];
  }>;
}

/** One point per date; missing engine on a date reads as 0 (no data = absent). */
export function assembleTrend(rows: DailyScoreDbRow[]): TrendPoint[] {
  const byDate = new Map<string, TrendPoint>();
  for (const r of rows) {
    const p = byDate.get(r.date) ?? { date: r.date, openai: 0, gemini: 0, perplexity: 0 };
    p[r.engine] = Math.round(r.visibility_score);
    byDate.set(r.date, p);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function scoreOf(p: { openai: number; gemini: number; perplexity: number }): number {
  return Math.round((p.openai + p.gemini + p.perplexity) / 3);
}

/** Today's blended score, the score 7 days back, and the delta. */
export function heroStats(trend: TrendPoint[]): { today: number; weekAgo: number; delta: number } {
  if (trend.length === 0) return { today: 0, weekAgo: 0, delta: 0 };
  const today = scoreOf(trend[trend.length - 1]);
  const weekAgo = scoreOf(trend[Math.max(0, trend.length - 8)]);
  return { today, weekAgo, delta: today - weekAgo };
}

/** Share of voice = each tracked brand's mention count in the latest scan. */
export function computeSov(
  responses: ScanResponseRow[],
  brandNames: Map<string, string>,
): SovSlice[] {
  const counts = new Map<string, number>();
  for (const r of responses) {
    for (const m of r.mentions) counts.set(m.brand_id, (counts.get(m.brand_id) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, mentions]) => ({ name: brandNames.get(id) ?? "Unknown", mentions }))
    .sort((a, b) => b.mentions - a.mentions);
}

/** One row per response (prompt × engine), flagged for the main brand. */
export function promptRowsFromScan(
  responses: ScanResponseRow[],
  promptText: Map<string, string>,
  mainBrandId: string,
): PromptRow[] {
  return responses.map((r) => {
    const m = r.mentions.find((x) => x.brand_id === mainBrandId);
    return {
      prompt: promptText.get(r.prompt_id) ?? "(unknown prompt)",
      engine: r.engine,
      mentioned: m !== undefined,
      position: m?.position ?? null,
      sentiment: m?.sentiment ?? null,
      recommended: m?.is_recommendation ?? false,
    };
  });
}

function domainOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Citation-gap analysis for F9's recommendations. `brandListed` is a proxy:
 * the brand was mentioned in a response that cited this domain (we can't see
 * the domain's page, only that the engine cited it while naming the brand).
 * ponytail: proxy from stored responses; upgrade to fetching the page only if
 * the recommendation quality demands it.
 */
export function buildCitationGaps(
  responses: ScanResponseRow[],
  mainBrandId: string,
  competitorNames: Map<string, string>,
): CitationGap[] {
  const totalPrompts = new Set(responses.map((r) => r.prompt_id)).size;
  const dom = new Map<string, { prompts: Set<string>; brand: boolean; comps: Set<string> }>();
  for (const r of responses) {
    const brandHere = r.mentions.some((m) => m.brand_id === mainBrandId);
    const compsHere = r.mentions.filter((m) => competitorNames.has(m.brand_id));
    for (const url of r.citations) {
      const d = domainOf(url);
      if (!d) continue;
      const e = dom.get(d) ?? { prompts: new Set(), brand: false, comps: new Set() };
      e.prompts.add(r.prompt_id);
      if (brandHere) e.brand = true;
      for (const c of compsHere) e.comps.add(competitorNames.get(c.brand_id)!);
      dom.set(d, e);
    }
  }
  return [...dom.entries()]
    .map(([domain, e]) => ({
      domain,
      citedInPrompts: e.prompts.size,
      totalPrompts,
      brandListed: e.brand,
      competitorsListed: [...e.comps],
    }))
    .sort((a, b) => b.citedInPrompts - a.citedInPrompts)
    .slice(0, 8);
}
