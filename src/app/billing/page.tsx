import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import BackLink from "../back-link";
import { getBrands } from "../dashboard/data";
import Shell from "../dashboard/shell";
import BillingClient from "./billing-client";

export const metadata: Metadata = { title: "Billing — First Chair" };

/** Outside the component: Date.now() in a render body is impure and the
 *  react-hooks/purity rule rejects it. */
function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400_000));
}

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

  const brands = await getBrands();
  const trialDaysLeft = daysUntil(trialEndsAt);

  return (
    // Previously rendered bare, with no shell and therefore no navigation —
    // arriving here was a dead end.
    <Shell
      brandName={brands[0]?.name ?? null}
      brands={brands}
      currentBrandId={brands[0]?.id ?? null}
      plan={plan}
      trialDaysLeft={trialDaysLeft}
    >
      <main className="mx-auto max-w-4xl px-6 py-10">
        <BackLink href="/dashboard" label="Back to dashboard" />
        <h1 className="mt-5 font-display text-4xl text-fg">Billing</h1>
        <BillingClient
          currentPlan={plan}
          trialEndsAt={trialEndsAt}
          referralCode={membership?.workspace_id ?? null}
        />
      </main>
    </Shell>
  );
}
