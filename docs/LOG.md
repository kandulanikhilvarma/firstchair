# Build log

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
