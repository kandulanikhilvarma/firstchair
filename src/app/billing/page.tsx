import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import BillingClient from "./billing-client";

export const metadata: Metadata = { title: "Billing — Rankwell" };

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy guarantees a user; membership -> current plan for the UI
  const { data: membership } = await supabase
    .from("members")
    .select("workspace_id")
    .eq("user_id", user!.id)
    .limit(1)
    .maybeSingle();

  let plan = "trial";
  let trialEndsAt: string | null = null;
  if (membership) {
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("plan, trial_ends_at")
      .eq("id", membership.workspace_id)
      .single();
    plan = workspace?.plan ?? "trial";
    trialEndsAt = workspace?.trial_ends_at ?? null;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-heading text-3xl font-bold text-primary-900">Billing</h1>
      <BillingClient currentPlan={plan} trialEndsAt={trialEndsAt} />
    </main>
  );
}
