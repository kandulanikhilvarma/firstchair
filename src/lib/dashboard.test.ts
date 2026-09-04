import { describe, expect, it } from "vitest";
import {
  assembleTrend,
  buildCitationGaps,
  competitorStanding,
  computeSov,
  groupPromptOutcomes,
  heroStats,
  promptRowsFromScan,
  reportHistory,
  type DailyScoreDbRow,
  type ScanResponseRow,
} from "./dashboard";

describe("assembleTrend", () => {
  it("groups per date and fills missing engines with 0", () => {
    const rows: DailyScoreDbRow[] = [
      { date: "2026-07-02", engine: "openai", visibility_score: 60, share_of_voice: 0.4, mention_count: 3, recommendation_count: 1 },
      { date: "2026-07-01", engine: "openai", visibility_score: 50.4, share_of_voice: 0.3, mention_count: 2, recommendation_count: 0 },
      { date: "2026-07-01", engine: "gemini", visibility_score: 40, share_of_voice: 0.2, mention_count: 1, recommendation_count: 0 },
    ];
    const trend = assembleTrend(rows);
    expect(trend.map((p) => p.date)).toEqual(["2026-07-01", "2026-07-02"]); // sorted
    expect(trend[0]).toEqual({ date: "2026-07-01", openai: 50, gemini: 40, perplexity: 0 }); // rounds, fills
    expect(trend[1]).toEqual({ date: "2026-07-02", openai: 60, gemini: 0, perplexity: 0 });
  });
});

describe("heroStats", () => {
  it("returns zeros for an empty trend", () => {
    expect(heroStats([])).toEqual({ today: 0, weekAgo: 0, delta: 0 });
  });
  it("blends engines and deltas against 7 days back", () => {
    const trend = Array.from({ length: 8 }, (_, i) => ({
      date: `d${i}`,
      openai: i === 7 ? 90 : 30,
      gemini: i === 7 ? 90 : 30,
      perplexity: i === 7 ? 90 : 30,
    }));
    expect(heroStats(trend)).toEqual({ today: 90, weekAgo: 30, delta: 60 });
  });
});

const RESP: ScanResponseRow[] = [
  {
    prompt_id: "p1",
    engine: "openai",
    citations: ["https://www.avvo.com/x", "https://justia.com/y"],
    mentions: [
      { brand_id: "brand", position: 1, is_recommendation: true, sentiment: "positive" },
      { brand_id: "comp1", position: 2, is_recommendation: false, sentiment: "neutral" },
    ],
  },
  {
    prompt_id: "p2",
    engine: "gemini",
    citations: ["https://avvo.com/z"],
    mentions: [{ brand_id: "comp1", position: 1, is_recommendation: true, sentiment: "positive" }],
  },
];

describe("computeSov", () => {
  it("counts mentions per tracked brand, sorted desc", () => {
    const names = new Map([["brand", "My Firm"], ["comp1", "Rival LLP"]]);
    expect(computeSov(RESP, names)).toEqual([
      { name: "Rival LLP", mentions: 2 },
      { name: "My Firm", mentions: 1 },
    ]);
  });
});

describe("promptRowsFromScan", () => {
  it("flags the main brand per response, dashes when absent", () => {
    const text = new Map([["p1", "Best PI lawyer?"], ["p2", "Top attorney?"]]);
    const rows = promptRowsFromScan(RESP, text, "brand");
    expect(rows[0]).toMatchObject({ prompt: "Best PI lawyer?", mentioned: true, position: 1, recommended: true });
    expect(rows[1]).toMatchObject({ prompt: "Top attorney?", mentioned: false, position: null, recommended: false });
  });
});

describe("groupPromptOutcomes", () => {
  it("gives each engine its outcome, null where no response, absent where unmentioned", () => {
    const prompts = [
      { id: "p1", text: "Best PI lawyer?", source: "template" as const, is_active: true },
      { id: "p2", text: "Top attorney?", source: "custom" as const, is_active: false },
    ];
    const views = groupPromptOutcomes(RESP, prompts, "brand");
    // p1/openai: brand recommended; other engines have no response for p1 -> null
    expect(views[0].byEngine).toEqual({ openai: "recommended", gemini: null, perplexity: null });
    // p2/gemini: only comp1 mentioned, so main brand is absent
    expect(views[1].byEngine).toEqual({ openai: null, gemini: "absent", perplexity: null });
    expect(views[1]).toMatchObject({ source: "custom", isActive: false });
  });
});

describe("competitorStanding", () => {
  it("ranks by mentions with SOV%, you winning ties, computes recommended", () => {
    const tracked = [
      { id: "brand", name: "My Firm" },
      { id: "comp1", name: "Rival LLP" },
    ];
    const rows = competitorStanding(RESP, tracked, "brand");
    expect(rows.map((r) => r.name)).toEqual(["Rival LLP", "My Firm"]); // comp1 has 2 mentions
    const you = rows.find((r) => r.isYou)!;
    expect(you).toMatchObject({ mentions: 1, recommended: 1, sovPct: 33 }); // 1 of 3 total
    expect(rows[0]).toMatchObject({ mentions: 2, recommended: 1, sovPct: 67 });
  });
});

describe("reportHistory", () => {
  it("blends engines per day, sums counts, deltas vs prior day, newest first", () => {
    const rows: DailyScoreDbRow[] = [
      { date: "2026-07-01", engine: "openai", visibility_score: 40, share_of_voice: 0, mention_count: 2, recommendation_count: 1 },
      { date: "2026-07-01", engine: "gemini", visibility_score: 60, share_of_voice: 0, mention_count: 1, recommendation_count: 0 },
      { date: "2026-07-02", engine: "openai", visibility_score: 80, share_of_voice: 0, mention_count: 3, recommendation_count: 2 },
    ];
    const hist = reportHistory(rows);
    expect(hist.map((r) => r.date)).toEqual(["2026-07-02", "2026-07-01"]); // newest first
    expect(hist[1]).toMatchObject({ score: 50, delta: null, mentions: 3, recommendations: 1 });
    expect(hist[0]).toMatchObject({ score: 80, delta: 30, mentions: 3, recommendations: 2 });
  });
});

describe("buildCitationGaps", () => {
  it("aggregates by normalized domain with brand/competitor presence", () => {
    const comps = new Map([["comp1", "Rival LLP"]]);
    const gaps = buildCitationGaps(RESP, "brand", comps);
    const avvo = gaps.find((g) => g.domain === "avvo.com")!;
    expect(avvo.citedInPrompts).toBe(2); // www stripped, p1 + p2
    expect(avvo.totalPrompts).toBe(2);
    expect(avvo.brandListed).toBe(true); // brand mentioned in p1 which cited avvo
    expect(avvo.competitorsListed).toEqual(["Rival LLP"]);
    const justia = gaps.find((g) => g.domain === "justia.com")!;
    expect(justia.brandListed).toBe(true);
    expect(justia.competitorsListed).toEqual(["Rival LLP"]); // comp1 also in p1
  });
});
