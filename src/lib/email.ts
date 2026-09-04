// Transactional email: pure HTML builders (unit-tested) + a thin Resend send
// wrapper. No react-email — a couple of templates don't justify the dependency.
// LLM-derived numbers only; firm/city are user input rendered as text.

import { ENGINE_LABELS } from "./seed";
import type { EngineName } from "./engines/types";

const FROM = process.env.EMAIL_FROM ?? "First Chair <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rankwell-seven.vercel.app";

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

const shell = (title: string, inner: string) => `
<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1b1a17">
  <h1 style="font-size:20px;color:#0b5a52;margin:0 0 4px">${esc(title)}</h1>
  ${inner}
  <p style="font-size:12px;color:#55534b;margin-top:24px;border-top:1px solid #e2e0d9;padding-top:12px">
    First Chair. AI visibility for law firms. Scores from ChatGPT, Gemini and Perplexity.
  </p>
</div>`;

export interface AuditEngineResult {
  engine: EngineName;
  visibilityScore: number;
  mentionedInPrompts: number;
  totalPrompts: number;
  recommended: number;
  bestPosition: number | null;
}

export interface AuditEmailInput {
  firmName: string;
  city: string;
  practiceArea: string;
  overallScore: number;
  engines: AuditEngineResult[];
}

export function renderAuditEmail(a: AuditEmailInput): { subject: string; html: string } {
  const rows = a.engines
    .map(
      (e) => `
    <tr>
      <td style="padding:8px 0;font-weight:600">${ENGINE_LABELS[e.engine]}</td>
      <td style="padding:8px 0;text-align:right;font-variant-numeric:tabular-nums">${e.visibilityScore}/100</td>
      <td style="padding:8px 0;text-align:right;color:#55534b">${e.mentionedInPrompts}/${e.totalPrompts} prompts${
        e.bestPosition ? ` · best #${e.bestPosition}` : ""
      }</td>
    </tr>`,
    )
    .join("");
  const inner = `
    <p style="font-size:14px">Here's how the AI assistants talk about <strong>${esc(
      a.firmName,
    )}</strong> for ${esc(a.practiceArea)} in ${esc(a.city)}.</p>
    <p style="font-size:32px;font-weight:700;color:#0b5a52;margin:8px 0">${a.overallScore}<span style="font-size:16px;color:#55534b">/100 visibility</span></p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
    <a href="${APP_URL}/login" style="display:inline-block;margin-top:16px;background:#0b5a52;color:#fff;text-decoration:none;padding:10px 18px;border-radius:2px;font-weight:600">Track this daily. Start free trial</a>`;
  return { subject: `${a.firmName}: ${a.overallScore}/100 AI visibility`, html: shell("Your AI visibility audit", inner) };
}

export interface WeeklyEmailInput {
  firmName: string;
  score: number;
  delta: number;
  mentionRate: number; // 0..1 across latest scan
  topRecommendation: string | null;
}

export function renderWeeklyEmail(w: WeeklyEmailInput): { subject: string; html: string } {
  const arrow = w.delta > 0 ? "▲" : w.delta < 0 ? "▼" : "–";
  const color = w.delta > 0 ? "#2f7a4e" : w.delta < 0 ? "#b23b47" : "#55534b";
  const inner = `
    <p style="font-size:14px">This week for <strong>${esc(w.firmName)}</strong>:</p>
    <p style="font-size:32px;font-weight:700;color:#0b5a52;margin:8px 0">${w.score}<span style="font-size:16px;color:#55534b">/100</span>
      <span style="font-size:16px;color:${color};margin-left:8px">${arrow} ${w.delta >= 0 ? "+" : ""}${w.delta}</span></p>
    <p style="font-size:14px;color:#55534b">Mentioned in ${Math.round(w.mentionRate * 100)}% of tracked prompts.</p>
    ${w.topRecommendation ? `<p style="font-size:14px"><strong>Fix first:</strong> ${esc(w.topRecommendation)}</p>` : ""}
    <a href="${APP_URL}/dashboard" style="display:inline-block;margin-top:16px;background:#0b5a52;color:#fff;text-decoration:none;padding:10px 18px;border-radius:2px;font-weight:600">View dashboard</a>`;
  return {
    subject: `${w.firmName}: ${w.score}/100 (${w.delta >= 0 ? "+" : ""}${w.delta} this week)`,
    html: shell("Your weekly AI visibility report", inner),
  };
}

/** Sends via Resend. No-ops (returns false) when RESEND_API_KEY is unset. */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const { Resend } = await import("resend");
  const { error } = await new Resend(key).emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(`resend: ${error.message}`);
  return true;
}
