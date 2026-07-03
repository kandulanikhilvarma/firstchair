export type EngineName = "openai" | "gemini" | "perplexity";

export interface EngineResult {
  engine: EngineName;
  model: string;
  rawText: string;
  citations: string[]; // source URLs when the engine provides them
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
}

export interface EngineCallOptions {
  systemPrompt: string;
  userPrompt: string;
  apiKey: string;
}

export const ENGINE_DEFAULTS = {
  temperature: 0.3,
  maxTokens: 700,
  timeoutMs: 30_000,
  retries: 2,
} as const;

/** Retry with exponential backoff. Retries network errors, timeouts, 429 and 5xx. */
export async function callWithRetry<T>(
  fn: () => Promise<T>,
  retries: number = ENGINE_DEFAULTS.retries,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (err instanceof NonRetryableError) throw err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
    }
  }
  throw lastError;
}

export class NonRetryableError extends Error {}

/** Throws with response detail; marks 4xx (except 429) non-retryable. */
export async function ensureOk(res: Response, engine: EngineName): Promise<void> {
  if (res.ok) return;
  const body = await res.text().catch(() => "");
  const msg = `${engine} HTTP ${res.status}: ${body.slice(0, 300)}`;
  if (res.status >= 400 && res.status < 500 && res.status !== 429) {
    throw new NonRetryableError(msg);
  }
  throw new Error(msg);
}
