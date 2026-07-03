import { describe, expect, it } from "vitest";
import { promptWeight, shareOfVoice, visibilityScore } from "./score";

const rec = { mentioned: true, first: true, recommended: true };
const first = { mentioned: true, first: true, recommended: false };
const mentioned = { mentioned: true, first: false, recommended: false };
const absent = { mentioned: false, first: false, recommended: false };

describe("promptWeight", () => {
  it("recommended = 1.0", () => expect(promptWeight(rec)).toBe(1.0));
  it("first mention = 0.6", () => expect(promptWeight(first)).toBe(0.6));
  it("mentioned = 0.4", () => expect(promptWeight(mentioned)).toBe(0.4));
  it("absent = 0", () => expect(promptWeight(absent)).toBe(0));
  it("recommended beats first", () =>
    expect(promptWeight({ ...rec, first: true })).toBe(1.0));
});

describe("visibilityScore", () => {
  it("all recommended = 100", () =>
    expect(visibilityScore([rec, rec])).toBe(100));
  it("all absent = 0", () => expect(visibilityScore([absent, absent])).toBe(0));
  it("mixed matches hand-calc: (1 + 0.6 + 0.4 + 0)/4 × 100 = 50", () =>
    expect(visibilityScore([rec, first, mentioned, absent])).toBe(50));
  it("empty prompt list = 0, no NaN", () => expect(visibilityScore([])).toBe(0));
});

describe("shareOfVoice", () => {
  it("half the mentions = 0.5", () => expect(shareOfVoice(3, 6)).toBe(0.5));
  it("no tracked mentions = 0, no NaN", () => expect(shareOfVoice(0, 0)).toBe(0));
  it("all mentions ours = 1", () => expect(shareOfVoice(4, 4)).toBe(1));
});
