// Exports the Prism tokens as a W3C DTCG file that Figma's Tokens Studio plugin
// imports directly. Source of truth is globals.css (the same file tokens.test.ts
// gates), so the Figma handoff can never drift from what actually ships.
// Run: node scripts/export-design-tokens.mjs  ->  docs/design-tokens.json
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");

// Pull the --p-* declarations out of one CSS block by selector.
function block(selector) {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`block not found: ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  const body = css.slice(open + 1, close);
  const vars = {};
  for (const m of body.matchAll(/--p-([\w-]+):\s*(#[0-9a-fA-F]+)\s*;/g)) {
    vars[m[1]] = m[2].toLowerCase();
  }
  return vars;
}

const light = block(":root {");
const dark = block(':root[data-theme="dark"] {');

// Map raw --p-* names to the semantic groups a designer reads (matches the
// --color-* names in @theme), so a swatch in Figma maps 1:1 to a class in code.
const GROUPS = {
  neutral: {
    bg: "bg", "surface-1": "surface-1", "surface-2": "surface-2",
    line: "border", "line-strong": "border-strong", "line-input": "border-input",
    fg: "text-primary", "fg-muted": "text-secondary", "fg-subtle": "text-muted",
  },
  brand: {
    "brand-50": "brand-50", "brand-100": "brand-100", "brand-500": "brand-500",
    "brand-600": "brand-600", "brand-700": "brand-700", "on-brand": "on-brand",
  },
  engine: {
    openai: "openai", "openai-text": "openai-text", gemini: "gemini",
    "gemini-text": "gemini-text", perplexity: "perplexity", "perplexity-text": "perplexity-text",
  },
  series: {
    "series-1": "series-1", "series-2": "series-2", "series-3": "series-3",
    "series-4": "series-4", "series-5": "series-5", "series-6": "series-6",
  },
  state: { success: "success", danger: "danger", warning: "warning" },
};

function colorSet(vars) {
  const out = {};
  for (const [group, members] of Object.entries(GROUPS)) {
    out[group] = {};
    for (const [name, src] of Object.entries(members)) {
      const value = vars[src];
      if (!value) throw new Error(`missing --p-${src} in globals.css`);
      out[group][name] = { $type: "color", $value: value };
    }
  }
  return out;
}

// Typography, radius and motion are static in DESIGN.md / @theme — not gated by
// the contrast test, so they are declared here rather than parsed.
const dtcg = {
  $description:
    "First Chair — Prism design tokens (W3C DTCG). Generated from src/app/globals.css. Import via Figma Tokens Studio. Do not hand-edit; run scripts/export-design-tokens.mjs.",
  light: colorSet(light),
  dark: colorSet(dark),
  radius: {
    sm: { $type: "dimension", $value: "6px" },
    md: { $type: "dimension", $value: "10px" },
    lg: { $type: "dimension", $value: "14px" },
    full: { $type: "dimension", $value: "999px" },
  },
  font: {
    display: { $type: "fontFamily", $value: ["Archivo", "system-ui", "sans-serif"] },
    sans: { $type: "fontFamily", $value: ["IBM Plex Sans", "system-ui", "sans-serif"] },
    mono: { $type: "fontFamily", $value: ["IBM Plex Mono", "ui-monospace", "monospace"] },
  },
  easing: {
    out: { $type: "cubicBezier", $value: [0.23, 1, 0.32, 1] },
    "in-out": { $type: "cubicBezier", $value: [0.77, 0, 0.175, 1] },
    drawer: { $type: "cubicBezier", $value: [0.32, 0.72, 0, 1] },
  },
};

const dest = join(root, "docs/design-tokens.json");
writeFileSync(dest, JSON.stringify(dtcg, null, 2) + "\n");

// Self-check: same color-token count in both modes, both present.
const perMode = Object.values(GROUPS).reduce((n, g) => n + Object.keys(g).length, 0);
const count = (set) => Object.values(set).reduce((n, g) => n + Object.keys(g).length, 0);
if (count(dtcg.light) !== perMode || count(dtcg.dark) !== perMode) {
  throw new Error(`expected ${perMode} color tokens per mode`);
}
console.log(`docs/design-tokens.json — ${perMode} colors x2 modes, radius/font/easing`);
