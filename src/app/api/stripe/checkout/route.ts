import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, PLAN_PRICES } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const Body = z.object({
  plan: z.enum(["solo", "agency"]),
  interval: z.enum(["monthly", "annual"]),
});

/** Start a subscription checkout: 7-day card-required trial, webhook sets plan. */
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid plan" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const { data: membership } = await supabase
    .from("members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: "no workspace" }, { status: 400 });

  const priceId = PLAN_PRICES[parsed.data.plan][parsed.data.interval];
  if (!priceId) return NextResponse.json({ error: "price not configured" }, { status: 500 });

  const stripe = getStripe();
  const admin = createAdminClient();

  // reuse the workspace's Stripe customer, or make one and store it
  const { data: workspace } = await admin
    .from("workspaces")
    .select("stripe_customer_id")
    .eq("id", membership.workspace_id)
    .single();

  let customerId = workspace?.stripe_customer_id ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { workspace_id: membership.workspace_id },
    });
    customerId = customer.id;
    await admin
      .from("workspaces")
      .update({ stripe_customer_id: customerId })
      .eq("id", membership.workspace_id);
  }

  const origin = new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 7 },
    // card required up front even during trial (master plan)
    payment_method_collection: "always",
    client_reference_id: membership.workspace_id,
    success_url: `${origin}/dashboard?upgraded=1`,
    cancel_url: `${origin}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
