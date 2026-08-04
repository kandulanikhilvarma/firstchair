---
name: First Chair
description: AI-visibility tracking for law firms, set the way legal publishing sets a record.
colors:
  ox-900: "#3f1119"
  ox-700: "#6e1f2c"
  ox-500: "#8e2a3a"
  canary-400: "#f7d64a"
  canary-200: "#f3e4a6"
  canary-100: "#fbf4d6"
  ink-900: "#12161f"
  ink-700: "#2b3444"
  ink-500: "#4a5160"
  rule: "#c8102e"
  foil: "#a8843a"
  verdict: "#3f6212"
  surface-0: "#ffffff"
  surface-50: "#f7f6f2"
  border: "#ddd8ce"
  border-strong: "#b9b2a4"
  chart-1: "#6e1f2c"
  chart-2: "#1d4e5f"
  chart-3: "#a8843a"
  chart-4: "#3f6212"
  chart-5: "#7c2d5c"
  chart-6: "#4a5160"
typography:
  display:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1.03
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "clamp(2rem, 3.6vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    letterSpacing: "0.11em"
    fontFeature: "font-variant-caps: all-small-caps"
  transcript:
    fontFamily: "Courier Prime, ui-monospace, monospace"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
  numeric:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "3.75rem"
    fontWeight: 400
    lineHeight: 1
    fontFeature: "font-variant-numeric: tabular-nums"
rounded:
  input: "2px"
  card: "3px"
spacing:
  gutter: "24px"
  section: "80px"
  block: "56px"
  panel: "24px"
  stack: "24px"
components:
  button-primary:
    backgroundColor: "{colors.ox-700}"
    textColor: "{colors.canary-100}"
    typography: "{typography.body}"
    padding: "14px 16px"
  button-primary-hover:
    backgroundColor: "{colors.ox-900}"
    textColor: "{colors.canary-100}"
  button-signal:
    backgroundColor: "{colors.canary-400}"
    textColor: "{colors.ox-900}"
    typography: "{typography.body}"
    padding: "12px 16px"
  button-signal-hover:
    backgroundColor: "{colors.canary-200}"
    textColor: "{colors.ox-900}"
  button-outline:
    backgroundColor: "{colors.surface-0}"
    textColor: "{colors.ox-700}"
    typography: "{typography.body}"
    padding: "12px 16px"
  button-outline-hover:
    backgroundColor: "{colors.ox-700}"
    textColor: "{colors.canary-100}"
  input-field:
    backgroundColor: "transparent"
    textColor: "{colors.ink-900}"
    typography: "{typography.body}"
    padding: "8px 0"
  panel:
    backgroundColor: "{colors.surface-0}"
    textColor: "{colors.ink-900}"
    padding: "24px"
  panel-header:
    backgroundColor: "{colors.surface-50}"
    textColor: "{colors.ink-500}"
    typography: "{typography.label}"
    padding: "10px 24px"
  badge-recommended:
    backgroundColor: "#3f62121a"
    textColor: "{colors.verdict}"
    padding: "2px 8px"
  badge-mentioned:
    backgroundColor: "{colors.canary-100}"
    textColor: "{colors.ox-700}"
    padding: "2px 8px"
  badge-absent:
    backgroundColor: "{colors.surface-50}"
    textColor: "{colors.ink-500}"
    padding: "2px 8px"
  nav-link:
    textColor: "{colors.ink-700}"
    typography: "{typography.label}"
  nav-link-active:
    backgroundColor: "{colors.ox-700}"
    textColor: "{colors.canary-100}"
    padding: "8px 12px"
---

# Design System: First Chair

## Overview

**Creative North Star: "The Editorial Law Review"**

The committed direction, recorded verbatim from the build's direction contract (`DIRECTION_CONTRACT`, seed `993d9e85`, in `src/app/layout.tsx`):

> **THESIS:** An AI answer is a record, so this surface is set as legal publishing sets a record — refusing the light-SaaS hero-with-floating-dashboard the GEO category ships.
>
> **OWN-WORLD:** West reporter oxblood as committed field, canary legal-pad yellow as the only signal, blue-black pleading ink, red margin rule as structural hairline, foil for detail. Caslon display, Public Sans UI, Courier for verbatim answers. Square corners, hairline rules, no cards-as-scaffold.

