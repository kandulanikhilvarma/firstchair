<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# First Chair — Claude Code instructions

## What this is
GEO/AI-visibility tracker for law firms. Next.js 16 App Router + TS + Tailwind v4 +
Supabase (RLS) + Stripe + Resend. Master doc: ../GEO-MVP-Master-Plan.md.

## Non-negotiable rules (Karpathy guidelines)
1. THINK FIRST: before implementing, state assumptions + plan as numbered steps
   with a verify check per step. If ambiguous, ask; don't pick silently.
2. SIMPLICITY: minimum code that solves the task. No speculative abstractions,
   no unrequested config/flexibility. If it could be 50 lines, don't write 200.
3. SURGICAL: touch only files the task requires. Never "improve" adjacent code.
   Match existing style. Remove only orphans your change created.
4. VERIFIABLE: every task ends with `npm run typecheck && npm run lint && npm test`
   green, plus the task's specific check. Write the failing test first for bugs.

## Security rules
- No secrets in code/client. Server-only: service-role key, Stripe secret, CRON_SECRET.
- Every new table: RLS policy in the same migration. zod on every API input.
- LLM output = untrusted: schema-validate, render as text only.
- Stripe state only via verified webhooks.

## Conventions
- Conventional commits (feat:/fix:/chore:). Small PRs (< ~400 lines diff).
- DB changes only via supabase/migrations. LLM prompts versioned in /prompts.
- UI: design tokens from src/app/globals.css @theme only; Lucide icons; no emojis
  in UI; loading/empty/error states required for every data view.
- Tailwind v4: tokens live in globals.css @theme, there is no tailwind.config.
