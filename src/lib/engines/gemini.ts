import {
  callWithRetry,
  ensureOk,
  ENGINE_DEFAULTS,
  type EngineCallOptions,
  type EngineResult,
} from "./types";

const MODEL = "gemini-2.0-flash";
// USD per million tokens — re-verify Day 9 (§2.7); grounding adds per-request cost
const PRICE_IN = 0.1;
const PRICE_OUT = 0.4;
const GROUNDING_PER_REQUEST = 0.035;

export async function callGemini(opts: EngineCallOptions): Promise<EngineResult> {
  return callWithRetry(async () => {
    const start = Date.now();
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": opts.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: opts.systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: opts.userPrompt }] }],
          tools: [{ google_search: {} }], // grounding ON → citations (§2.6)
          generationConfig: {
            temperature: ENGINE_DEFAULTS.temperature,
            maxOutputTokens: ENGINE_DEFAULTS.maxTokens,
          },
        }),
        signal: AbortSignal.timeout(ENGINE_DEFAULTS.timeoutMs),
      },
    );
    await ensureOk(res, "gemini");
    const data = await res.json();
    const candidate = data.candidates?.[0];
    const rawText: string =
      candidate?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ??
      "";
    const citations: string[] =
      candidate?.groundingMetadata?.groundingChunks
        ?.map((c: { web?: { uri?: string } }) => c.web?.uri)
        .filter((u: string | undefined): u is string => Boolean(u)) ?? [];
    const promptTokens = data.usageMetadata?.promptTokenCount ?? 0;
    const completionTokens = data.usageMetadata?.candidatesTokenCount ?? 0;
    return {
      engine: "gemini",
      model: MODEL,
      rawText,
      citations,
      latencyMs: Date.now() - start,
      promptTokens,
      completionTokens,
      costUsd:
        (promptTokens * PRICE_IN + completionTokens * PRICE_OUT) / 1_000_000 +
        GROUNDING_PER_REQUEST,
    };
  });
}
