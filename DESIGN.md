---
name: First Chair
description: AI-visibility tracking for law firms, drawn as an instrument that splits one question into three answers.
colors:
  bg: "#ffffff"
  surface-1: "#f7f6f3"
  surface-2: "#efeee9"
  border: "#e2e0d9"
  border-strong: "#ccc9bf"
  border-input: "#86847a"
  text-primary: "#1b1a17"
  text-secondary: "#55534b"
  text-muted: "#6c6a5f"
  brand-50: "#eef6f4"
  brand-100: "#dcede9"
  brand-500: "#147d72"
  brand-600: "#0f6b62"
  brand-700: "#0b5a52"
  on-brand: "#ffffff"
  openai: "#b8623f"
  openai-text: "#8f4626"
  gemini: "#4f6bb0"
  gemini-text: "#3a5290"
  perplexity: "#9c5aa0"
  perplexity-text: "#7d3f82"
  series-1: "#147d72"
  series-2: "#b8623f"
  series-3: "#4f6bb0"
  series-4: "#9c5aa0"
  series-5: "#c69324"
  series-6: "#6f8a3f"
  success: "#2f7a4e"
  danger: "#b23b47"
  warning: "#8f6212"
  accent: "#96611a"
  accent-2: "#a8465a"
  bg-dark: "#12120f"
  surface-1-dark: "#1b1b16"
  surface-2-dark: "#24241e"
  border-dark: "#33332b"
  border-strong-dark: "#45453a"
  border-input-dark: "#6a6a5a"
  text-primary-dark: "#edece4"
  text-secondary-dark: "#a8a596"
  text-muted-dark: "#85826f"
  brand-50-dark: "#12241f"
  brand-100-dark: "#163029"
  brand-500-dark: "#3fb3a4"
  brand-600-dark: "#55c2b3"
  brand-700-dark: "#74d3c4"
  on-brand-dark: "#12120f"
  openai-dark: "#d98a63"
  gemini-dark: "#7d9be0"
  perplexity-dark: "#c589c9"
  series-1-dark: "#3fb3a4"
  series-2-dark: "#d98a63"
  series-3-dark: "#7d9be0"
  series-4-dark: "#c589c9"
  series-5-dark: "#dcb44e"
  series-6-dark: "#9fbf63"
  success-dark: "#46b878"
  danger-dark: "#e06b78"
  warning-dark: "#dcb44e"
  accent-dark: "#e0b45a"
  accent-2-dark: "#eb8a9c"
typography:
  display-xl:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  display:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4.2vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 2.6vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  subtitle:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.06em"
    fontFeature: "text-transform: uppercase"
  mono-sm:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  numeric:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "font-variant-numeric: tabular-nums"
  quote:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(1.5rem, 2.6vw, 2rem)"
    fontWeight: 400
    lineHeight: 1.2
    fontFeature: "font-style: italic"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  full: "999px"
spacing:
  base: "4px"
  scale: "4 8 12 16 20 24 32 40 56 80 120"
  sectionMarketing: "80px"
  sectionApp: "32px"
  panel: "16px"
  gutter: "24px"
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  ease-drawer: "cubic-bezier(0.32, 0.72, 0, 1)"
components:
  button-primary:
    backgroundColor: "{colors.brand-500}"
    textColor: "{colors.on-brand}"
    typography: "{typography.body-sm}"
    padding: "10px 16px"
    radius: "{rounded.md}"
  button-primary-hover:
    backgroundColor: "{colors.brand-600}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.brand-500}"
    border: "1px solid {colors.border-input}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    padding: "10px 16px"
  field:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-primary}"
    border: "1px solid {colors.border-input}"
    radius: "{rounded.sm}"
    padding: "9px 12px"
  panel:
    backgroundColor: "{colors.surface-1}"
    border: "1px solid {colors.border}"
    radius: "{rounded.lg}"
  panel-header:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
    padding: "10px 16px"
  badge-recommended:
    backgroundColor: "{colors.success} at 14%"
    textColor: "{colors.success}"
    padding: "2px 8px"
  badge-mentioned:
    backgroundColor: "{colors.brand-100}"
    textColor: "{colors.brand-700}"
    padding: "2px 8px"
  badge-absent:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-muted}"
    padding: "2px 8px"
---

# Design System: First Chair

## Overview

North star: **the Prism.** A prospective client asks one question. Three engines
answer it differently. The whole product exists to hold those three answers side
by side and tell you where you stand in each — so the identity is the instrument
that does the splitting, not a metaphor borrowed from law.

