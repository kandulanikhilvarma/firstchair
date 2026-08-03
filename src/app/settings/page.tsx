import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { brandLimit } from "@/lib/plan";
import { getBrands } from "../dashboard/data";
import Shell from "../dashboard/shell";
import SettingsClient from "./settings-client";

export const metadata: Metadata = { title: "Settings — First Chair" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand: requested } = await searchParams;
  const supabase = await createClient();

  const [brands, { data: workspaceRows }] = await Promise.all([
    getBrands(),
    supabase.from("workspaces").select("plan").limit(1),
  ]);
  const plan = workspaceRows?.[0]?.plan ?? null;
  const brand = brands.find((b) => b.id === requested) ?? brands[0];

  const shellProps = { brands, currentBrandId: brand?.id ?? null, plan, trialDaysLeft: null };

  if (!brand) {
    return (
      <Shell brandName={null} {...shellProps}>
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="font-display text-3xl text-ink-900">Nothing to configure yet</h1>
          <p className="mt-3 text-ink-700">
            Add your first firm and its questions, then this page lets you change them.
          </p>
          <Link
            href="/onboarding"
            className="mt-6 inline-block bg-ox-700 px-6 py-3 font-semibold text-canary-100 hover:bg-ox-900"
          >
            Add a firm
          </Link>
        </div>
      </Shell>
    );
  }

  const [{ data: detail }, { data: competitors }, { data: prompts }] = await Promise.all([
    supabase.from("brands").select("name, city, aliases, vertical_meta").eq("id", brand.id).maybeSingle(),
    supabase.from("brands").select("id, name").eq("is_competitor_of", brand.id).order("created_at"),
    supabase.from("prompts").select("id, text, is_active").eq("brand_id", brand.id).order("created_at"),
  ]);

  const practice =
    detail && typeof detail.vertical_meta === "object" && detail.vertical_meta !== null
      ? String((detail.vertical_meta as Record<string, unknown>).practice ?? "")
      : "";

  const limit = brandLimit(plan);

  return (
    <Shell brandName={brand.name} {...shellProps}>
      <div className="border-b border-border bg-surface-0 px-6 py-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-3xl text-ink-900">Settings</h1>
          <p className="mt-2 text-ink-700">
            Changes apply from the next daily scan.{" "}
            <span className="tnum">
              {brands.length} of {limit}
            </span>{" "}
            firms used on your plan.
          </p>
        </div>
      </div>

      <SettingsClient
        brandId={brand.id}
        name={detail?.name ?? brand.name}
        city={detail?.city ?? ""}
        practice={practice}
        aliases={detail?.aliases ?? []}
        competitors={competitors ?? []}
        prompts={prompts ?? []}
      />
    </Shell>
  );
}
