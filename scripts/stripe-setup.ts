// One-time: create Solo/Agency products + monthly/annual prices in Stripe
// (test mode), then print the STRIPE_PRICE_* env lines to paste into
// .env.local (and Vercel). Idempotent by product lookup_key-ish name check.
// Usage: npx tsx --env-file=.env.local scripts/stripe-setup.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Pricing (master plan): Solo $49/mo, Agency $149/mo, annual = 2 months free.
const PLANS = [
  { key: "solo", name: "Rankwell Solo", monthly: 4900, annual: 49000 },
  { key: "agency", name: "Rankwell Agency", monthly: 14900, annual: 149000 },
] as const;

async function findOrCreateProduct(name: string) {
  const existing = await stripe.products.search({ query: `name:'${name}'` });
  if (existing.data[0]) return existing.data[0];
  return stripe.products.create({ name });
}

async function findOrCreatePrice(
  productId: string,
  amount: number,
  interval: "month" | "year",
) {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  const hit = prices.data.find(
    (p) => p.unit_amount === amount && p.recurring?.interval === interval,
  );
  if (hit) return hit;
  return stripe.prices.create({
    product: productId,
    unit_amount: amount,
    currency: "usd",
    recurring: { interval },
  });
}

async function main() {
  const lines: string[] = [];
  for (const plan of PLANS) {
    const product = await findOrCreateProduct(plan.name);
    const monthly = await findOrCreatePrice(product.id, plan.monthly, "month");
    const annual = await findOrCreatePrice(product.id, plan.annual, "year");
    lines.push(`STRIPE_PRICE_${plan.key.toUpperCase()}_MONTHLY=${monthly.id}`);
    lines.push(`STRIPE_PRICE_${plan.key.toUpperCase()}_ANNUAL=${annual.id}`);
  }
  console.log("\nAdd these to .env.local and Vercel env:\n");
  console.log(lines.join("\n"));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
