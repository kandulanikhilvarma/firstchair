// Pure plan/price mapping — no secrets, safe to import anywhere (incl. tests).
// The Stripe client itself lives in stripe.ts behind `server-only`.

export type Plan = "solo" | "agency" | "canceled";

/**
 * Maps Stripe price IDs -> our plan enum. Set from the setup script output.
 * Built by filtering out unset envs — otherwise a missing STRIPE_PRICE_* would
 * register an empty-string key and an empty/unknown priceId would grant a plan.
 */
export const PRICE_TO_PLAN: Record<string, "solo" | "agency"> = Object.fromEntries(
  (
    [
      [process.env.STRIPE_PRICE_SOLO_MONTHLY, "solo"],
      [process.env.STRIPE_PRICE_SOLO_ANNUAL, "solo"],
      [process.env.STRIPE_PRICE_AGENCY_MONTHLY, "agency"],
      [process.env.STRIPE_PRICE_AGENCY_ANNUAL, "agency"],
    ] as const
  ).filter(([id]) => id),
);

export const PLAN_PRICES = {
  solo: {
    monthly: process.env.STRIPE_PRICE_SOLO_MONTHLY,
    annual: process.env.STRIPE_PRICE_SOLO_ANNUAL,
  },
  agency: {
    monthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY,
    annual: process.env.STRIPE_PRICE_AGENCY_ANNUAL,
  },
} as const;

/**
 * Resolve the workspace plan from a Stripe subscription's status + price.
 * Only trialing/active on a known price grants a paid plan; everything else
 * (canceled, past_due, unpaid, unknown price) downgrades to "canceled".
 */
export function resolvePlan(status: string, priceId: string): Plan {
  const active = status === "active" || status === "trialing";
  const paidPlan = PRICE_TO_PLAN[priceId];
  return active && paidPlan ? paidPlan : "canceled";
}
