import { beforeAll, describe, expect, it, vi } from "vitest";

// price env must be set before stripe.ts builds PRICE_TO_PLAN at import
beforeAll(() => {
  vi.stubEnv("STRIPE_PRICE_SOLO_MONTHLY", "price_solo_m");
  vi.stubEnv("STRIPE_PRICE_AGENCY_MONTHLY", "price_agency_m");
});

describe("resolvePlan", () => {
  it("grants the paid plan for active + known price", async () => {
    const { resolvePlan } = await import("./stripe-plans");
    expect(resolvePlan("active", "price_solo_m")).toBe("solo");
    expect(resolvePlan("trialing", "price_agency_m")).toBe("agency");
  });

  it("cancels on inactive status even with a known price", async () => {
    const { resolvePlan } = await import("./stripe-plans");
    expect(resolvePlan("past_due", "price_solo_m")).toBe("canceled");
    expect(resolvePlan("canceled", "price_agency_m")).toBe("canceled");
    expect(resolvePlan("unpaid", "price_solo_m")).toBe("canceled");
  });

  it("cancels on unknown/empty price even when active", async () => {
    const { resolvePlan } = await import("./stripe-plans");
    expect(resolvePlan("active", "price_bogus")).toBe("canceled");
    expect(resolvePlan("active", "")).toBe("canceled");
  });
});
