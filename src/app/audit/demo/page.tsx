import { Check, Lock, X } from "lucide-react";
import Link from "next/link";

// Audit result — wireframe 1a: sticky score bar, engine cards, blurred locked
// rows + trial CTA. Demo route; F1 live path renders this with real scan data.
// ponytail: static demo data inline — replaced by scan results when /api/audit goes live

const ENGINE_CARDS = [
  {
    engine: "ChatGPT",
    mentioned: true,
    rank: 2,
    detail:
      "Named your firm second for “best personal injury lawyer in Austin”, after Smith & Jones LLP.",
    locked: false,
  },
  {
    engine: "Gemini",
    mentioned: true,
    rank: 1,
    detail:
      "Recommends your firm first, citing your Justia profile and 4.8-star Google reviews.",
    locked: false,
  },
  {
    engine: "Perplexity",
    mentioned: false,
    rank: null,
    detail:
      "Recommends Smith & Jones LLP and Lone Star Legal. Your firm does not appear — Avvo listing gap is the likely cause.",
    locked: true,
  },
];

export default function AuditDemo() {
  return (
    <div className="min-h-screen">
      {/* Sticky score bar — pins for the whole scroll (1a note) */}
      <header className="sticky top-0 z-10 border-b border-border bg-primary-900 px-6 py-3 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <p className="font-semibold">Austin Injury Law</p>
            <p className="tnum text-sm text-white/70">
              AI Visibility Score: 62/100 · found by 2 of 3 engines
            </p>
          </div>
          <span
            className="tnum flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent-600 text-lg font-bold"
            aria-label="Score 62 out of 100"
          >
            62
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-6 py-8">
        <h1 className="text-2xl font-bold text-primary-900">
          What the AI engines say about your firm
        </h1>

        {ENGINE_CARDS.map((c) => (
          <section
            key={c.engine}
            className="rounded-xl border border-border bg-surface-0 p-6 shadow-card"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-900">{c.engine}</h2>
              {c.mentioned ? (
                <span className="flex items-center gap-1 rounded-full bg-accent-600/10 px-3 py-1 text-sm font-semibold text-accent-600">
                  <Check className="h-4 w-4" aria-hidden /> mentioned
                  {c.rank !== null && <span className="tnum">· rank {c.rank}</span>}
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-danger-600/10 px-3 py-1 text-sm font-semibold text-danger-600">
                  <X className="h-4 w-4" aria-hidden /> not found
                </span>
              )}
            </div>
            <p
              className={`mt-3 text-ink-600 ${c.locked ? "select-none blur-sm" : ""}`}
              aria-hidden={c.locked}
            >
              {c.detail}
            </p>
            {c.locked && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-ink-600">
                <Lock className="h-4 w-4" aria-hidden /> Full detail unlocks with a
                free trial
              </p>
            )}
          </section>
        ))}

        {/* Locked additional insights */}
        <section className="rounded-xl border border-dashed border-border bg-surface-50 p-6 text-center">
          <p className="flex items-center justify-center gap-2 font-semibold text-ink-900">
            <Lock className="h-4 w-4" aria-hidden /> 2 more insights locked
          </p>
          <p className="mt-1 text-sm text-ink-600">
            Which sources the engines cite · where competitors beat you, prompt by
            prompt
          </p>
        </section>

        <Link
          href="/#audit"
          className="block rounded-lg bg-primary-700 px-6 py-4 text-center text-lg font-semibold text-white transition-colors duration-200 hover:bg-primary-500"
        >
          Start free trial — track all 20 prompts daily
        </Link>
        <p className="text-center text-sm text-ink-600">
          7-day trial · card required, nothing charged until it ends · cancel in one
          click
        </p>
      </main>
    </div>
  );
}
