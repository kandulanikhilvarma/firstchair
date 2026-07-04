import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Open the Stripe customer portal so the user can manage or cancel. */
export async function POST(request: Request) {
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

  const admin = createAdminClient();
  const { data: workspace } = await admin
    .from("workspaces")
    .select("stripe_customer_id")
    .eq("id", membership.workspace_id)
    .single();
  if (!workspace?.stripe_customer_id) {
    return NextResponse.json({ error: "no subscription yet" }, { status: 400 });
  }

  const stripe = getStripe();
  const origin = new URL(request.url).origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: workspace.stripe_customer_id,
    return_url: `${origin}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
