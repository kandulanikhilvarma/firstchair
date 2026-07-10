"use client";

// Onboarding wizard — wireframe 1e. Persists brand/competitors/prompts to
// Supabase (F3), then triggers the first scan (F5) so the dashboard has data.

import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { expandTemplates } from "@/lib/prompts/templates";
import { saveOnboarding } from "./actions";

const STEPS = ["Brand", "Aliases", "Prompts", "Save"] as const;

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
              Save my setup
            </button>
          </div>
        )}

        {step === 3 && (
          <SaveStep
            input={{
              name: brand.name,
              city: brand.city,
              practice: brand.practice,
              aliases: aliases
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean),
              competitors,
              prompts,
            }}
          />
        )}
      </div>
    </main>
  );
}

/** Persists the wizard, then kicks off the first scan immediately (F5 worker via
 *  /api/scan/run) so the user lands on a dashboard with real data instead of an
 *  empty one waiting for the 6am cron. */
function SaveStep({
  input,
}: {
  input: Parameters<typeof saveOnboarding>[0];
}) {
  const [state, setState] = useState<
    | { status: "saving" }
    | { status: "scanning" }
    | { status: "done"; scanned: boolean }
    | { status: "error"; message: string }
  >({ status: "saving" });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // StrictMode double-mount — run exactly once
    started.current = true;
    (async () => {
      const res = await saveOnboarding(input);
      if (!res.ok) {
        setState({ status: "error", message: res.error });
        return;
      }
      setState({ status: "scanning" });
      // First scan is best-effort: if it fails or times out the job stays
      // queued for the daily cron, so never block the user on it.
      try {
        const scan = await fetch("/api/scan/run", { method: "POST" });
        setState({ status: "done", scanned: scan.ok });
      } catch {
        setState({ status: "done", scanned: false });
      }
    })();
  }, [input]);

  const activePrompts = input.prompts.filter((p) => p.active).length;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-primary-900">
        {state.status === "done" ? "You're all set" : "Setting up your tracker"}
      </h1>
      {state.status === "saving" && (
        <p role="status" className="text-sm text-ink-600">
          Saving your firm, competitors and prompts…
        </p>
      )}
      {state.status === "scanning" && (
        <p role="status" className="flex items-center gap-2 text-sm text-ink-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Running your first scan across ChatGPT, Gemini and Perplexity — this
          takes about a minute.
        </p>
      )}
      {state.status === "error" && (
        <p role="status" className="text-sm text-danger-600">
          {state.message}
        </p>
      )}
      {state.status === "done" && (
        <>
          <p role="status" className="text-sm text-ink-600">
            {activePrompts} prompts tracked for {input.name} vs{" "}
            {input.competitors.length} competitor
            {input.competitors.length === 1 ? "" : "s"}.{" "}
            {state.scanned
              ? "Your first results are ready."
              : "Your first scan is queued and will appear shortly; daily scans run every morning."}
          </p>
          <Link
            href="/dashboard"
            className="mt-2 self-start rounded-lg bg-accent-600 px-5 py-2.5 font-semibold text-white transition-colors duration-200 hover:opacity-90"
          >
            View my dashboard
          </Link>
        </>
      )}
    </div>
  );
}
