import { describe, expect, it } from "vitest";
import {
  buildExtractionUserPrompt,
  extractMentions,
  parseExtraction,
} from "./extract";
import type { TrackedBrand } from "./mentions";

const smith: TrackedBrand = {
  brandId: "smith",
  name: "Smith & Jones LLP",
  aliases: ["Smith and Jones"],
};
const acme: TrackedBrand = {
  brandId: "acme",
  name: "Acme Injury Law Group",
  aliases: [],
};

const validJson = JSON.stringify({
  entities: [
    { name: "Smith & Jones LLP", sentiment: "positive", isRecommendation: true },
  ],
  otherFirms: ["Baker Legal"],
});

describe("parseExtraction", () => {
  it("parses valid JSON", () => {
    const r = parseExtraction(validJson);
    expect(r?.entities[0].isRecommendation).toBe(true);
  });

  it("strips markdown fences", () => {
    expect(parseExtraction("```json\n" + validJson + "\n```")).not.toBeNull();
  });

  it("rejects malformed JSON", () => {
    expect(parseExtraction("not json {")).toBeNull();
  });

  it("rejects wrong schema", () => {
    expect(parseExtraction('{"entities":[{"name":1}]}')).toBeNull();
  });

  it("rejects invalid sentiment value", () => {
    expect(
      parseExtraction(
        '{"entities":[{"name":"x","sentiment":"great","isRecommendation":true}]}',
      ),
    ).toBeNull();
  });
});

describe("extractMentions", () => {
  const text = "I recommend Smith & Jones LLP. Acme Injury Law Group also exists.";

  it("enriches deterministic mentions with LLM sentiment/recommendation", async () => {
    const out = await extractMentions(text, [smith, acme], async () =>
      JSON.stringify({
        entities: [
          { name: "Smith & Jones LLP", sentiment: "positive", isRecommendation: true },
          { name: "Acme Injury Law Group", sentiment: "neutral", isRecommendation: false },
        ],
        otherFirms: [],
      }),
    );
    expect(out).toHaveLength(2);
    const s = out.find((m) => m.brandId === "smith")!;
    expect(s.isRecommendation).toBe(true);
    expect(s.sentiment).toBe("positive");
    expect(s.needsReview).toBe(false);
    expect(s.position).toBe(1);
  });

  it("falls back to deterministic-only with needs_review on persistent bad JSON", async () => {
    let calls = 0;
    const out = await extractMentions(text, [smith], async () => {
      calls++;
      return "garbage";
    });
    expect(calls).toBe(2); // one retry
    expect(out).toHaveLength(1);
    expect(out[0].needsReview).toBe(true);
    expect(out[0].sentiment).toBeNull();
    expect(out[0].isRecommendation).toBe(false);
  });

  it("recovers when retry succeeds", async () => {
    let calls = 0;
    const out = await extractMentions(text, [smith], async () => {
      calls++;
      return calls === 1 ? "garbage" : validJson;
    });
    expect(out[0].needsReview).toBe(false);
    expect(out[0].isRecommendation).toBe(true);
  });

  it("survives LLM call throwing", async () => {
    const out = await extractMentions(text, [smith], async () => {
      throw new Error("API down");
    });
    expect(out[0].needsReview).toBe(true);
  });

  it("skips LLM entirely when no deterministic mentions", async () => {
    let called = false;
    const out = await extractMentions("Nothing relevant here.", [smith], async () => {
      called = true;
      return validJson;
    });
    expect(out).toHaveLength(0);
    expect(called).toBe(false); // no wasted LLM spend
  });

  it("ignores LLM entities not deterministically found (untrusted output)", async () => {
    const out = await extractMentions("Only Smith & Jones LLP here.", [smith, acme], async () =>
      JSON.stringify({
        entities: [
          { name: "Smith & Jones LLP", sentiment: "neutral", isRecommendation: false },
          { name: "Acme Injury Law Group", sentiment: "positive", isRecommendation: true },
        ],
        otherFirms: [],
      }),
    );
    expect(out).toHaveLength(1);
    expect(out[0].brandId).toBe("smith");
  });

  it("user prompt wraps answer as data with tracked list", () => {
    const p = buildExtractionUserPrompt("some answer", ["A", "B"]);
    expect(p).toContain("- A");
    expect(p).toContain('"""\nsome answer\n"""');
  });
});
