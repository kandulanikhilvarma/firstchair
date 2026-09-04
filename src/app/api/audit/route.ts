import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { callEngine } from "@/lib/engines";
import { callExtractionLlmOpenAI } from "@/lib/engines/extraction-llm";
import { CircuitBreakerOpen, runBrandScan } from "@/lib/scan";
import { expandTemplates } from "@/lib/prompts/templates";
import { renderAuditEmail, sendEmail, type AuditEngineResult } from "@/lib/email";
import type { EngineName } from "@/lib/engines/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const auditRequestSchema = z.object({
  firmName: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  practiceArea: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  // Optional referral tag from the link the lead arrived on. Untrusted, so it's
  // length-capped and only ever stored/echoed, never used to look anything up.
  ref: z.string().trim().max(64).optional(),
});

const AUDIT_PROMPTS = 5;
const MAX_PER_EMAIL_HOUR = 3;
const MAX_DAILY_USD = Number(process.env.MAX_DAILY_LLM_USD ?? 20);
const SCAN_SYSTEM_PROMPT = readFileSync(join(process.cwd(), "prompts", "scan-system-v1.txt"), "utf8");

export async function POST(req: Request) {
  let parsed: z.infer<typeof auditRequestSchema>;
  try {
    parsed = auditRequestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Please fill in all fields with valid values." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: `We're launching the live audit shortly — ${parsed.firmName} is noted, check back soon.` },
      { status: 503 },
    );
  }

  const supabase = createAdminClient();

  // Rate limit per email: cheap abuse guard without a new column (§ lead magnet).
  // ponytail: email-scoped hourly cap; add IP/Turnstile only if abuse shows up.
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await supabase
    .from("audit_leads")
    .select("id", { count: "exact", head: true })
    .eq("email", parsed.email)
    .gte("created_at", hourAgo);
  if ((count ?? 0) >= MAX_PER_EMAIL_HOUR) {
    return NextResponse.json(
      { error: "You've run a few audits recently — please try again in an hour." },
      { status: 429 },
    );
  }

  const prompts = expandTemplates({ city: parsed.city, practice: parsed.practiceArea }).slice(0, AUDIT_PROMPTS);
  const brand = { brandId: "audit", name: parsed.firmName, aliases: [parsed.firmName] };

  let outcome;
  try {
    outcome = await runBrandScan(brand, [], prompts, {
      callEngine,
      callExtractionLlm: callExtractionLlmOpenAI,
      // Audit calls aren't persisted, so they don't count toward the breaker;
      // the read still trips it if the day's tracked scans already hit the cap.
      todaySpendUsd: async () => {
        const { data } = await supabase
          .from("engine_responses")
          .select("cost_usd")
          .gte("created_at", new Date().toISOString().slice(0, 10) + "T00:00:00.000Z");
        return (data ?? []).reduce((s, r) => s + (r.cost_usd ?? 0), 0);
      },
      maxDailyUsd: MAX_DAILY_USD,
      scanSystemPrompt: SCAN_SYSTEM_PROMPT,
    });
  } catch (err) {
    if (err instanceof CircuitBreakerOpen) {
      return NextResponse.json({ error: "Our audit engine is at capacity today — please try tomorrow." }, { status: 503 });
    }
    throw err;
  }

  const engines: AuditEngineResult[] = Object.entries(outcome.dailyScores).map(([engine, s]) => {
    const positions = outcome.records
      .filter((r) => r.engine === engine)
      .flatMap((r) => r.mentions.filter((m) => m.brandId === "audit").map((m) => m.position));
    return {
      engine: engine as EngineName,
      visibilityScore: Math.round(s.visibilityScore),
      mentionedInPrompts: s.mentionCount,
      totalPrompts: prompts.length,
      recommended: s.recommendationCount,
      bestPosition: positions.length ? Math.min(...positions) : null,
    };
  });
  const answered = engines.filter((e) => e.mentionedInPrompts > 0 || e.visibilityScore > 0);
  const overallScore = answered.length
    ? Math.round(answered.reduce((s, e) => s + e.visibilityScore, 0) / answered.length)
    : 0;

  const result = { firmName: parsed.firmName, city: parsed.city, practiceArea: parsed.practiceArea, overallScore, engines };

  await supabase.from("audit_leads").insert({
    email: parsed.email,
    firm_name: parsed.firmName,
    city: parsed.city,
    practice_area: parsed.practiceArea,
    result,
    referred_by: parsed.ref ?? null,
  });

  const { subject, html } = renderAuditEmail(result);
  try {
    await sendEmail(parsed.email, subject, html);
  } catch {
    // Email failure shouldn't lose the lead or block the on-screen result.
  }

  return NextResponse.json({ result, message: `We emailed your full audit to ${parsed.email}.` });
}