The world is drawn from legal publishing's **saturated** range — buckram reporter spines, the canary legal pad, blue-backed pleadings, the red margin rule, foil stamping on a spine — and deliberately not the cream-and-parchment rendition that "law firm website" usually means. Nothing here is beige. The surface is white stock with a saturated oxblood field pressed onto it.

Density is editorial, not dashboard. Content is set as definition lists, ordered proceedings, ruled tables and transcript blocks rather than as a grid of cards. Structure is carried by hairline rules and by 1px gaps that let a background color read as a grid line, not by boxes with shadows floating over a gray page. The single piece of authored motion in the entire system is a verdict inking onto the page.

**Key Characteristics:**
- Oxblood is a **field**, not an accent: whole sections and whole pricing panels are set in it.
- Canary is the only signal color; it marks the one thing that matters on a surface.
- Square corners (2–3px) throughout; the form language is a printed page, not a chip.
- Three faces with three jobs: Caslon sets, Public Sans operates, Courier quotes.
- Every number is tabular and traces back to the sentence it came from.
- Depth is achieved by tone and rule, not by shadow.

## Colors

A saturated legal-publishing palette: three ranges of pigment (oxblood, canary, pleading ink) over uncoated white stock, with red, foil and court green reserved for single-purpose marks.

### Primary

