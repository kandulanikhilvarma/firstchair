<!-- Conventional-commit title, e.g. feat(dashboard): ... / fix(auth): ... -->

## What & why
<!-- One or two sentences. What changes, and the reason — not a file list. -->

## How it was verified
- [ ] `npm run typecheck` green
- [ ] `npm run lint` green
- [ ] `npm test` green
- [ ] Task-specific check: <!-- what you ran / saw to know it works -->

## Checklist
- [ ] Diff is small and surgical (~<400 lines); unrelated cleanup split out
- [ ] New table? RLS policy ships in the same migration; API inputs zod-validated
- [ ] No secrets client-side; Stripe state only via verified webhooks
- [ ] UI uses Prism tokens from `globals.css` @theme; loading/empty/error states covered
