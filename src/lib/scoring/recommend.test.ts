import { describe, expect, it } from "vitest";
import { recommendFromCitations, type CitationGap } from "./recommend";

const gaps: CitationGap[] = [
  { domain: "avvo.com", citedInPrompts: 6, totalPrompts: 10, brandListed: false, competitorsListed: ["Smith & Jones LLP"] },
  { domain: "justia.com", citedInPrompts: 5, totalPrompts: 10, brandListed: true, competitorsListed: [] },
  { domain: "findlaw.com", citedInPrompts: 2, totalPrompts: 10, brandListed: false, competitorsListed: [] },
  { domain: "rare.com", citedInPrompts: 1, totalPrompts: 10, brandListed: false, competitorsListed: ["X"] },
];

describe("recommendFromCitations", () => {
  const recs = recommendFromCitations(gaps);

  it("skips domains where brand already listed", () => {
    expect(recs.find((r) => r.action.includes("justia"))).toBeUndefined();
  });

  it("skips rarely-cited domains (<2 prompts)", () => {
    expect(recs.find((r) => r.action.includes("rare"))).toBeUndefined();
  });

  it("every recommendation cites the underlying data", () => {
    for (const r of recs) expect(r.evidence).toMatch(/\d+ of \d+ tracked prompts/);
  });

  it("competitor presence raises priority and is named in evidence", () => {
    expect(recs[0].action).toBe("Get listed on avvo.com");
    expect(recs[0].evidence).toContain("Smith & Jones LLP is listed there");
  });

  it("empty input yields empty output", () => {
    expect(recommendFromCitations([])).toEqual([]);
  });
});
