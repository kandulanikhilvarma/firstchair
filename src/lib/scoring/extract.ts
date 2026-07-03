// LLM extraction pass — pass 2 of §2.2. Classifies sentiment + recommendation
// for brands the deterministic matcher found. LLM output is untrusted input:
// zod-validated, one retry, then deterministic-only fallback with needs_review.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { findMentions, normalize, type TrackedBrand } from "./mentions";

export const extractionSchema = z.object({
  entities: z.array(
    z.object({
      name: z.string(),
      sentiment: z.enum(["positive", "neutral", "negative"]),
      isRecommendation: z.boolean(),
    }),
  ),
  otherFirms: z.array(z.string()).max(10).default([]),
});

export type Extraction = z.infer<typeof extractionSchema>;

export interface ExtractedMention {
  brandId: string;
  matchedAlias: string;
  position: number;
  sentiment: "positive" | "neutral" | "negative" | null;
  isRecommendation: boolean;
  method: "exact" | "llm";
  needsReview: boolean;
}

export const EXTRACT_SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "prompts", "extract-system-v1.txt"),
  "utf8",
);

export function buildExtractionUserPrompt(
  answerText: string,
  trackedNames: string[],
): string {
  return `Tracked organizations:\n${trackedNames
    .map((n) => `- ${n}`)
    .join("\n")}\n\nAnswer text:\n"""\n${answerText}\n"""`;
}

/** Parse + validate LLM output. Strips accidental markdown fences. Null on failure. */
export function parseExtraction(llmOutput: string): Extraction | null {
  const stripped = llmOutput
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  try {
    return extractionSchema.parse(JSON.parse(stripped));
  } catch {
    return null;
  }
}

/**
 * Full extraction: deterministic mentions enriched with LLM sentiment/recommendation.
 * `callLlm` is injected (prod: gpt-4o-mini temp 0; tests: mock).
 * LLM failure after one retry → deterministic-only rows flagged needs_review.
 */
export async function extractMentions(
  answerText: string,
  brands: TrackedBrand[],
  callLlm: (systemPrompt: string, userPrompt: string) => Promise<string>,
): Promise<ExtractedMention[]> {
  const deterministic = findMentions(answerText, brands);
  if (deterministic.length === 0) return [];

  const userPrompt = buildExtractionUserPrompt(
    answerText,
    brands.map((b) => b.name),
  );

  let extraction: Extraction | null = null;
  for (let attempt = 0; attempt < 2 && extraction === null; attempt++) {
    try {
      extraction = parseExtraction(
        await callLlm(EXTRACT_SYSTEM_PROMPT, userPrompt),
      );
    } catch {
      extraction = null; // network/API error → same fallback as bad JSON
    }
  }

  const byNormName = new Map<string, Extraction["entities"][number]>();
  for (const e of extraction?.entities ?? []) {
    byNormName.set(normalize(e.name), e);
  }

  return deterministic.map((m) => {
    const brand = brands.find((b) => b.brandId === m.brandId);
    const llmEntity = brand ? byNormName.get(normalize(brand.name)) : undefined;
    return {
      brandId: m.brandId,
      matchedAlias: m.matchedAlias,
      position: m.position,
      sentiment: llmEntity?.sentiment ?? null,
      isRecommendation: llmEntity?.isRecommendation ?? false,
      method: "exact" as const,
      needsReview: extraction === null,
    };
  });
}
