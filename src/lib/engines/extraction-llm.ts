// gpt-4o-mini temp 0 caller for the extraction pass (§2.2 pass 2). Separate
// from callOpenAI (scan calls use temp 0.3 + higher token budget) — same
// retry/error helpers, different request shape and return type (raw text,
// not a scored EngineResult).

import { callWithRetry, ensureOk } from "./types";

const MODEL = "gpt-4o-mini";

export async function callExtractionLlmOpenAI(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("missing env OPENAI_API_KEY");

  return callWithRetry(async () => {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });
    await ensureOk(res, "openai");
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  });
}
