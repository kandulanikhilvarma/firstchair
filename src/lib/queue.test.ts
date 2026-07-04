import { describe, expect, it } from "vitest";
import {
  shouldRequeue,
  sumCostUsd,
  toDailyScoreRow,
  toEngineResponseRow,
  toMentionRows,
} from "./queue";
import type { EngineResult } from "./engines/types";
import type { ExtractedMention } from "./scoring/extract";
import type { DailyScoreRow } from "./scoring/aggregate";

describe("shouldRequeue", () => {
  it("requeues under the attempt cap", () => {
    expect(shouldRequeue(1)).toBe(true);
    expect(shouldRequeue(2)).toBe(true);
  });

  it("gives up at the attempt cap", () => {
    expect(shouldRequeue(3)).toBe(false);
    expect(shouldRequeue(4)).toBe(false);
  });
});

describe("sumCostUsd", () => {
  it("sums rows, treating null as zero", () => {
    expect(sumCostUsd([{ cost_usd: 0.01 }, { cost_usd: null }, { cost_usd: 0.02 }])).toBeCloseTo(
      0.03,
    );
  });

  it("returns 0 for no rows", () => {
    expect(sumCostUsd([])).toBe(0);
  });
});

describe("toEngineResponseRow", () => {
  it("maps EngineResult to the db row shape", () => {
    const result: EngineResult = {
      engine: "gemini",
      model: "gemini-2.0-flash",
      rawText: "hello",
      citations: ["https://example.com"],
      latencyMs: 500,
      promptTokens: 10,
      completionTokens: 20,
      costUsd: 0.001,
    };
    expect(toEngineResponseRow("job-1", "prompt-1", result)).toEqual({
      scan_job_id: "job-1",
      prompt_id: "prompt-1",
      engine: "gemini",
      raw_text: "hello",
      citations: ["https://example.com"],
      model: "gemini-2.0-flash",
      latency_ms: 500,
      prompt_tokens: 10,
      completion_tokens: 20,
      cost_usd: 0.001,
    });
  });
});

describe("toMentionRows", () => {
  it("maps extracted mentions to the db row shape", () => {
    const mentions: ExtractedMention[] = [
      {
        brandId: "brand-1",
        matchedAlias: "Acme Law",
        position: 1,
        sentiment: "positive",
        isRecommendation: true,
        method: "exact",
        needsReview: false,
      },
    ];
    expect(toMentionRows("resp-1", mentions)).toEqual([
      {
        engine_response_id: "resp-1",
        brand_id: "brand-1",
        matched_alias: "Acme Law",
        position: 1,
        sentiment: "positive",
        is_recommendation: true,
        method: "exact",
        needs_review: false,
      },
    ]);
  });
});

describe("toDailyScoreRow", () => {
  it("maps aggregate output to the db row shape", () => {
    const row: DailyScoreRow = {
      visibilityScore: 62,
      shareOfVoice: 0.4,
      mentionCount: 3,
      recommendationCount: 1,
      topCitations: [{ url: "https://example.com", count: 2 }],
    };
    expect(toDailyScoreRow("brand-1", "2026-07-05", "openai", row)).toEqual({
      brand_id: "brand-1",
      date: "2026-07-05",
      engine: "openai",
      visibility_score: 62,
      share_of_voice: 0.4,
      mention_count: 3,
      recommendation_count: 1,
      top_citations: [{ url: "https://example.com", count: 2 }],
    });
  });
});
