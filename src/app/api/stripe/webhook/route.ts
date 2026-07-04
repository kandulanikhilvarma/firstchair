import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, resolvePlan } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * The ONLY writer of workspace.plan (master plan: Stripe state via verified
 * webhooks only). Signature-checked; never trust the client for plan state.
 */
export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "not configured" }, { status: 400 });

  const raw = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: `bad signature: ${String(err)}` }, { status: 400 });
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const priceId = sub.items.data[0]?.price.id ?? "";
    const plan = resolvePlan(sub.status, priceId);

    const admin = createAdminClient();
    const { error } = await admin
      .from("workspaces")
      .update({ plan })
      .eq("stripe_customer_id", customerId);
    if (error) {
      return NextResponse.json({ error: `db update failed: ${error.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
