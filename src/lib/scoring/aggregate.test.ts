import { describe, expect, it } from "vitest";
import { aggregateDaily, type PromptScanResult } from "./aggregate";

const B = "brand";
const C = "competitor";

// 4 prompts: recommended-first / first-not-recommended / second mention / absent
const results: PromptScanResult[] = [
  {
    entities: [
      { brandId: B, position: 1, isRecommendation: true },
      { brandId: C, position: 2, isRecommendation: false },
    ],
    citations: ["https://avvo.com/x", "https://justia.com/y"],
  },
  {
    entities: [{ brandId: B, position: 1, isRecommendation: false }],
    citations: ["https://avvo.com/x"],
  },
  {
    entities: [
      { brandId: C, position: 1, isRecommendation: true },
      { brandId: B, position: 2, isRecommendation: false },
    ],
    citations: ["https://avvo.com/x", "https://yelp.com/z"],
  },
  { entities: [{ brandId: C, position: 1, isRecommendation: false }], citations: [] },
];

describe("aggregateDaily", () => {
  const row = aggregateDaily(B, results);

  it("visibility score matches hand-calc: (1 + 0.6 + 0.4 + 0)/4 × 100 = 50", () => {
    expect(row.visibilityScore).toBe(50);
  });

  it("share of voice: 3 brand mentions of 6 tracked = 0.5", () => {
    expect(row.shareOfVoice).toBe(0.5);
  });

  it("counts mentions and recommendations", () => {
    expect(row.mentionCount).toBe(3);
    expect(row.recommendationCount).toBe(1);
  });

  it("top citations ordered by frequency", () => {
    expect(row.topCitations[0]).toEqual({ url: "https://avvo.com/x", count: 3 });
    expect(row.topCitations).toHaveLength(3);
  });

  it("competitor sees its own numbers from the same inputs", () => {
    const c = aggregateDaily(C, results);
    expect(c.mentionCount).toBe(3);
    expect(c.recommendationCount).toBe(1);
    expect(c.visibilityScore).toBe(50); // (0.4 + 0 + 1 + 0.6)/4 × 100
  });

  it("empty scan yields zeros, no NaN", () => {
    const r = aggregateDaily(B, []);
    expect(r.visibilityScore).toBe(0);
    expect(r.shareOfVoice).toBe(0);
    expect(r.topCitations).toEqual([]);
  });
});