This replaces "The Editorial Law Review", the previous direction. That system was
built from legal publishing — oxblood buckram, canary legal pad, Caslon, a red
margin rule. It was coherent, and it was wrong for what the product had become: a
paper metaphor cannot carry six chart series, a dark mode, or a per-engine colour
system, and the code had already drifted away from it (charts rendered in stock
Tailwind hexes, 43 call sites used a deprecated token, `:focus-visible` existed
nowhere). Prism is chosen to be operable at data density, not to be atmospheric.

Two registers, one system: the marketing surfaces are allowed the full expression
of the split. The product surfaces are quiet, dense, and fast.

## Colour

### The one idea

**Teal is always you.** `brand-500` never means anything else — not a link
colour that happens to be blue, not a generic accent. When a chart line, a badge
or a legend swatch is teal, that is the user's own firm. Every competitor and
every neutral takes something else.

**Each engine owns a hue, permanently.** ChatGPT is clay, Gemini is slate blue,
Perplexity is plum, in the mark, the charts, the badges, the tables and the email.
A reader learns three colours once and then never reads a legend again.

Because the mark hue is tuned for fills and strokes, it does not pass AA as small
text. Every engine therefore has two values: `openai` for graphics, `openai-text`
for words. Using the graphic value on a label is a bug, not a preference. In dark
mode the two converge, because the lifted hue clears 4.5:1 on the dark ground.

Colour is never the only cue. Each engine also carries a line style — ChatGPT
solid, Gemini dashed, Perplexity dotted — so the charts survive greyscale
printing and colour-vision deficiency.

### Measurement, not taste

Every foreground/background pair in this system is measured. `src/lib/tokens.test.ts`
parses `globals.css`, recomputes WCAG contrast for 20 pairs in each mode, and fails
the build on a regression. Two values in the first draft were corrected by that
check before they ever shipped: `text-muted` (4.17:1, now `#73738b` at 4.61:1) and
the input boundary, which needed a token of its own — `border-strong` sits at
1.64:1 and cannot legally identify a form field, so `border-input` exists at
3.19:1 and is the only border allowed on a control.

The test also pins the two dark-mode declarations — the `[data-theme="dark"]`
block and the `prefers-color-scheme` block — to identical values, because a
palette written twice drifts.

### Roles

`bg` is the page. `surface-1` is anything raised onto it. `surface-2` is the inset
tone: panel headers, table header rows, disabled grounds. `border` divides;
`border-strong` bounds; `border-input` identifies a control. Text runs
primary → secondary → muted, and muted is still content, so it still clears 4.5:1.

`success` / `danger` / `warning` are states, never decoration. A score that went
down is `danger` **and** carries a minus sign and a down arrow, because the
Grayscale Rule below forbids meaning that lives only in hue.

### Dark

Dark is a peer mode, not an inversion. Light is the default; the OS preference is
honoured; an explicit choice overrides it and persists. The one structural
difference: **shadows are switched off in dark mode**, because a shadow is
invisible on a dark ground. Elevation there is carried by `border` and a lighter
surface step instead.

## Typography

Quiet sans-serifs. **Hanken Grotesk** for display, headlines and numerals — a calm
neutral grotesque with heavy weights, so a score reads as a figure without
shouting. **Inter** for every piece of UI and body copy. **JetBrains Mono** for
verbatim engine answers, citations, hex values and IDs. **Fraunces**, a serif, is
the one exception — pull-quotes and editorial moments only, sparingly, for warmth
against the sans.

Display and body stay in the same quiet register on purpose, so hierarchy comes
from weight and size rather than from a loud face. What the machine said, in mono,
still sits inside the product rather than on top of it.

The mono rule is the one thing carried over intact from the previous system, and
it is carried over because it means something rather than because it looked good:
**a verbatim machine answer is always set in mono.** That is the reader's cue that
they are looking at what the engine actually said, not at our summary of it.

Measure is held at 60–75ch. Numerals are always tabular so a changing score does
not shift the column.

### Containers

Four, declared, so a fifth does not appear by accident: marketing `max-w-6xl`,
application `max-w-7xl`, forms and settings `max-w-3xl`, long-form reading
`max-w-[70ch]`.

## Shape and elevation

Radius is `6 / 10 / 14`, with `full` reserved for avatars and status dots only.
This is the sharpest break from the previous system, which was square by
conviction at 2–3px.

Elevation is `shadow-sm / md / lg`, tinted with the ink colour rather than pure
black, and disabled entirely in dark mode.

## Focus

The previous system removed focus rings at five call sites and replaced them with
a border-colour shift, and `:focus-visible` appeared nowhere in the codebase. In
Prism, focus is never removed, only restyled: a 2px `brand-500` outline at 2px
offset, applied through a `:where()` base rule so every interactive element gets
it for free and a component has to work to lose it.

## Motion

