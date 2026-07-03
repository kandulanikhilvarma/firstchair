"use client";

// Onboarding wizard — wireframe 1e. Local state only; persistence + real scan
// wire in with Supabase (Day 13 verify needs live first-scan trigger).

import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { expandTemplates } from "@/lib/prompts/templates";
import { ENGINE_LABELS, ENGINES } from "@/lib/seed";

const STEPS = ["Brand", "Aliases", "Prompts", "First scan"] as const;

const inputCls =
  "w-full rounded-lg border border-border bg-surface-0 px-3 py-2.5 text-ink-900 placeholder:text-ink-600/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2";

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState({ name: "", city: "", practice: "" });
  const [aliases, setAliases] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [competitorDraft, setCompetitorDraft] = useState("");
  const [prompts, setPrompts] = useState<{ text: string; active: boolean }[]>([]);

  function toPrompts() {
    setPrompts(
      expandTemplates({ city: brand.city, practice: brand.practice }).map(
        (text) => ({ text, active: true }),
      ),
    );
    setStep(2);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      {/* Step indicator */}
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`tnum flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                i < step
                  ? "bg-accent-600 text-white"
                  : i === step
                    ? "bg-primary-700 text-white"
                    : "border border-border bg-surface-0 text-ink-600"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
            </span>
            <span
              className={`text-sm font-medium ${i === step ? "text-ink-900" : "text-ink-600"}`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-xl border border-border bg-surface-0 p-8 shadow-card">
        {step === 0 && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setStep(1);
            }}
          >
            <h1 className="text-2xl font-bold text-primary-900">Your firm</h1>
            <label className="text-sm font-medium text-ink-900">
              Firm name
              <input
                required
                value={brand.name}
                onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                placeholder="Austin Injury Law"
                className={inputCls}
              />
            </label>
            <label className="text-sm font-medium text-ink-900">
              City
              <input
                required
                value={brand.city}
                onChange={(e) => setBrand({ ...brand, city: e.target.value })}
                placeholder="Austin"
                className={inputCls}
              />
            </label>
            <label className="text-sm font-medium text-ink-900">
              Practice area
              <input
                required
                value={brand.practice}
                onChange={(e) => setBrand({ ...brand, practice: e.target.value })}
                placeholder="Personal injury"
                className={inputCls}
              />
            </label>
            <button
              type="submit"
              className="mt-2 cursor-pointer self-start rounded-lg bg-primary-700 px-5 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-primary-500"
            >
              Continue
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-primary-900">
              Aliases &amp; competitors
            </h1>
            <label className="text-sm font-medium text-ink-900">
              Other spellings of your firm (comma-separated)
              <input
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                placeholder={`${brand.name || "Your firm"} LLP, ${brand.name || "Your firm"} & Associates`}
                className={inputCls}
              />
            </label>
            <div>
              <label className="text-sm font-medium text-ink-900">
                Competitors (up to 5)
                <div className="flex gap-2">
                  <input
                    value={competitorDraft}
                    onChange={(e) => setCompetitorDraft(e.target.value)}
                    placeholder="Smith & Jones LLP"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    disabled={competitors.length >= 5 || !competitorDraft.trim()}
                    onClick={() => {
                      setCompetitors([...competitors, competitorDraft.trim()]);
                      setCompetitorDraft("");
                    }}
                    className="cursor-pointer rounded-lg border border-border bg-surface-0 px-4 font-semibold text-primary-700 hover:border-primary-500 disabled:cursor-default disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </label>
              <ul className="mt-2 flex flex-wrap gap-2">
                {competitors.map((c) => (
                  <li
                    key={c}
                    className="rounded-full bg-primary-500/10 px-3 py-1 text-sm font-medium text-primary-700"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={toPrompts}
              className="mt-2 cursor-pointer self-start rounded-lg bg-primary-700 px-5 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-primary-500"
            >
              Generate my 20 prompts
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-primary-900">
              Your tracked questions
            </h1>
            <p className="text-sm text-ink-600">
              These are the questions we&apos;ll put to the engines. Toggle off any
              that don&apos;t fit.
            </p>
            <ul className="max-h-80 space-y-1 overflow-y-auto pr-2">
              {prompts.map((p, i) => (
                <li key={p.text}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-50">
                    <input
                      type="checkbox"
                      checked={p.active}
                      onChange={() =>
                        setPrompts(
                          prompts.map((q, j) =>
                            j === i ? { ...q, active: !q.active } : q,
                          ),
                        )
                      }
                      className="mt-0.5 h-4 w-4 accent-primary-700"
                    />
                    <span className={p.active ? "text-ink-900" : "text-ink-600 line-through"}>
                      {p.text}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="tnum text-sm text-ink-600">
              {prompts.filter((p) => p.active).length} of {prompts.length} active
            </p>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="mt-1 cursor-pointer self-start rounded-lg bg-primary-700 px-5 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-primary-500"
            >
              Start my first scan
            </button>
          </div>
        )}

        {step === 3 && <FirstScan />}
      </div>
    </main>
  );
}

/** Per-engine progress bars — this screen IS the activation metric (§1.8), so real
 *  per-engine feedback, not a spinner. Mock timing until the queue exists. */
function FirstScan() {
  const [progress, setProgress] = useState<Record<string, number>>({
    openai: 0,
    gemini: 0,
    perplexity: 0,
  });

  useEffect(() => {
    const speeds: Record<string, number> = { openai: 4, gemini: 2.6, perplexity: 1.8 };
    const t = setInterval(() => {
      setProgress((p) => {
        const next = { ...p };
        for (const e of ENGINES) next[e] = Math.min(100, next[e] + speeds[e]);
        return next;
      });
    }, 120);
    return () => clearInterval(t);
  }, []);

  const done = ENGINES.every((e) => progress[e] === 100);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-primary-900">
        First scan running
      </h1>
      {ENGINES.map((e) => (
        <div key={e}>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-ink-900">{ENGINE_LABELS[e]}</span>
            <span className="tnum text-ink-600">
              {progress[e] === 100
                ? "done"
                : progress[e] === 0
                  ? "queued"
                  : `${Math.round(progress[e])}%`}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress[e])}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${ENGINE_LABELS[e]} scan progress`}
            className="mt-1 h-2 overflow-hidden rounded-full bg-surface-50"
          >
            <div
              className="h-full rounded-full bg-primary-500 transition-[width] duration-150"
              style={{ width: `${progress[e]}%` }}
            />
          </div>
        </div>
      ))}
      {done && (
        <Link
          href="/dashboard"
          className="mt-2 self-start rounded-lg bg-accent-600 px-5 py-2.5 font-semibold text-white transition-colors duration-200 hover:opacity-90"
        >
          View my dashboard
        </Link>
      )}
    </div>
  );
}
