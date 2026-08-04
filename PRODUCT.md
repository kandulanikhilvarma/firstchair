# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: **legal-marketing agency owners** running 10–50 law-firm clients. They already sell SEO/PPC retainers and are being asked by clients "why doesn't ChatGPT mention us?" They need a per-client answer they can put in a monthly report.

Secondary: **managing partners** at 2–20 lawyer firms. Conservative, compliance-sensitive, not marketers. They arrive through the free audit, and they screenshot results to show colleagues.

## Product Purpose

Tracks how ChatGPT, Gemini, and Perplexity answer the questions prospective legal clients actually ask ("best personal injury lawyer in Austin"), and reports whether a given firm is recommended, merely mentioned, or absent — versus named competitors. Success is a firm knowing precisely what to fix, with every number traceable to a stored raw answer.

## Positioning

Not rank tracking. AI answers have no ranked list — a firm is recommended, mentioned, or invisible. The product measures mention, recommendation, share of voice, and the sources the engines cite, and keeps the raw response behind every number. Legal-vertical only: the prompt library is built from real legal client questions, not generic keywords.

## Operating Context

Agency users work in monthly client-reporting cycles and need per-client separation and client-ready output. Partners evaluate in short sessions and screenshot findings for colleagues — so the default rendering must survive being pasted into a slide or email. Scans run daily, unattended, on a server schedule; users read results, they do not trigger them.

## Capabilities and Constraints

- Engines: OpenAI (gpt-4o-mini), Gemini (2.0-flash + search grounding), Perplexity (sonar, native citations). AI Overviews, Claude, and Copilot are explicitly out of scope.
- Visibility Score 0–100: per prompt, weight 1.0 recommended / 0.6 first-mentioned / 0.4 mentioned; score = 100×Σw/N. Must stay explainable — every number traceable to a raw response.
- Share of voice = brand mentions ÷ all tracked-entity mentions.
- Stack: Next.js 16 App Router, TypeScript, Tailwind v4, Supabase (RLS on every table), Stripe (webhooks-only plan state), Resend, Vercel. Postgres table as job queue.
- Cost ceiling under $0.60/brand/day with a daily LLM circuit breaker.
- LLM output is untrusted input: schema-validated, rendered as text only.
- Pricing: Solo $49/mo (1 brand), Agency $149/mo (10 brands), annual = 2 months free, 7-day card-required trial.
- **Known gaps (confirmed, being addressed):** no add-brand flow or brand switcher; plan brand-limits unenforced; no settings page to edit brand/competitors/prompts after onboarding; no privacy/terms pages.

## Brand Commitments

- Name: **First Chair** (renamed from "Rankwell", which collided with a registered SEO-tool trademark and two active companies). Domain and trademark clearance still pending — flagged to the owner.
- Honesty is a positioning asset: the product states plainly that API answers approximate but do not guarantee identity with consumer apps, because competitors overclaim here.
- No emojis in the interface.
- Numbers over adjectives in copy.

## Evidence on Hand

- Real engine responses captured through live API calls; a Day-1 manual market probe exists at `../probe-results.md`.
- ICP list of target agencies and firms at `../icp-list.md`.
- **No customers, testimonials, case studies, logos, press, or usage benchmarks exist yet.** Pre-revenue. These must not be fabricated; any social-proof slot ships as a clearly marked placeholder on the owner's replacement list.
- Demonstration firm data in the UI is synthetic and must stay labeled as such.

## Product Principles

1. Every displayed number traces to a stored raw answer — explainability is the product, not a feature.
2. Honest about engine fidelity; never claim the API equals the consumer app.
3. Serve the agency's reporting cycle first — per-client separation and client-ready output are structural, not cosmetic.
4. Cost discipline is a hard product constraint, not an optimization.
5. The category's own vocabulary is rank; this product refuses it.

## Accessibility & Inclusion

Results are read and re-shared as static images by non-technical, often older professional users. Requires WCAG AA contrast, real text (never text baked into images), keyboard-operable controls, and no meaning carried by color alone — score states must remain distinguishable in a grayscale screenshot.
