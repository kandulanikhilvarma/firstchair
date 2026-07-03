import {
  callWithRetry,
  ensureOk,
  ENGINE_DEFAULTS,
  type EngineCallOptions,
  type EngineResult,
} from "./types";

const MODEL = "gpt-4o-mini";
// USD per million tokens — re-verify Day 9 (§2.7)
const PRICE_IN = 0.15;
const PRICE_OUT = 0.6;

export async function callOpenAI(opts: EngineCallOptions): Promise<EngineResult> {
  return callWithRetry(async () => {
    const start = Date.now();
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: ENGINE_DEFAULTS.temperature,
        max_tokens: ENGINE_DEFAULTS.maxTokens,
        messages: [
          { role: "system", content: opts.systemPrompt },
          { role: "user", content: opts.userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(ENGINE_DEFAULTS.timeoutMs),
    });
    await ensureOk(res, "openai");
    const data = await res.json();
    const promptTokens = data.usage?.prompt_tokens ?? 0;
    const completionTokens = data.usage?.completion_tokens ?? 0;
    return {
      engine: "openai",
      model: MODEL,
      rawText: data.choices?.[0]?.message?.content ?? "",
      citations: [], // chat completions return no sources
      latencyMs: Date.now() - start,
      promptTokens,
      completionTokens,
      costUsd:
        (promptTokens * PRICE_IN + completionTokens * PRICE_OUT) / 1_000_000,
    };
  });
}
