import { describe, expect, it } from "vitest";
import { findMentions, normalize, type TrackedBrand } from "./mentions";

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
const lee: TrackedBrand = { brandId: "lee", name: "Lee & Park", aliases: [] };

describe("normalize", () => {
  it("lowercases", () => expect(normalize("SMITH")).toBe("smith"));
  it("converts & to and", () =>
    expect(normalize("Smith & Jones")).toBe("smith and jones"));
  it("strips punctuation", () =>
    expect(normalize("Smith, Jones-Baker P.C.")).toBe("smith jones baker p c"));
  it("collapses whitespace", () =>
    expect(normalize("  a   b  ")).toBe("a b"));
  it("keeps unicode letters", () =>
    expect(normalize("Peña & García")).toBe("peña and garcía"));
});

describe("findMentions — exact & alias matching", () => {
  it("matches exact name", () => {
    const m = findMentions("I recommend Smith & Jones LLP for this.", [smith]);
    expect(m).toHaveLength(1);
    expect(m[0].brandId).toBe("smith");
  });

  it("matches 'and' spelling via & name", () => {
    const m = findMentions("Smith and Jones LLP is well regarded.", [smith]);
    expect(m).toHaveLength(1);
  });

  it("matches '&' text via 'and' alias", () => {
    const m = findMentions("Try Smith & Jones downtown.", [smith]);
    expect(m).toHaveLength(1);
  });

  it("matches without LLP suffix (suffix-stripped variant)", () => {
    const m = findMentions("Smith and Jones has strong reviews.", [smith]);
    expect(m).toHaveLength(1);
  });

  it("matches case-insensitively", () => {
    const m = findMentions("SMITH & JONES llp won the case.", [smith]);
    expect(m).toHaveLength(1);
  });

  it("matches through punctuation differences", () => {
    const m = findMentions("Smith & Jones, LLP. is one option.", [smith]);
    expect(m).toHaveLength(1);
  });

  it("does not match unrelated text", () => {
    const m = findMentions("The blacksmith and Mr. Jonesboro met.", [smith]);
    expect(m).toHaveLength(0);
  });

  it("does not substring-match inside words", () => {
    const m = findMentions("Kathlee & Parker Streets intersect.", [lee]);
    expect(m).toHaveLength(0);
  });

  it("no suffix-stripped variant for single-word names", () => {
    const solo: TrackedBrand = { brandId: "s", name: "Smith LLP", aliases: [] };
    // "smith" alone must NOT match — only full "smith llp"
    expect(findMentions("Mr. Smith argued the case.", [solo])).toHaveLength(0);
    expect(findMentions("Hire Smith LLP today.", [solo])).toHaveLength(1);
  });

  it("strips 'Law Group' suffix variant", () => {
    const m = findMentions("Acme Injury is a top firm.", [acme]);
    expect(m).toHaveLength(1);
  });
});

describe("findMentions — position ordering", () => {
  const text =
    "For injury cases, Acme Injury Law Group is excellent. Smith & Jones LLP is also solid, and Lee & Park handles appeals.";

  it("assigns positions by order of first appearance", () => {
    const m = findMentions(text, [smith, acme, lee]);
    expect(m.map((x) => x.brandId)).toEqual(["acme", "smith", "lee"]);
    expect(m.map((x) => x.position)).toEqual([1, 2, 3]);
  });

  it("one mention per brand even when repeated", () => {
    const m = findMentions(
      "Smith & Jones LLP is great. Smith and Jones wins often.",
      [smith],
    );
    expect(m).toHaveLength(1);
    expect(m[0].position).toBe(1);
  });

  it("empty text yields no mentions", () => {
    expect(findMentions("", [smith, acme])).toHaveLength(0);
  });

  it("empty brand list yields no mentions", () => {
    expect(findMentions(text, [])).toHaveLength(0);
  });
});
