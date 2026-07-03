// Visibility Score v1 — master plan §2.3. Keep explainable; formula shown in-app.

export interface PromptOutcome {
  /** brand appears in the response at all */
  mentioned: boolean;
  /** brand is first among tracked entities (position 1) */
  first: boolean;
  /** LLM pass classified it as an explicit recommendation */
  recommended: boolean;
}

const W_RECOMMENDED = 1.0;
const W_FIRST = 0.6;
const W_MENTIONED = 0.4;

export function promptWeight(o: PromptOutcome): number {
  if (o.recommended) return W_RECOMMENDED;
  if (o.first) return W_FIRST;
  if (o.mentioned) return W_MENTIONED;
  return 0;
}

/** score = 100 × Σ w(p) / N over active prompts. 0 when no prompts. */
export function visibilityScore(outcomes: PromptOutcome[]): number {
  if (outcomes.length === 0) return 0;
  const sum = outcomes.reduce((acc, o) => acc + promptWeight(o), 0);
  return (100 * sum) / outcomes.length;
}

/** brand mentions ÷ mentions of all tracked entities. 0 when nothing mentioned. */
export function shareOfVoice(
  brandMentions: number,
  allTrackedMentions: number,
): number {
  if (allTrackedMentions === 0) return 0;
  return brandMentions / allTrackedMentions;
}
