import { describe, expect, it } from "vitest";
import type { EngineName, EngineResult } from "./engines/types";
import { CircuitBreakerOpen, runBrandScan, type ScanDeps } from "./scan";
import type { TrackedBrand } from "./scoring/mentions";

const brand: TrackedBrand = { brandId: "b", name: "Austin Injury Law", aliases: [] };
const comp: TrackedBrand = { brandId: "c", name: "Smith & Jones LLP", aliases: [] };

function fakeResult(engine: EngineName, rawText: string): EngineResult {
  return {
    engine,
    model: "fake",
    rawText,
    citations: ["https://avvo.com/x"],
    latencyMs: 1,
    promptTokens: 10,
    completionTokens: 10,
    costUsd: 0.01,
  };
}

const validExtraction = JSON.stringify({
  entities: [
    { name: "Austin Injury Law", sentiment: "positive", isRecommendation: true },
  ],
  otherFirms: [],
});

function deps(overrides: Partial<ScanDeps> = {}): ScanDeps {
  return {
    callEngine: async (e) => fakeResult(e, "I recommend Austin Injury Law."),
    callExtractionLlm: async () => validExtraction,
    todaySpendUsd: async () => 0,
    maxDailyUsd: 20,
    scanSystemPrompt: "sys",
    ...overrides,
  };
}

describe("runBrandScan", () => {
  it("happy path: all calls made, scores aggregated, cost summed", async () => {
    const out = await runBrandScan(brand, [comp], ["p1", "p2"], deps());
    expect(out.records).toHaveLength(6); // 2 prompts × 3 engines
    expect(out.failedCalls).toBe(0);
    expect(out.totalCostUsd).toBeCloseTo(0.06);
    // brand recommended on every prompt → score 100 per engine
    expect(out.dailyScores.openai.visibilityScore).toBe(100);
    expect(out.dailyScores.openai.topCitations[0].url).toBe("https://avvo.com/x");
  });

  it("engine failure recorded, scan continues", async () => {
    let n = 0;
    const out = await runBrandScan(
      brand,
      [],
      ["p1"],
      deps({
        callEngine: async (e) => {
          n++;
          if (n === 2) throw new Error("gemini down");
          return fakeResult(e, "Austin Injury Law is fine.");
        },
      }),
    );
    expect(out.failedCalls).toBe(1);
    expect(out.records.find((r) => r.error)?.error).toBe("gemini down");
    expect(out.records).toHaveLength(3);
  });

  it("circuit breaker trips on pre-existing spend", async () => {
    await expect(
      runBrandScan(brand, [], ["p1"], deps({ todaySpendUsd: async () => 25 })),
    ).rejects.toThrow(CircuitBreakerOpen);
  });

  it("circuit breaker trips mid-scan when accumulated cost crosses cap", async () => {
    const d = deps({
      callEngine: async (e) => ({ ...fakeResult(e, "x"), costUsd: 10 }),
      maxDailyUsd: 20,
    });
    // call1 ok (0<20), call2 ok (10<20), call3 blocked (20>=20)
    await expect(runBrandScan(brand, [], ["p1"], d)).rejects.toThrow(
      CircuitBreakerOpen,
    );
  });

  it("competitor mentions count toward brand SOV", async () => {
    const out = await runBrandScan(
      brand,
      [comp],
      ["p1"],
      deps({
        callEngine: async (e) =>
          fakeResult(e, "Smith & Jones LLP is best. Austin Injury Law also good."),
        callExtractionLlm: async () =>
          JSON.stringify({
            entities: [
              { name: "Smith & Jones LLP", sentiment: "positive", isRecommendation: true },
              { name: "Austin Injury Law", sentiment: "neutral", isRecommendation: false },
            ],
            otherFirms: [],
          }),
      }),
    );
    expect(out.dailyScores.openai.shareOfVoice).toBe(0.5);
    // brand mentioned but 2nd, not recommended → 0.4 → 40
    expect(out.dailyScores.openai.visibilityScore).toBe(40);
  });
});
