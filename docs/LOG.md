# Build log

## 2026-07-04 (session 3) — Days 13, 15–17 UI parts + F9 (commit 63bcdb4)

Shipped:
- src/lib/seed.ts — deterministic demo data (mulberry32, fixed seeds): 30-day trend, SOV, prompt rows, citations
- src/lib/scoring/recommend.ts — F9 rule-based recommendations from citation gaps; every rec carries evidence line; 5 tests
- /dashboard — sidebar shell, brand switcher topbar, "Demo data" badge, score hero (59/100 ↑4 + sparkline), per-engine trend chart w/ toggles, SOV donut + legend, prompt results table (Recommended/Mentioned/Absent badges, tabular-nums), top cited sources w/ missing-from-N callout, what-to-fix-first list
- /onboarding — 4-step wizard per wireframe 1e: brand form → aliases + up to 5 competitors → 20 real generated prompts w/ toggles → per-engine progress bars → dashboard link
- deps added: recharts, lucide-react
- 57 tests green; typecheck/lint/build green. Preview-verified: dashboard sections, wizard full walkthrough (20 prompts generated from templates, toggle works, bars animate)

OFFLINE WORK EXHAUSTED. Everything remaining needs accounts/keys:
supabase-js wiring (auth, persistence, queue worker, RLS test), audit live path,
Stripe, Resend emails, Vercel deploy, cost re-verify, fixture capture.

## 2026-07-04 (session 2) — Days 8, 9 (pure half), 12 (offline parts)

Shipped (commit 581a05a):
- src/lib/scoring/extract.ts — LLM extraction pass: zod schema, fence-stripping parser, 1 retry, deterministic-only fallback w/ needs_review; injected callLlm for testability; skips LLM when no deterministic mention (no wasted spend); prompts/extract-system-v1.txt versioned
- src/lib/scoring/aggregate.ts — per-prompt outcomes → daily_scores row (score, SOV, mention/rec counts, top-5 citations by frequency)
- Landing page §3.4: hero + audit form as CTA, how-it-works, pricing (Agency highlighted), FAQ w/ "API ≠ consumer app" honesty, footer. Verified in preview: desktop, mobile 375px, form submit → friendly 503
- /api/audit — zod-validated skeleton; real scan path lands with keys (Day 11)
- 52 unit tests green; typecheck/lint green

Still blocked on keys/accounts: audit live path, Supabase auth, queue worker (needs supabase-js + service role), RLS live test, fixture capture.

## 2026-07-04 — bootstrap (plan Days 2–6, local parts)

Shipped:
- Next.js 16.2.10 scaffold (App Router, TS, Tailwind v4), npm, git
- Design tokens §3.1–3.3 in globals.css @theme; Space Grotesk + Inter via next/font; placeholder landing hero
- supabase/migrations/0001_init.sql — full schema §2.3 + RLS on every table (member_workspaces() security-definer helper; audit_leads service-role-only)
- prompts/scan-system-v1.txt (versioned scan system prompt)
- src/lib/prompts/templates.ts — 20 legal templates + expandTemplates (F4)
- src/lib/engines/ — openai/gemini/perplexity clients, native fetch, 30s timeout, 2 retries exp backoff, 4xx non-retryable, token+cost logging, grounding/citations wired
- src/lib/scoring/ — deterministic mention matcher (normalize, & ↔ and, legal-suffix variants, word boundaries, position ordering) + visibility score/SOV math
- 34 unit tests green; typecheck + lint + build green; CI workflow (.github/workflows/ci.yml)
- .env.example, launch.json (dev server verified on :3000)

Blocked on user (accounts/keys/manual):
- Day 1 probe: run day1-probe.md prompts by hand, screenshots + ICP 100 contacts
- Day 2 external: buy domain; create Supabase/Vercel/Stripe(test)/Resend/Sentry; push repo to GitHub + branch protection
- Day 4 verify: `supabase db reset` + cross-user RLS test needs live Supabase
- Day 5 verify: real engine calls + fixture capture need API keys
- Day 9: re-verify pricing constants in src/lib/engines/*.ts (marked)

Deviations from plan (deliberate):
- Next 16 instead of 15 (current stable from create-next-app); Tailwind v4 → tokens in CSS @theme, no tailwind.config
- shadcn/ui not installed yet — no components need it until dashboard work; add at Day 15
- Supabase auth wiring deferred until keys exist (Day 3 verify requires live project)
