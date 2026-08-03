"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkBrandAllowance } from "@/lib/plan";

const SetupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(80),
  practice: z.string().trim().min(1).max(80),
  aliases: z.array(z.string().trim().min(1).max(120)).max(10),
  competitors: z.array(z.string().trim().min(1).max(120)).max(5),
  prompts: z
    .array(z.object({ text: z.string().trim().min(1).max(500), active: z.boolean() }))
    .min(1)
    .max(40),
});

export type SetupInput = z.infer<typeof SetupSchema>;

/**
 * Persist the onboarding wizard: main brand, competitor brands, prompts.
 * Runs as the logged-in user — RLS enforces workspace membership on every
 * insert (brands/prompts policies are FOR ALL by membership).
 */
export async function saveOnboarding(
  input: SetupInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = SetupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input. Check the fields and retry." };
  const { name, city, practice, aliases, competitors, prompts } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: membership } = await supabase
    .from("members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!membership) return { ok: false, error: "No workspace found for this account." };

  // Every add-brand path routes through here, so the plan limit is enforced
  // once, at the write, rather than in each caller's UI.
  const [{ data: workspace }, { count: brandCount }] = await Promise.all([
    supabase.from("workspaces").select("plan").eq("id", membership.workspace_id).maybeSingle(),
    supabase
      .from("brands")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", membership.workspace_id)
      .is("is_competitor_of", null),
  ]);

  const allowance = checkBrandAllowance(workspace?.plan, brandCount ?? 0);
  if (!allowance.allowed) return { ok: false, error: allowance.reason ?? "Brand limit reached." };

  const { data: brand, error: brandErr } = await supabase
    .from("brands")
    .insert({
      workspace_id: membership.workspace_id,
      name,
      aliases,
      city,
      vertical_meta: { practice },
    })
    .select("id")
    .single();
  if (brandErr) return { ok: false, error: `Could not save your firm: ${brandErr.message}` };

  if (competitors.length > 0) {
    const { error } = await supabase.from("brands").insert(
      competitors.map((c) => ({
        workspace_id: membership.workspace_id,
        name: c,
        city,
        vertical_meta: { practice },
        is_competitor_of: brand.id,
      })),
    );
    if (error) return { ok: false, error: `Could not save competitors: ${error.message}` };
  }

  const { error: promptErr } = await supabase.from("prompts").insert(
    prompts.map((p) => ({
      brand_id: brand.id,
      text: p.text,
      source: "template" as const,
      is_active: p.active,
    })),
  );
  if (promptErr) return { ok: false, error: `Could not save prompts: ${promptErr.message}` };

  return { ok: true };
}
