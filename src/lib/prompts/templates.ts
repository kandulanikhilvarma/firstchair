// F4: 20 prompt templates for the legal vertical (master plan §1.5).
// Placeholders: {city}, {practice}. Expanded per brand at onboarding.

export interface BrandInput {
  city: string;
  practice: string; // e.g. "personal injury", "immigration"
}

export const LEGAL_TEMPLATES: readonly string[] = [
  // direct high-intent
  "Who is the best {practice} lawyer in {city}?",
  "Top rated {practice} attorneys in {city}",
  "Best {practice} law firm in {city}",
  "Who are the top 3 {practice} lawyers in {city}?",
  // recommendation-seeking, natural phrasing
  "Can you recommend a good {practice} lawyer in {city}?",
  "I need a {practice} attorney in {city} — who should I call?",
  "Which {practice} law firm in {city} do people trust the most?",
  "Who should I hire for a {practice} case in {city}?",
  // comparison / vetting
  "Compare the best {practice} law firms in {city}",
  "What are the biggest {practice} firms in {city} and how do they differ?",
  "Which {city} {practice} lawyers have the best reviews?",
  // scenario / mid-funnel
  "Should I hire a {practice} lawyer in {city} or handle it myself?",
  "How much does a {practice} lawyer cost in {city}?",
  "How do I choose a {practice} attorney in {city}?",
  "What questions should I ask a {practice} lawyer in {city} before hiring?",
  // local variants
  "Best {practice} lawyer near downtown {city}",
  "{practice} attorney {city} free consultation",
  // directory / citation probes
  "According to online reviews, who is the best {practice} lawyer in {city}?",
  "List highly rated {practice} attorneys in {city}",
  "Where can I find rankings of {city} {practice} lawyers?",
] as const;

export function expandTemplates(input: BrandInput): string[] {
  const city = input.city.trim();
  const practice = input.practice.trim().toLowerCase();
  return LEGAL_TEMPLATES.map((t) =>
    t.replaceAll("{city}", city).replaceAll("{practice}", practice),
  );
}
