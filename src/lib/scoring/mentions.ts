// Deterministic mention extraction — pass 1 of §2.2.
// Case/punctuation-insensitive, "&" ↔ "and", legal-suffix tolerant.
// The LLM pass (sentiment/recommendation) layers on top later; this must be exact.

export interface TrackedBrand {
  brandId: string;
  name: string;
  aliases: string[];
}

export interface Mention {
  brandId: string;
  matchedAlias: string;
  /** 1-based order of first appearance among all tracked brands found. */
  position: number;
  /** Character index of first occurrence in the normalized text. */
  firstIndex: number;
}

const LEGAL_SUFFIXES = /\b(llp|llc|pllc|pc|pa|law firm|law group|law offices?|attorneys at law|attorneys|associates)\b/g;

/** Lowercase, & → and, strip punctuation, collapse whitespace. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Alias variants to try: normalized alias + suffix-stripped form. */
function variants(alias: string): string[] {
  const norm = normalize(alias);
  const stripped = norm.replace(LEGAL_SUFFIXES, " ").replace(/\s+/g, " ").trim();
  const out = [norm];
  // ponytail: suffix-stripped variant only when meaningful (2+ words), else "Smith LLP" would match every "smith"
  if (stripped !== norm && stripped.split(" ").length >= 2) out.push(stripped);
  return out.filter((v) => v.length > 0);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Find tracked brands in an engine response.
 * Returns one mention per brand (earliest match wins), position = order of
 * first appearance among all tracked entities found.
 */
export function findMentions(text: string, brands: TrackedBrand[]): Mention[] {
  const normText = normalize(text);
  const found: Omit<Mention, "position">[] = [];

  for (const brand of brands) {
    const aliases = [brand.name, ...brand.aliases];
    let best: { alias: string; index: number } | null = null;
    for (const alias of aliases) {
      for (const v of variants(alias)) {
        const re = new RegExp(`(?<=^|\\s)${escapeRegExp(v)}(?=\\s|$)`);
        const m = re.exec(normText);
        if (m && (best === null || m.index < best.index)) {
          best = { alias, index: m.index };
        }
      }
    }
    if (best) {
      found.push({
        brandId: brand.brandId,
        matchedAlias: best.alias,
        firstIndex: best.index,
      });
    }
  }

  return found
    .sort((a, b) => a.firstIndex - b.firstIndex)
    .map((m, i) => ({ ...m, position: i + 1 }));
}
