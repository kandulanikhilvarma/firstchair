"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/* Everything here runs as the signed-in user, so RLS decides what may be
   touched. A brand id from another workspace simply matches no rows. */

const Result = {
  ok: () => ({ ok: true as const }),
  fail: (error: string) => ({ ok: false as const, error }),
};

export type ActionResult = { ok: true } | { ok: false; error: string };

const DetailsSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(80),
  practice: z.string().trim().min(1).max(80),
  aliases: z.array(z.string().trim().min(1).max(120)).max(10),
});

export async function updateBrandDetails(
  input: z.infer<typeof DetailsSchema>,
): Promise<ActionResult> {
  const parsed = DetailsSchema.safeParse(input);
  if (!parsed.success) return Result.fail("Check the firm name, city and practice area.");
  const { brandId, name, city, practice, aliases } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .update({ name, city, aliases, vertical_meta: { practice } })
    .eq("id", brandId);
  if (error) return Result.fail(`Could not save: ${error.message}`);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return Result.ok();
}

export async function setPromptActive(
  promptId: string,
  active: boolean,
): Promise<ActionResult> {
  if (!z.string().uuid().safeParse(promptId).success) return Result.fail("Unknown prompt.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("prompts")
    .update({ is_active: active })
    .eq("id", promptId);
  if (error) return Result.fail(`Could not update that question: ${error.message}`);

  revalidatePath("/settings");
  return Result.ok();
}

const CompetitorSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
});

export async function addCompetitor(
  input: z.infer<typeof CompetitorSchema>,
): Promise<ActionResult> {
  const parsed = CompetitorSchema.safeParse(input);
  if (!parsed.success) return Result.fail("Enter a competitor name.");
  const { brandId, name } = parsed.data;

  const supabase = await createClient();

  const { data: parent } = await supabase
    .from("brands")
    .select("workspace_id, city, vertical_meta")
    .eq("id", brandId)
    .maybeSingle();
  if (!parent) return Result.fail("That firm no longer exists.");

  // Five is the tracked-competitor cap the product promises.
  const { count } = await supabase
    .from("brands")
    .select("id", { count: "exact", head: true })
    .eq("is_competitor_of", brandId);
  if ((count ?? 0) >= 5) {
    return Result.fail("Five competitors is the limit. Remove one before adding another.");
  }

  const { error } = await supabase.from("brands").insert({
    workspace_id: parent.workspace_id,
    name,
    city: parent.city,
    vertical_meta: parent.vertical_meta,
    is_competitor_of: brandId,
  });
  if (error) return Result.fail(`Could not add competitor: ${error.message}`);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return Result.ok();
}

export async function removeCompetitor(competitorId: string): Promise<ActionResult> {
  if (!z.string().uuid().safeParse(competitorId).success) return Result.fail("Unknown competitor.");

  const supabase = await createClient();
  // Guarded to competitor rows so this can never delete a tracked firm.
  const { error } = await supabase
    .from("brands")
    .delete()
    .eq("id", competitorId)
    .not("is_competitor_of", "is", null);
  if (error) return Result.fail(`Could not remove competitor: ${error.message}`);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return Result.ok();
}
