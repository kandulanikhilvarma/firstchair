# Build log

## 2026-07-05 (session 7) — F3 + F8 + F5 shipped, Azure engine path

- F3 (PR #12): onboarding wizard persists via saveOnboarding server action
  (zod, user-session inserts, RLS enforces membership). E2E: rows in live DB.
- F8 (PR #14): Stripe subs, webhooks-only plan state. checkout (7-day
  card-required trial) / webhook (sole writer of workspace.plan, sig-verified)
  / portal / /billing page. Security bug caught by new test: unset
  STRIPE_PRICE_* env collapsed to empty-string key in PRICE_TO_PLAN -> empty
  priceId granted a plan; fixed by filtering unset envs. Live-verified:
  real checkout session, signed webhooks flip trial->solo->agency->canceled,
  forged/unsigned -> 400.
- F5 (PR #15): daily cron worker + claim_scan_job() (FOR UPDATE SKIP LOCKED,
  service_role-only). Live-verified: 401 gate, enqueue->claim->pipeline->
  daily_scores upsert->done. Zero scores until an engine key is funded.
  Known limitation: total engine outage writes 0-score rows ('no data'
  indistinguishable from 'absent') — follow-up.
- All merged to main by user same day: #9, #11, #12, #14, #15.
- Azure OpenAI compat: OPENAI_BASE_URL env override in openai.ts +
  extraction-llm.ts (Azure v1 surface, api-key header added) + OPENAI_MODEL
  override. Path to free engine credit via GitHub Student Pack -> Azure for
  Students ($100, no card): create Azure OpenAI resource, deploy gpt-4o-mini,
  set OPENAI_BASE_URL=https://<resource>.openai.azure.com/openai/v1 +
  OPENAI_API_KEY=<azure-key>.
- USER TODO: Azure for Students signup + resource + deployment + 2 env lines;
  F8 Vercel setup (4 STRIPE_PRICE_*, webhook endpoint + secret, enable
  portal); rotate all keys pasted in chat after testing.
- Merge-flow gotcha: stacked PR #14 was merged into its base branch
  feat/auth-magic-link, not main (GitHub only auto-retargets when the base
  branch is deleted on merge) — F8 was missing from main until PR #16
  carried it over. Rule going forward: delete branches on merge.

## 2026-07-04 (session 6) — Supabase live + auth (F2) + probe automation

- Live Supabase project wired: schema 0001_init.sql applied by user via SQL editor;
  all 9 tables verified over REST. RLS live-tested (Day 4 gate): anon read = empty,
  anon INSERT workspaces = 42501 denied, service-role write/delete works.
- F2 auth shipped (PR #11): magic-link login, @supabase/ssr cookie sessions,
  browser/server/admin clients, /login, /auth/callback (token_hash verifyOtp
  preferred + PKCE code fallback), src/proxy.ts gate (Next 16 renamed middleware),
  sign-out. First login creates workspace (7-day trial) + owner membership via
  service-role. E2E verified in live preview incl. rows in live DB.
- scripts/day1-probe.ts + icp-list.md (PR #9, ancestor of #11): automated Day-1
  probe over engine APIs + 45-entry real ICP list from web search.
- Engine key status: OpenAI key has no billing (429 insufficient_quota), Gemini
  free tier quota-blocked. Probe + live scans wait on one funded key.
- Gotchas hit: Supabase built-in SMTP silently drops past ~2 emails/hour (dev
  workaround: scripts/gen-login-link.ts mints links via admin API); stale .next
  cache after proxy.ts rename caused edge 500 "adapterFn is not a function" then
  request hangs — fix is rm .next; dependabot merges on main conflicted
  package.json/lockfile mid-PR (merged main back in, regenerated lockfile).
- USER TODO: Supabase email templates -> token_hash link format + add Vercel
  domain to Auth URL config; verify Vercel env vars (bare Supabase URL, no
  leading space in STRIPE_WEBHOOK_SECRET); rotate exposed keys post-testing.

## 2026-07-04 (session 5) — GitHub live

- Private repo github.com/kandulanikhilvarma/rankwell created (gh CLI installed via winget, device-flow auth + workflow scope refresh)
- Branch renamed master → main, all 5 commits pushed
- CI ran on push: SUCCESS (typecheck + lint + 62 tests)
- Ruleset "protect-main" active: changes to main require PR + green "checks" job; no bypass actors
- NOTE: PR-only flow now enforced — future work lands on feat/* branches

## 2026-07-04 (session 4) — Day 10 logic + Day 11 UI half (commit 85fb40b)

- src/lib/scan.ts — runBrandScan orchestrator: N prompts × 3 engines, injected deps (engine caller, extraction LLM, spend reader), call failures recorded not fatal, CircuitBreakerOpen thrown when todaySpend + accumulated ≥ MAX_DAILY_LLM_USD (checked before every call), per-engine daily_scores aggregation. Worker route later = claim-job SQL + this + upserts.
- /audit/demo — audit result per wireframe 1a: sticky primary-900 score bar (62/100), engine cards w/ mentioned/rank badges, Perplexity detail blurred + lock note, "2 more insights locked" box, trial CTA. Preview-verified.
- 62 tests green; typecheck/lint/build green. 6 routes.

Remaining offline candidates: none of substance. Auth UI/queue-worker route/email
template all need their services to be verifiable — writing them blind = rework risk.

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
