// Shared view-model types + engine display labels for the dashboard.
// (Formerly held the deterministic demo-data generators — removed once the
// dashboard read live daily_scores; kept the small shapes the charts share.)

import type { EngineName } from "./engines/types";

export const ENGINES: EngineName[] = ["openai", "gemini", "perplexity"];
export const ENGINE_LABELS: Record<EngineName, string> = {
  openai: "ChatGPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

export interface TrendPoint {
  date: string; // YYYY-MM-DD
  openai: number;
  gemini: number;
  perplexity: number;
}

export interface SovSlice {
  name: string;
  mentions: number;
}

export interface PromptRow {
  prompt: string;
  engine: EngineName;
  mentioned: boolean;
  position: number | null;
  sentiment: "positive" | "neutral" | "negative" | null;
  recommended: boolean;
}
