// Plan entitlements. Until now nothing enforced these, so Solo and Agency
// delivered identical value and the $100/mo gap bought nothing.
//
// `trial` is the pre-checkout state. The card-required trial runs with the
// real plan already set from the Stripe price, so an Agency trialist gets
// Agency limits; only a signed-up-but-never-checked-out workspace sits at
// `trial`.

export type PlanName = "trial" | "solo" | "agency" | "canceled";

export const BRAND_LIMITS: Record<PlanName, number> = {
  trial: 1,
  solo: 1,
  agency: 10,
  canceled: 0,
};

export function brandLimit(plan: string | null | undefined): number {
  return BRAND_LIMITS[(plan ?? "trial") as PlanName] ?? BRAND_LIMITS.trial;
}

export interface BrandAllowance {
  allowed: boolean;
  limit: number;
  used: number;
  /** Names the problem and the way out; null when allowed. */
  reason: string | null;
}

/** Pure so it can be tested without a database. */
export function checkBrandAllowance(
  plan: string | null | undefined,
  currentBrandCount: number,
): BrandAllowance {
  const limit = brandLimit(plan);
  const allowed = currentBrandCount < limit;

  let reason: string | null = null;
  if (!allowed) {
    reason =
      limit === 0
        ? "This workspace is cancelled, so no new firms can be added. Restart a plan from Billing to continue."
        : limit === 1
          ? "The Solo plan tracks one firm. Upgrade to Agency from Billing to track up to 10."
          : `The Agency plan tracks ${limit} firms and this workspace has ${currentBrandCount}. Remove one, or contact us about a larger plan.`;
  }

  return { allowed, limit, used: currentBrandCount, reason };
}
