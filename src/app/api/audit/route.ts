import { NextResponse } from "next/server";
import { z } from "zod";

const auditRequestSchema = z.object({
  firmName: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  practiceArea: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
});

export type AuditRequest = z.infer<typeof auditRequestSchema>;

// ponytail: rate limiting + lead persistence + scan land with Supabase keys (F1, Day 11)
export async function POST(req: Request) {
  let parsed: AuditRequest;
  try {
    parsed = auditRequestSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "Please fill in all fields with valid values." },
      { status: 400 },
    );
  }

  const enginesConfigured =
    process.env.OPENAI_API_KEY &&
    process.env.GEMINI_API_KEY &&
    process.env.PERPLEXITY_API_KEY;

  if (!enginesConfigured) {
    return NextResponse.json(
      {
        error: `We're launching the live audit shortly — ${parsed.firmName} is noted, check back soon.`,
      },
      { status: 503 },
    );
  }

  // Real scan path lands here (Day 11): rate-limit by IP, insert audit_leads,
  // run 5 prompts × 3 engines progressively, email via Resend.
  return NextResponse.json(
    { error: "Audit engine not enabled yet." },
    { status: 503 },
  );
}
