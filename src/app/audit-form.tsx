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

/** A filing cover sheet: ruled fields, small-caps notation, oxblood commit. */
export default function AuditForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setResult(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    // Carry a referral tag from the link the lead arrived on (?ref=), so a
    // referred audit can be credited later.
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) data.ref = ref;
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
      <div className="w-full max-w-md border border-line-strong bg-surface-1 text-left">
        <div className="border-b border-line-strong bg-surface-2 px-6 py-2.5">
          <span className="notation text-[0.8rem] text-fg-muted">Record of findings</span>
        </div>
        <div className="px-6 py-6">
          <h3 className="text-2xl text-fg">{result.firmName}</h3>
          <p className="mt-3 flex items-baseline gap-2 border-b border-line pb-5">
            <span className="tnum font-display text-6xl leading-none text-brand-700">
              {result.overallScore}
            </span>
            <span className="notation text-fg-muted">of 100 visibility</span>
          </p>
          <table className="mt-4 w-full text-left">
            <tbody>
              {result.engines.map((e) => (
                <tr key={e.engine} className="border-b border-line last:border-0">
                  <th scope="row" className="py-2 pr-3 font-normal text-fg">
                    {ENGINE_LABELS[e.engine] ?? e.engine}
                  </th>
                  <td className="transcript tnum py-2 text-right text-sm text-fg">
                    {e.visibilityScore}/100 · {e.mentionedInPrompts} of {e.totalPrompts}
                    {e.bestPosition ? ` · best #${e.bestPosition}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p role="status" className="mt-4 text-sm text-success">
            {message}
          </p>
          <a
            href="/login"
            className="mt-5 block bg-brand-500 px-4 py-3.5 text-center font-semibold text-on-brand transition-colors hover:bg-brand-600"
          >
            Track this daily — start free trial
          </a>
        </div>
      </div>
    );
  }

  const fieldCls =
    "mt-1 w-full border-0 border-b border-line-strong bg-transparent px-0 py-2 text-fg placeholder:text-fg-muted/55 focus:border-brand-500 focus:outline-none focus:ring-0";

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md border border-line-strong bg-surface-1 text-left"
    >
      <div className="flex items-baseline justify-between border-b border-line-strong bg-surface-2 px-6 py-2.5">
        <span className="notation text-[0.8rem] text-fg-muted">Request for audit</span>
        <span className="transcript text-xs text-fg-muted">No. 001</span>
      </div>

      <div className="px-6 py-6">
        <div className="flex flex-col gap-4">
          <label className="block text-sm">
            <span className="notation text-fg-muted">Firm name</span>
            <input name="firmName" required placeholder="Smith &amp; Jones LLP" className={fieldCls} />
          </label>
          <label className="block text-sm">
            <span className="notation text-fg-muted">City</span>
            <input name="city" required placeholder="Austin" className={fieldCls} />
          </label>
          <label className="block text-sm">
            <span className="notation text-fg-muted">Practice area</span>
            <input name="practiceArea" required placeholder="Personal injury" className={fieldCls} />
          </label>
          <label className="block text-sm">
            <span className="notation text-fg-muted">Work email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="you@firm.com"
              className={fieldCls}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-6 w-full cursor-pointer bg-brand-500 px-4 py-3.5 font-semibold text-on-brand transition-colors hover:bg-brand-600 disabled:cursor-wait disabled:opacity-70"
        >
          {status === "submitting" ? "Querying the engines…" : "Run my free audit"}
        </button>

        {message && (
          <p
            role="status"
            className={`mt-3 text-sm ${status === "error" ? "text-danger" : "text-success"}`}
          >
            {message}
          </p>
        )}

        <p className="mt-3 text-xs text-fg-muted">
          5 real client questions across 3 engines. Results in about 2 minutes. No card.
        </p>
      </div>
    </form>
  );
}