Motion here is functional. The test for whether something animates is how often a
user will see it: something seen a hundred times a day gets no animation at all,
because animation is a delay you are asking them to pay repeatedly.

Curves are custom, because the built-in CSS easings are too weak to read as
intentional:

```
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1)
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)
```

| Moment | Duration | Where |
|---|---|---|
| `press` | 160ms | `scale(0.97)` on `:active`, every pressable element |
| `ds-pop` | 180ms | popovers and dropdowns, `scale(0.95)` from the trigger |
| `ds-cascade` | 300ms | list and table rows, 40ms stagger, capped |
| `ds-pulse` | 200ms | the score delta, once, when the value changes |
| `ds-skeleton` | loop | loading placeholders |
| `chart-draw` | 600ms | line series drawing in, 60ms per engine |
| `score-count` | 700ms | the hero score, first paint per session only |
| `prism-shift` | 8s loop | marketing only, the three hues refracting |

### Motion rules

- Never `ease-in` on UI. It delays the first frame, which is the frame the user is
  watching, so it reads as lag.
- Nothing appears from `scale(0)`. Enter from `0.95` with opacity — nothing in the
  physical world resolves out of nothing.
- Only `transform` and `opacity` animate. Never `transition: all`.
- Transitions, not keyframes, for anything that can be re-triggered quickly;
  keyframes restart from zero, transitions retarget from where they are.
- Popovers scale from their trigger. Modals are the exception and stay centred,
  because they are not anchored to anything.
- Hover effects sit behind `@media (hover: hover) and (pointer: fine)`, or a touch
  tap fires them and lies.
- `prefers-reduced-motion` means fewer and gentler, not none: opacity and colour
  transitions that aid comprehension stay, movement goes.

## Named rules

**Indigo Means You.** `brand-500` identifies the user's own firm and nothing else.

**One Hue Per Engine.** ChatGPT clay, Gemini slate blue, Perplexity plum, everywhere,
forever. A reader should never need the legend twice.

**Graphic Hue, Text Hue.** The engine mark colour is for strokes and fills; the
`-text` variant is for words. They are not interchangeable.

**Never Colour Alone.** Every colour-coded distinction carries a second cue — a
line style, a sign, an arrow, a word. Charts must survive greyscale.

**Measured, Not Eyeballed.** A colour pair enters the system only after the
contrast test passes. The test is the source of truth, not this document.

**Mono Means Verbatim.** JetBrains Mono is reserved for what a machine actually
said. Never used decoratively.

**Tabular Figures.** Any number that updates is `tabular-nums`, so the column
never jitters.

**Focus Is Never Removed.** Only restyled.

**Frequency Decides Motion.** Seen constantly means no animation. Seen rarely
earns delight.

**Components, Not Call Sites.** A button is `.ds-btn`. The previous system defined
eleven component tokens and implemented none of them as classes, so every button
was retyped inline and drifted apart. Anything used more than twice becomes a
class here.

**Two Registers.** Marketing may be expressive. The product is quiet and fast.

## Don'ts

- No chart colour outside `series-1…6` and the engine hues. Not the chart
  library's defaults — that is precisely how the last system drifted.
- No raw hex in JSX. Tokens only.
- No emoji in the interface. Lucide icons at 16–24px, `aria-hidden` beside a text
  label.
- No `rounded-full` outside avatars and status dots.
- No shadow in dark mode.
- No `text-white` as a generic light colour; use `on-brand` or `text-primary`.
- No fifth container width.
- No new font size off the ramp above.
- No animation on a keyboard-initiated action.
- No legacy Editorial token (`ox-*`, `canary-*`, `ink-600`, `rule`, `foil`,
  `verdict`, `surface-0`, `surface-50`) in new work. They remain in `globals.css`
  only until every surface is migrated; when that block is empty, delete it.

## The mark

A chevron splits into three rays, one per engine — the product's whole thesis in
four strokes. Drawn as geometry rather than set as type, so it holds at 16px and
never waits on a font.

Variants live in `public/brand/`: `mark.svg` (colour, light grounds),
`mark-reversed.svg` (dark grounds), `mark-mono.svg` (single colour via
`currentColor`), `icon-app.svg` (512px, on an ink ground, for app icons and
favicons). Clear space equals the height of the chevron on all sides. Minimum
size 16px; below that use the mono variant, whose rays are weighted to survive.

## Figma handoff

`docs/design-tokens.json` is the W3C DTCG export of every colour (light and dark),
radius, family and easing above — import it into Figma via the Tokens Studio
plugin and swatches map 1:1 to the `--color-*` classes in code. It is generated
from `globals.css`, not hand-kept: run `npm run tokens` after a token change so
the handoff can never drift from what ships. The document above stays the source
for the *why*; `globals.css` and this JSON are the source for the values.
