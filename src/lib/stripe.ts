import "server-only";
import Stripe from "stripe";

export { PRICE_TO_PLAN, PLAN_PRICES, resolvePlan } from "./stripe-plans";
export type { Plan } from "./stripe-plans";

/** Server-only Stripe client. Secret key never reaches the browser. */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}
