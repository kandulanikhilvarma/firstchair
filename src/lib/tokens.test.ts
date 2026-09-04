import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

/** Pull the `--p-*` declarations out of one CSS block. */
function tokensIn(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/(--p-[\w-]+)\s*:\s*([^;]+);/g)) {
    out[name] = value.trim();
  }
  return out;
}

function block(selector: RegExp): string {
  const m = css.match(selector);
  if (!m) throw new Error(`block not found: ${selector}`);
  return m[1];
}

const light = tokensIn(block(/:root\s*\{([\s\S]*?)\n\}/));
const dark = tokensIn(block(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/));
const darkMedia = tokensIn(block(/:root:not\(\[data-theme="light"\]\)\s*\{([\s\S]*?)\n {2}\}/));

const srgb = (hex: string) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};
const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (hex: string) => {
  const [r, g, b] = srgb(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
function contrast(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/** [foreground token, background token, minimum ratio]. 4.5 for text, 3 for a
 *  boundary or graphic that has to be identifiable (WCAG 1.4.3 / 1.4.11). */
const PAIRS: Array<[string, string, number]> = [
  ["--p-text-primary", "--p-bg", 4.5],
  ["--p-text-primary", "--p-surface-1", 4.5],
  ["--p-text-primary", "--p-surface-2", 4.5],
  ["--p-text-secondary", "--p-bg", 4.5],
  ["--p-text-secondary", "--p-surface-2", 4.5],
  ["--p-text-muted", "--p-bg", 4.5],
  ["--p-brand-500", "--p-bg", 4.5],
  ["--p-on-brand", "--p-brand-500", 4.5],
  ["--p-brand-700", "--p-brand-100", 4.5],
  ["--p-openai-text", "--p-bg", 4.5],
  ["--p-gemini-text", "--p-bg", 4.5],
  ["--p-perplexity-text", "--p-bg", 4.5],
  ["--p-success", "--p-bg", 4.5],
  ["--p-danger", "--p-bg", 4.5],
  ["--p-warning", "--p-bg", 4.5],
  ["--p-openai", "--p-bg", 3],
  ["--p-gemini", "--p-bg", 3],
  ["--p-perplexity", "--p-bg", 3],
  ["--p-border-input", "--p-bg", 3],
  ["--p-brand-500", "--p-bg", 3], // focus ring
];

describe.each([
  ["light", light],
  ["dark", dark],
])("prism palette — %s", (mode, tokens) => {
  it.each(PAIRS)("%s on %s meets %s:1", (fg, bg, min) => {
    const fgHex = tokens[fg];
    const bgHex = tokens[bg];
    expect(fgHex, `${fg} missing in ${mode}`).toBeTruthy();
    expect(bgHex, `${bg} missing in ${mode}`).toBeTruthy();
    expect(contrast(fgHex, bgHex)).toBeGreaterThanOrEqual(min);
  });
});

// The dark palette is written twice — once for the explicit toggle, once for
// the OS preference. They drift silently, so pin them together.
describe("dark palette is declared identically in both places", () => {
  it("has the same token names", () => {
    expect(Object.keys(darkMedia).sort()).toEqual(Object.keys(dark).sort());
  });

  it("has the same values", () => {
    expect(darkMedia).toEqual(dark);
  });
});

describe("series palette", () => {
  it("defines six distinct hues in both modes", () => {
    for (const [mode, tokens] of [
      ["light", light],
      ["dark", dark],
    ] as const) {
      const series = [1, 2, 3, 4, 5, 6].map((n) => tokens[`--p-series-${n}`]);
      expect(series.every(Boolean), `series incomplete in ${mode}`).toBe(true);
      expect(new Set(series).size, `duplicate series colour in ${mode}`).toBe(6);
    }
  });
});