- **Oxblood Buckram** (`ox-900` #3f1119, `ox-700` #6e1f2c, `ox-500` #8e2a3a): the reporter spine. `ox-900` is the committed field — full-bleed hero, the highlighted pricing panel, the 2px masthead and footer rules. `ox-700` is the interactive weight: primary buttons, active nav, links on white, score numerals, focused input underlines. `ox-500` appears only at low alpha as a link underline.

### Secondary

- **Canary Legal Pad** (`canary-400` #f7d64a, `canary-200` #f3e4a6, `canary-100` #fbf4d6): the signal. `canary-400` is the highlighter — the struck competitor name in a transcript, the 2px underline under the one live link in a nav, the signal button on oxblood, the seats in the mark. `canary-200` is body copy on the oxblood field and the ruled-stock line. `canary-100` is the reversed-out heading color on oxblood and the pale legal-pad ground on white surfaces.

### Tertiary

- **Margin Rule Red** (`rule` #c8102e): the red rule of a legal pad and the correction pen. Sequence markers ("First / Then / Finally"), transcript Q. markers, and error text. Never a background at full strength; the trial-ended banner uses it at 10%.
- **Verdict Green** (`verdict` #3f6212): a favorable finding only — success messages, the "Recommended" state, positive deltas.
- **Foil** (`foil` #a8843a): spine stamping. Appears as a chart series and as advisory text; the quietest of the three.
- **Engine Series** (`chart-1`…`chart-6`): a six-step categorical scale drawn from this world (oxblood, court blue-green, foil, verdict, plum, ink) so charts read as part of the publication rather than as a library default.

### Neutral

- **Pleading Ink** (`ink-900` #12161f, `ink-700` #2b3444, `ink-500` #4a5160): blue-black, never a neutral gray. `ink-900` is body and heading text on white, `ink-700` is running prose, `ink-500` is notation labels and secondary detail.
- **Stock** (`surface-0` #ffffff, `surface-50` #f7f6f2): the page and the warm panel header/inset tone.
- **Rules** (`border` #ddd8ce, `border-strong` #b9b2a4): warm paper-toned hairlines. `border` divides list items and table rows; `border-strong` bounds panels, tops a definition entry, and underlines an input.

### Named Rules

**The Committed Field Rule.** Oxblood is applied as a region, not as a highlight. A surface either commits — the whole hero, the whole panel, the whole masthead rule — or it stays on white. There is no 8%-oxblood-tint decoration.

**The One Signal Rule.** Canary marks exactly one thing per region: the struck name in the transcript, the primary action in a nav, the live plan. Two canary elements competing in the same field means one of them is not the signal.

**The Blue-Black Rule.** Text is never neutral gray. All ink is the blue-black `ink-*` range, because pleading ink is blue-black.

**The Grayscale Rule.** No state is carried by hue alone. A score state, a delta, or a citation gap must survive a grayscale screenshot — the "Recommended / Mentioned / Absent" badges each carry a word, the delta carries a sign and an arrow.

## Typography

**Display Font:** Libre Caslon Display (with Georgia, serif)
**Body Font:** Public Sans (with system-ui, sans-serif)
**Verbatim/Mono Font:** Courier Prime (with ui-monospace, monospace)

**Character:** Caslon is the historic face of American legal printing and sets everything a reader would call a title. Public Sans carries the US federal design-system lineage and does the operating work without asking to be noticed. Courier is not a retro gesture — a court transcript *is* Courier, so machine answers are set in it because that is what they are.

### Hierarchy

- **Display** (Caslon, 400, `clamp(2.5rem, 5.5vw, 4.5rem)`, line-height 1.03): one per surface, the hero headline. Measure is set on the heading itself (`max-w-[15ch]`) so `ch` resolves against the display face.
- **Headline** (Caslon, 400, `clamp(2rem, 3.6vw, 3rem)`, line-height 1.08): section openers on the landing and legal surfaces.
- **Title** (Caslon, 400, 1.25–2rem): panel headings, plan names, definition terms, proceeding steps.
- **Body** (Public Sans, 400, 1rem/1.6; lead paragraphs at 1.125rem): all running prose. Measure is held between 54ch and 76ch; the Read surface container is `max-w-[74ch]`.
- **Notation / Label** (`.notation` — Public Sans, 600, all-small-caps, letter-spacing 0.11em): the Bluebook run-in label. Field labels, table headers, nav links, metadata lines, "of 100 visibility".
- **Transcript** (`.transcript` — Courier Prime, 400, line-height 1.7): verbatim engine answers, Q./A. pairs, docket-style detail lines.
- **Numeric** (`.tnum` — tabular figures, usually Caslon at 3rem–3.75rem): visibility scores, prices, deltas, any figure in a column.

### Named Rules

**The Notation Rule.** Small-caps notation runs **inline** — in copy, in a table header, next to a value. It is never stacked above a heading as an eyebrow or kicker. The eyebrow pattern is banned in this world; `.notation` is what replaced it.

**The Courier Means Verbatim Rule.** Courier is a claim about provenance, not a texture. If text is set in Courier it is either a machine's exact words or a docket-style identifier. Never use it for UI chrome or headings.

**The Tabular Figures Rule.** Every number that sits in a column, updates, or is compared to another number carries `.tnum`. Score displays and price rows must not jitter between renders.

## Layout

Three container widths, one per surface mode. The **Persuade** surface (landing) and its masthead run at `max-w-6xl` (72rem) with a 24px gutter (`px-6`) at every breakpoint. The **Operate** surfaces (dashboard) run at `max-w-7xl` (80rem) with 24px padding; settings runs `max-w-4xl`. The **Read** surface (legal) is measure-bound at `max-w-[74ch]`.

Vertical rhythm on editorial surfaces is 80px section padding (`py-20`), 56px for the proof block, with 24–56px steps inside. Operate surfaces use a 24px section gap and 24px panel padding. The spacing scale in use is coarse and small — 2, 4, 6, 8, 12, 14, 20 in Tailwind steps — with no invented intermediate values.

Asymmetry is the default composition: the hero is a `minmax(0,1fr)_27rem` two-column split with the audit form filed to the right; content sections pair a text column with a `minmax(0,26rem)` or `20rem` image column. The dashboard uses a 3-column grid where the score hero spans 2 and the share-of-voice donut takes 1.

Responsive behavior is a single collapse at `lg`. Above it: persistent 15rem sidebar, desktop header with the brand switcher, multi-column grids. Below it: a top bar with a right-hand drawer over an ink-900/40 scrim, and every grid stacks to one column. The decorative library band is height-bound (`h-[40vh] min-h-64`) so it never dominates a short viewport.

**The Gap-as-Rule Rule.** Multi-panel groups are built as a `gap-px` grid over a `border-strong` background, so the divider between panels is a true hairline the grid produces rather than a border each panel draws.

## Elevation & Depth

This system is **flat**. Depth comes from tone and from rule weight, not from shadow. A panel is distinguished by a `border-strong` hairline and, where it has a header, by a `surface-50` band above a hairline. A region is distinguished by committing to a color field. Hierarchy between the masthead and the page below it is a 2px oxblood rule versus a 1px paper rule.

Two shadow tokens exist. Only one is in use, and only where the page genuinely lifts off itself.

### Shadow Vocabulary

- **Drawer lift** (`--shadow-card-hover`: `0 6px 16px -4px rgb(63 17 25 / 0.16)`): the mobile navigation drawer, which floats above a scrim. Tinted with oxblood, never neutral black.
- **Card rest** (`--shadow-card`: `0 1px 2px rgb(63 17 25 / 0.08)`): defined but not applied by any shipped surface. Available for a genuinely floating overlay; it is not the resting state of a panel.

### Named Rules

**The No Card Scaffold Rule.** Content is not wrapped in a shadowed card to give it presence. If a group needs separation, it gets a hairline, a tone change, or a field. Shadow is reserved for elements that actually overlay the page.

## Shapes

Square is the form language. The two radius tokens are deliberately near-zero: 2px on inputs and 3px on panels — enough to keep a corner from looking chipped, not enough to read as rounded. Nothing in this world is a pill, and nothing is a soft card.

Borders do the structural work. Hairlines (1px `border` / `border-strong`) divide rows, list items and definition entries; 2px oxblood rules cap the masthead and footer; a 2px canary left border marks a quoted transcript and a 2px canary bottom border marks the primary link in a nav. Inputs are bottom-ruled only — a form field is a line to write on, not a box.

The identity mark is drawn as geometry, not set as type: a filled square with a counsel table rule and three seats, the first one taken. It is SVG so it holds at 16px and does not depend on a font having loaded.

**The Underline-Not-Box Rule.** Text inputs and selects have no box: `border-0 border-b border-border-strong` on a transparent ground, shifting to `ox-700` on focus.

## Components

### Buttons

- **Shape:** square (no radius applied; the 2–3px tokens belong to inputs and panels).
- **Primary:** oxblood field (`ox-700`) with canary-100 text, semibold Public Sans, 14px vertical / 16px horizontal padding. Full-width inside a form.
- **Signal:** canary-400 with `ox-900` text — used only on an oxblood field, where it is the one bright object.
- **Outline:** 1px `ox-700` border, `ox-700` text on white; inverts to a filled oxblood button on hover.
- **Hover / Focus:** `transition-colors` only. Primary darkens to `ox-900`, signal lightens to `canary-200`, outline fills. No lift, no scale, no shadow.
- **Disabled:** `opacity-70`/`opacity-60` with `cursor-wait` while a request is in flight; the label changes to state text ("Querying the engines…", "Starting…").

### Badges (score states)

- **Style:** square, 2px/8px padding, 0.75rem semibold. Recommended = verdict green on a 10% verdict wash; Mentioned = `ox-700` on `canary-100`; Absent = `ink-500` on `surface-50`. Deltas use the same pattern (verdict wash up, rule wash down) plus an arrow that rotates for a negative.
- **State:** the word is the state. Color reinforces; it never carries the meaning alone.

### Panels / Containers

- **Corner Style:** square (3px token available for panels).
- **Background:** `surface-0`, or `ox-900` when the panel is the committed one in a pair.
- **Header:** an optional `surface-50` band with a `.notation` label, separated by a `border-strong` hairline — the cover sheet of a filed form.
- **Shadow Strategy:** none at rest (see Elevation & Depth).
- **Border:** 1px `border-strong` around; 1px `border` between internal rows.
- **Internal Padding:** 24px both axes; 32px on pricing panels.

### Inputs / Fields

- **Style:** transparent ground, bottom hairline in `border-strong`, 8px vertical padding, no horizontal inset. Label above in `.notation` at `ink-500`; placeholder at `ink-500/55`.
- **Focus:** the underline becomes `ox-700`. Default ring removed (`focus:ring-0`, `focus:outline-none`) — the color shift on the rule is the focus signal.
- **Error:** message text in `rule` red with `role="status"`; success in `verdict`.
- **Select:** same underline treatment, no box, no custom chevron.

### Navigation

- **Masthead (Persuade / Read):** mark + Caslon wordmark left, `.notation` links right, all baseline-aligned, on a 2px `ox-900` bottom rule. The primary link carries a 2px canary underline.
- **Sidebar (Operate):** 15rem, `surface-0`, right hairline. Items are Lucide icon + label at 0.875rem medium, `ink-500`. Active item is a filled `ox-700` block with canary-100 text, driven by the real pathname and `aria-current="page"`. Unbuilt destinations render as a disabled span with a "Soon" tag rather than a dead link.
- **Mobile:** top bar with a hamburger; right-hand 16rem drawer over an `ink-900/40` scrim, closing on scrim click or the X.

### The Transcript Block (signature)

A verbatim engine answer, set in Courier at 1.125rem with a 2px canary left rule and 24px inset, capped at 74ch. Firm names are `<mark>` on canary-400 with `ox-900` bold text. Above it sits a `.notation` provenance line naming the engine and the question; below it, the finding ("Your firm — not mentioned"). This is the proof object of the product and the reason Courier is in the system at all.

### The Ink-In Reveal (signature motion)

`.ink-in` — the single authored motion moment. A verdict inks onto the page as a stamp presses: `clip-path` wipes from `inset(0 100% 0 0)` to `inset(0 0 0 0)` with opacity 0.4 → 1 over 900ms on `cubic-bezier(0.16, 1, 0.3, 1)`. Stagger classes `.ink-in-1/2/3` add 160/320/480ms delays. Content is visible by default — the animation only reveals. Fully disabled under `prefers-reduced-motion: reduce`.

**The One Moment Rule.** `.ink-in` is used once per surface, on the proof block. It is not a generic section-entrance animation, and no second motion vocabulary exists in this system.

### Ruled Stock

`.ruled` — a repeating 32px canary-200 hairline gradient, the horizontal lines of a legal pad, used as field texture behind a section (paired with a `canary-100` ground). Content sits on `surface-0/70` blocks so the ruling reads behind the page, not through the text.

## Do's and Don'ts

### Do:

- **Do** commit oxblood as a whole region — a full-bleed hero, a full pricing panel, a full active nav item — rather than tinting.
- **Do** run small-caps notation (`.notation`) inline: as a field label, a table header, or a run-in before a value.
- **Do** set every verbatim engine answer in Courier (`.transcript`) and every column figure in tabular numerals (`.tnum`).
- **Do** separate content with hairlines, tone bands, and `gap-px` grids over a `border-strong` ground.
- **Do** keep inputs to a bottom rule only, shifting to `ox-700` on focus.
- **Do** give every state a word as well as a color, so the surface survives a grayscale screenshot. The build is verified at **0 contrast failures across 101 elements at WCAG AA**; keep it there.
- **Do** write real alt text for content images, and mark the decorative library band `aria-hidden` with an empty alt.
- **Do** keep motion to `.ink-in`, once per surface, and honor `prefers-reduced-motion`.
- **Do** name the destination in a back link (`BackLink` takes an explicit `href` + `label`); never `history.back()`.

### Don't:

- **Don't** stack a small-caps label above a heading as an eyebrow or kicker. That pattern is banned in this world; notation is a run-in.
- **Don't** wrap content in a shadowed card to give it presence. Shadow is only for elements that overlay the page.
- **Don't** round corners past the 2–3px tokens. No pills, no `rounded-lg` surfaces, no soft cards.
- **Don't** use neutral gray for text. All ink is the blue-black `ink-*` range.
- **Don't** reach for the cream/parchment law-firm rendition — this world is the saturated one.
- **Don't** introduce a second signal color, or place two canary elements in competition inside one field.
- **Don't** use Courier for anything that is not verbatim machine output or a docket identifier.
- **Don't** use the legacy alias tokens (`--color-primary-900/700/500`, `--color-accent-600`, `--color-danger-600`, `--color-warn-600`, `--color-ink-600`) in new work. They are a **deprecated migration bridge** so unrebuilt surfaces render in this world; every new surface uses `ox-*`, `verdict`, `rule`, `foil`, `ink-500`. The aliases are to be removed once the last surface is rewritten.
- **Don't** add a chart color outside the `chart-1…6` engine series; a chart library's default palette is a different world.
- **Don't** use emojis or glyph icons in UI. Icons are Lucide, sized 16–24px, `aria-hidden` beside a text label.
