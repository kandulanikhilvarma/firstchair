import { callGemini } from "./gemini";
import { callOpenAI } from "./openai";
import { callPerplexity } from "./perplexity";
import type { EngineCallOptions, EngineName, EngineResult } from "./types";

export type { EngineCallOptions, EngineName, EngineResult };

const CLIENTS: Record<EngineName, (o: EngineCallOptions) => Promise<EngineResult>> = {
  openai: callOpenAI,
  gemini: callGemini,
  perplexity: callPerplexity,
};

const KEY_ENV: Record<EngineName, string> = {
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
  perplexity: "OPENROUTER_API_KEY", // routed via OpenRouter — see perplexity.ts
};

/** Server-side only — reads API keys from env. */
export async function callEngine(
  engine: EngineName,
  systemPrompt: string,
  userPrompt: string,
): Promise<EngineResult> {
  const apiKey = process.env[KEY_ENV[engine]];
  if (!apiKey) throw new Error(`missing env ${KEY_ENV[engine]}`);
  return CLIENTS[engine]({ systemPrompt, userPrompt, apiKey });
}
