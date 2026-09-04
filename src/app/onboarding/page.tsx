"use client";

// Onboarding wizard — wireframe 1e. Persists brand/competitors/prompts to
// Supabase (F3), then triggers the first scan (F5) so the dashboard has data.

import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { expandTemplates } from "@/lib/prompts/templates";
import SiteHeader from "../site-header";
import { saveOnboarding } from "./actions";

/** Shared back control for the wizard steps — moving backward was impossible,
 *  so a mistake on an early step meant restarting. */
function StepBack({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="notation inline-flex items-center gap-1.5 self-start text-fg-muted hover:text-brand-700"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Back
    </button>
  );
}

const STEPS = ["Brand", "Aliases", "Prompts", "Save"] as const;

const inputCls =
  "w-full border border-line-strong bg-surface-1 px-3 py-2.5 text-fg placeholder:text-fg-muted/60 focus:border-brand-500 focus:outline-none";

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
    <div className="flex flex-1 flex-col">
      <SiteHeader homeHref="/dashboard" />
      <main className="mx-auto w-full max-w-2xl px-6 py-12">
      {/* Step indicator */}
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`tnum flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                i < step
                  ? "bg-success text-on-brand"
                  : i === step
                    ? "bg-brand-500 text-on-brand"
                    : "border border-line bg-surface-1 text-fg-muted"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
            </span>
            <span
              className={`text-sm font-medium ${i === step ? "text-fg" : "text-fg-muted"}`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-line" />}
          </li>
        ))}
      </ol>

      <div className="mt-8 border border-line-strong bg-surface-1 p-8">
        {step === 0 && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setStep(1);
            }}
          >
            <h1 className="font-display text-3xl text-fg">Your firm</h1>
            <label className="text-sm font-medium text-fg">
              Firm name
              <input
                required
                value={brand.name}
                onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                placeholder="Austin Injury Law"
                className={inputCls}
              />
            </label>
            <label className="text-sm font-medium text-fg">
              City
              <input
                required
                value={brand.city}
                onChange={(e) => setBrand({ ...brand, city: e.target.value })}
                placeholder="Austin"
                className={inputCls}
              />
            </label>
            <label className="text-sm font-medium text-fg">
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
              className="mt-2 cursor-pointer self-start bg-brand-500 px-5 py-2.5 font-semibold text-on-brand transition-colors duration-200 hover:bg-brand-600"
            >
              Continue
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h1 className="font-display text-3xl text-fg">
              Aliases &amp; competitors
            </h1>
            <label className="text-sm font-medium text-fg">
              Other spellings of your firm (comma-separated)
              <input
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                placeholder={`${brand.name || "Your firm"} LLP, ${brand.name || "Your firm"} & Associates`}
                className={inputCls}
              />
            </label>
            <div>
              <label className="text-sm font-medium text-fg">
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
                    className="cursor-pointer border border-line-strong bg-surface-1 px-4 font-semibold text-brand-700 hover:border-brand-500 disabled:cursor-default disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </label>
              <ul className="mt-2 flex flex-wrap gap-2">
                {competitors.map((c) => (
                  <li
                    key={c}
                    className="bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2 flex items-center gap-5">
              <StepBack onClick={() => setStep(0)} />
              <button
                type="button"
                onClick={toPrompts}
                className="cursor-pointer bg-brand-500 px-5 py-2.5 font-semibold text-on-brand transition-colors duration-200 hover:bg-brand-600"
              >
                Generate my 20 prompts
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h1 className="font-display text-3xl text-fg">
              Your tracked questions
            </h1>
            <p className="text-sm text-fg-muted">
              These are the questions we&apos;ll put to the engines. Toggle off any
              that don&apos;t fit.
            </p>
            <ul className="max-h-80 space-y-1 overflow-y-auto pr-2">
              {prompts.map((p, i) => (
                <li key={p.text}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2">
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
                      className="mt-0.5 h-4 w-4 accent-brand-500"
                    />
                    <span className={p.active ? "text-fg" : "text-fg-muted line-through"}>
                      {p.text}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="tnum text-sm text-fg-muted">
              {prompts.filter((p) => p.active).length} of {prompts.length} active
            </p>
            <div className="mt-1 flex items-center gap-5">
              <StepBack onClick={() => setStep(1)} />
              <button
                type="button"
                onClick={() => setStep(3)}
                className="cursor-pointer bg-brand-500 px-5 py-2.5 font-semibold text-on-brand transition-colors duration-200 hover:bg-brand-600"
              >
                Save my setup
              </button>
            </div>
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
    </div>
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

  const run = useCallback(async () => {
    setState({ status: "saving" });
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
  }, [input]);

  useEffect(() => {
    if (started.current) return; // StrictMode double-mount — run exactly once
    started.current = true;
    run();
  }, [run]);

  const activePrompts = input.prompts.filter((p) => p.active).length;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl text-fg">
        {state.status === "done" ? "You're all set" : "Setting up your tracker"}
      </h1>
      {state.status === "saving" && (
        <p role="status" className="text-sm text-fg-muted">
          Saving your firm, competitors and prompts…
        </p>
      )}
      {state.status === "scanning" && (
        <p role="status" className="flex items-center gap-2 text-sm text-fg-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Running your first scan across ChatGPT, Gemini and Perplexity. This
          takes about a minute.
        </p>
      )}
      {state.status === "error" && (
        <div className="flex flex-col gap-3">
          <p role="alert" className="text-sm text-danger">
            {state.message}
          </p>
          {/* A plan-limit error names Billing as the way out; give it a real link. */}
          {/Billing/.test(state.message) && (
            <Link
              href="/billing"
              className="self-start bg-brand-500 px-5 py-2.5 font-semibold text-on-brand transition-colors hover:bg-brand-600"
            >
              Go to Billing
            </Link>
          )}
          <button
            type="button"
            onClick={run}
            className="cursor-pointer self-start bg-brand-500 px-5 py-2.5 font-semibold text-on-brand transition-colors hover:bg-brand-600"
          >
            Try again
          </button>
        </div>
      )}
      {state.status === "done" && (
        <>
          <p role="status" className="text-sm text-fg-muted">
            {activePrompts} prompts tracked for {input.name} vs{" "}
            {input.competitors.length} competitor
            {input.competitors.length === 1 ? "" : "s"}.{" "}
            {state.scanned
              ? "Your first results are ready."
              : "Your first scan is queued and will appear shortly; daily scans run every morning."}
          </p>
          <Link
            href="/dashboard"
            className="mt-2 self-start bg-brand-500 px-5 py-2.5 font-semibold text-on-brand transition-colors hover:bg-brand-600"
          >
            View my dashboard
          </Link>
        </>
      )}
    </div>
  );
}
