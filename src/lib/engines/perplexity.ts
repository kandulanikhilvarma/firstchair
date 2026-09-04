import {
  callWithRetry,
  ensureOk,
  ENGINE_DEFAULTS,
  type EngineCallOptions,
  type EngineResult,
} from "./types";

// ponytail: routed through OpenRouter (perplexity/sonar) instead of Perplexity
// direct — one paid key covers this engine. Sonar still returns web citations,
// so the "Perplexity" label and the citation UX stay truthful. Swap the model
// via OPENROUTER_PERPLEXITY_MODEL if you want a different grounded model.
const MODEL = process.env.OPENROUTER_PERPLEXITY_MODEL ?? "perplexity/sonar";
// USD — re-verify Day 9 (§2.7); per-request search fee dominates cost
const PRICE_IN = 1;
const PRICE_OUT = 1;
const SEARCH_PER_REQUEST = 0.005;

export async function callPerplexity(
  opts: EngineCallOptions,
): Promise<EngineResult> {
  return callWithRetry(async () => {
    const start = Date.now();
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
    await ensureOk(res, "perplexity");
    const data = await res.json();
    const promptTokens = data.usage?.prompt_tokens ?? 0;
    const completionTokens = data.usage?.completion_tokens ?? 0;
    const message = data.choices?.[0]?.message ?? {};
    // OpenRouter returns sources as message.annotations[].url_citation; keep the
    // Perplexity-direct fields (data.citations / search_results) as fallbacks.
    const annotationUrls: string[] = (message.annotations ?? [])
      .filter((a: { type?: string }) => a.type === "url_citation")
      .map((a: { url_citation?: { url?: string } }) => a.url_citation?.url)
      .filter((u: unknown): u is string => typeof u === "string");
    return {
      engine: "perplexity",
      model: MODEL,
      rawText: message.content ?? "",
      citations:
        annotationUrls.length > 0
          ? annotationUrls
          : (data.citations ?? data.search_results?.map((r: { url: string }) => r.url) ?? []),
      latencyMs: Date.now() - start,
      promptTokens,
      completionTokens,
      costUsd:
        (promptTokens * PRICE_IN + completionTokens * PRICE_OUT) / 1_000_000 +
        SEARCH_PER_REQUEST,
    };
  });
}
