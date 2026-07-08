"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "ok" | "error";

const ENGINE_LABELS: Record<string, string> = {
  openai: "ChatGPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

interface AuditResult {
  firmName: string;
  overallScore: number;
  engines: Array<{
    engine: string;
    visibilityScore: number;
    mentionedInPrompts: number;
    totalPrompts: number;
    bestPosition: number | null;
  }>;
}

export default function AuditForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setResult(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (res.ok) {
        setStatus("ok");
        setMessage(body.message ?? "Audit started — results will be emailed.");
        setResult(body.result ?? null);
      } else {
        setStatus("error");
        setMessage(body.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "ok" && result) {
    return (
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-surface-0 p-6 text-left shadow-card">
        <div>
          <h3 className="font-heading text-lg font-bold text-primary-900">{result.firmName}</h3>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="tnum text-4xl font-bold text-primary-900">{result.overallScore}</span>
            <span className="text-ink-600">/100 AI visibility</span>
          </p>
        </div>
        <ul className="space-y-2 text-sm">
          {result.engines.map((e) => (
            <li key={e.engine} className="flex items-center justify-between">
              <span className="font-medium text-ink-900">{ENGINE_LABELS[e.engine] ?? e.engine}</span>
              <span className="tnum text-ink-600">
                {e.visibilityScore}/100 · {e.mentionedInPrompts}/{e.totalPrompts} prompts
                {e.bestPosition ? ` · best #${e.bestPosition}` : ""}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-accent-600">{message}</p>
        <a
          href="/login"
          className="rounded-lg bg-primary-700 px-4 py-3 text-center font-semibold text-white transition-colors duration-200 hover:bg-primary-500"
        >
          Track this daily — start free trial
        </a>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-surface-0 px-3 py-2.5 text-ink-900 placeholder:text-ink-600/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2";

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-border bg-surface-0 p-6 text-left shadow-card"
    >
      <label className="text-sm font-medium text-ink-900">
        Firm name
        <input name="firmName" required placeholder="Smith & Jones LLP" className={inputCls} />
      </label>
      <label className="text-sm font-medium text-ink-900">
        City
        <input name="city" required placeholder="Austin" className={inputCls} />
      </label>
      <label className="text-sm font-medium text-ink-900">
        Practice area
        <input name="practiceArea" required placeholder="Personal injury" className={inputCls} />
      </label>
      <label className="text-sm font-medium text-ink-900">
        Work email
        <input name="email" type="email" required placeholder="you@firm.com" className={inputCls} />
      </label>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-1 cursor-pointer rounded-lg bg-primary-700 px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-primary-500 disabled:opacity-60"
      >
        {status === "submitting" ? "Running audit…" : "Run my free AI visibility audit"}
      </button>
      {message && (
        <p
          role="status"
          className={`text-sm ${status === "error" ? "text-danger-600" : "text-accent-600"}`}
        >
          {message}
        </p>
      )}
      <p className="text-xs text-ink-600">
        5 real client questions × 3 AI engines. Results in ~2 minutes. No credit card.
      </p>
    </form>
  );
}
