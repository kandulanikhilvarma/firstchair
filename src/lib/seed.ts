// Deterministic seeded demo data — feeds the dashboard until Supabase lands.
// Same output every render (mulberry32 PRNG, fixed seed) so numbers are stable
// across reloads and screenshots.

import type { EngineName } from "./engines/types";

export const DEMO_BRAND = "Austin Injury Law";
export const DEMO_COMPETITORS = [
  "Smith & Jones LLP",
  "Lone Star Legal",
  "Hill Country Attorneys",
  "Bruckner Law Group",
  "Trevino & Associates",
];

export const ENGINES: EngineName[] = ["openai", "gemini", "perplexity"];
export const ENGINE_LABELS: Record<EngineName, string> = {
  openai: "ChatGPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface TrendPoint {
  date: string; // YYYY-MM-DD
  openai: number;
  gemini: number;
  perplexity: number;
}

/** 30 days of per-engine visibility scores with a gentle upward trend. */
export function seedTrend(): TrendPoint[] {
  const rand = mulberry32(42);
  const base: Record<EngineName, number> = { openai: 48, gemini: 58, perplexity: 41 };
  const points: TrendPoint[] = [];
  const today = new Date("2026-07-04");
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const drift = (29 - i) * 0.25; // slow climb
    const row = { date: d.toISOString().slice(0, 10) } as TrendPoint;
    for (const e of ENGINES) {
      row[e] = Math.round(
        Math.min(100, Math.max(0, base[e] + drift + (rand() - 0.5) * 8)),
      );
    }
    points.push(row);
  }
  return points;
}

export interface SovSlice {
  name: string;
  mentions: number;
}

export function seedShareOfVoice(): SovSlice[] {
  return [
    { name: DEMO_BRAND, mentions: 34 },
    { name: DEMO_COMPETITORS[0], mentions: 28 },
    { name: DEMO_COMPETITORS[1], mentions: 17 },
    { name: DEMO_COMPETITORS[2], mentions: 11 },
    { name: DEMO_COMPETITORS[3], mentions: 7 },
    { name: DEMO_COMPETITORS[4], mentions: 5 },
  ];
}

export interface PromptRow {
  prompt: string;
  engine: EngineName;
  mentioned: boolean;
  position: number | null;
  sentiment: "positive" | "neutral" | "negative" | null;
  recommended: boolean;
}

const DEMO_PROMPTS = [
  "Who is the best personal injury lawyer in Austin?",
  "Best car accident attorney in Austin",
  "Can you recommend a good personal injury lawyer in Austin?",
  "I need a personal injury attorney in Austin — who should I call?",
  "Compare the best personal injury law firms in Austin",
  "Which Austin personal injury lawyers have the best reviews?",
  "Should I hire a personal injury lawyer in Austin or handle it myself?",
  "How much does a personal injury lawyer cost in Austin?",
  "Best personal injury lawyer near downtown Austin",
  "According to online reviews, who is the best personal injury lawyer in Austin?",
];

/** Latest scan's per-prompt results across engines. */
export function seedPromptRows(): PromptRow[] {
  const rand = mulberry32(7);
  const rows: PromptRow[] = [];
  for (const prompt of DEMO_PROMPTS) {
    for (const engine of ENGINES) {
      const r = rand();
      const mentioned = r > 0.35;
      const recommended = mentioned && r > 0.8;
      rows.push({
        prompt,
        engine,
        mentioned,
        position: mentioned ? 1 + Math.floor(rand() * 4) : null,
        sentiment: mentioned ? (rand() > 0.25 ? "positive" : "neutral") : null,
        recommended,
      });
    }
  }
  return rows;
}

export interface CitationRow {
  domain: string;
  citedInPrompts: number; // of 10
  brandListed: boolean;
  competitorsListed: string[];
}

export function seedCitations(): CitationRow[] {
  return [
    { domain: "avvo.com", citedInPrompts: 6, brandListed: false, competitorsListed: ["Smith & Jones LLP", "Lone Star Legal"] },
    { domain: "justia.com", citedInPrompts: 5, brandListed: true, competitorsListed: ["Smith & Jones LLP"] },
    { domain: "superlawyers.com", citedInPrompts: 4, brandListed: false, competitorsListed: ["Smith & Jones LLP"] },
    { domain: "yelp.com", citedInPrompts: 3, brandListed: true, competitorsListed: ["Lone Star Legal", "Hill Country Attorneys"] },
    { domain: "findlaw.com", citedInPrompts: 2, brandListed: false, competitorsListed: [] },
  ];
}
