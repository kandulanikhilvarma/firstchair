// Day-9 aggregation: per-prompt scan results → one daily_scores row per brand+engine.
// Pure function; the worker upserts the output. Every number traceable to inputs (§1.5 F6).

import { promptWeight, shareOfVoice, visibilityScore } from "./score";

export interface PromptScanResult {
  /** brands found in this prompt's response, with flags from extraction */
  entities: Array<{
    brandId: string;
    position: number;
    isRecommendation: boolean;
  }>;
  /** source URLs the engine returned for this prompt */
  citations: string[];
}

export interface DailyScoreRow {
  visibilityScore: number;
  shareOfVoice: number;
  mentionCount: number;
  recommendationCount: number;
  /** top 5 cited URLs with frequency, most-cited first */
  topCitations: Array<{ url: string; count: number }>;
}

export function aggregateDaily(
  brandId: string,
  results: PromptScanResult[],
): DailyScoreRow {
  const outcomes = results.map((r) => {
    const e = r.entities.find((x) => x.brandId === brandId);
    return {
      mentioned: e !== undefined,
      first: e?.position === 1,
      recommended: e?.isRecommendation ?? false,
    };
  });

  const mentionCount = outcomes.filter((o) => o.mentioned).length;
  const allTrackedMentions = results.reduce((n, r) => n + r.entities.length, 0);

  const counts = new Map<string, number>();
  for (const r of results) {
    for (const url of r.citations) {
      counts.set(url, (counts.get(url) ?? 0) + 1);
    }
  }
  const topCitations = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([url, count]) => ({ url, count }));

  return {
    visibilityScore: visibilityScore(outcomes),
    shareOfVoice: shareOfVoice(mentionCount, allTrackedMentions),
    mentionCount,
    recommendationCount: outcomes.filter((o) => o.recommended).length,
    topCitations,
  };
}

export { promptWeight };
