// F9 Recommendations v0 — rule-based, every recommendation cites its evidence (§1.5).

export interface CitationGap {
  domain: string;
  citedInPrompts: number;
  totalPrompts: number;
  brandListed: boolean;
  competitorsListed: string[];
}

export interface Recommendation {
  action: string;
  evidence: string;
  priority: number; // higher = more cited + competitors present
}

/**
 * Rule: a domain the engines cite often, where you're absent, is a gap —
 * worse when competitors ARE there. Sorted by priority.
 */
export function recommendFromCitations(gaps: CitationGap[]): Recommendation[] {
  return gaps
    .filter((g) => !g.brandListed && g.citedInPrompts >= 2)
    .map((g) => ({
      action: `Get listed on ${g.domain}`,
      evidence:
        `Engines cite ${g.domain} for ${g.citedInPrompts} of ${g.totalPrompts} tracked prompts` +
        (g.competitorsListed.length > 0
          ? `; ${g.competitorsListed.join(" and ")} ${g.competitorsListed.length === 1 ? "is" : "are"} listed there — you are not.`
          : "; you are not listed there."),
      priority: g.citedInPrompts + g.competitorsListed.length * 2,
    }))
    .sort((a, b) => b.priority - a.priority);
}
