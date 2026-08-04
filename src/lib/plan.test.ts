import { describe, expect, it } from "vitest";
import { brandLimit, checkBrandAllowance } from "./plan";

describe("brandLimit", () => {
  it("gives Agency ten and Solo one", () => {
    expect(brandLimit("agency")).toBe(10);
    expect(brandLimit("solo")).toBe(1);
  });

  it("treats unknown or missing plans as trial, never unlimited", () => {
    expect(brandLimit(null)).toBe(1);
    expect(brandLimit(undefined)).toBe(1);
    expect(brandLimit("nonsense")).toBe(1);
  });

  it("gives a cancelled workspace nothing", () => {
    expect(brandLimit("canceled")).toBe(0);
  });
});

describe("checkBrandAllowance", () => {
  it("allows the first firm on Solo and blocks the second", () => {
    expect(checkBrandAllowance("solo", 0).allowed).toBe(true);
    expect(checkBrandAllowance("solo", 1).allowed).toBe(false);
  });

  it("allows Agency up to ten, blocking the eleventh", () => {
    expect(checkBrandAllowance("agency", 9).allowed).toBe(true);
    expect(checkBrandAllowance("agency", 10).allowed).toBe(false);
  });

  it("blocks a cancelled workspace even at zero brands", () => {
    expect(checkBrandAllowance("canceled", 0).allowed).toBe(false);
  });

  it("points a blocked Solo user at the upgrade", () => {
    const { reason } = checkBrandAllowance("solo", 1);
    expect(reason).toMatch(/Agency/);
  });

  it("reports usage alongside the verdict", () => {
    expect(checkBrandAllowance("agency", 3)).toMatchObject({ limit: 10, used: 3, reason: null });
  });
});
