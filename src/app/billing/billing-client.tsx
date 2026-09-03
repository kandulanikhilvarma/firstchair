"use client";

import { useState } from "react";

type Interval = "monthly" | "annual";

const PLANS = [
  {
    id: "solo" as const,
    name: "Solo",
    monthly: 49,
    annual: 490, // 2 months free
    blurb: "One firm, scanned daily across all three engines.",
    features: ["One tracked firm", "20 questions, daily", "Five competitors", "Weekly email report"],
  },
  {
    id: "agency" as const,
    name: "Agency",
    monthly: 149,
    annual: 1490,
    blurb: "Ten client firms — daily on three priority, weekly on the rest.",
    features: [
      "Ten tracked firms",
      "Priority daily scans",
      "Competitors tracked per firm",
      "Client-ready weekly emails",
    ],
    highlight: true,
  },
];

export default function BillingClient({
  currentPlan,
  trialEndsAt,
}: {
  currentPlan: string;
  trialEndsAt: string | null;
}) {
  const [interval, setInterval] = useState<Interval>("monthly");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function checkout(plan: "solo" | "agency") {
    setPending(plan);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const body = await res.json();
      if (res.ok && body.url) {
        window.location.assign(body.url);
      } else {
        setError(body.error ?? "Could not start checkout.");
        setPending(null);
      }
    } catch {
      setError("Network error. Please try again.");
      setPending(null);
    }
  }

  async function manage() {
    setPending("portal");
    setError("");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const body = await res.json();
      if (res.ok && body.url) window.location.assign(body.url);
      else {
        setError(body.error ?? "Could not open billing portal.");
        setPending(null);
      }
    } catch {
      setError("Network error. Please try again.");
      setPending(null);
    }
  }

  const subscribed = currentPlan === "solo" || currentPlan === "agency";
  const trialDate = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line-strong pb-4">
        <p className="text-fg">
          <span className="notation text-fg-muted">Current plan</span>{" "}
          <span className="font-semibold capitalize text-fg">{currentPlan}</span>
          {currentPlan === "trial" && trialDate && (
            <span className="text-fg-muted"> — trial ends {trialDate}</span>
          )}
        </p>
        {subscribed && (
          <button
            type="button"
            onClick={manage}
            disabled={pending !== null}
            className="notation cursor-pointer border-b-2 border-warning pb-0.5 text-brand-700 hover:border-brand-500 disabled:opacity-60"
          >
            {pending === "portal" ? "Opening…" : "Manage billing"}
          </button>
        )}
      </div>

      {/* Billing interval */}
      <fieldset className="mt-8">
        <legend className="notation text-fg-muted">Billing interval</legend>
        <div className="mt-2 inline-flex border border-line-strong">
          {(["monthly", "annual"] as const).map((i) => (
            <button
              key={i}
              type="button"
              aria-pressed={interval === i}
              onClick={() => setInterval(i)}
              className={`cursor-pointer px-5 py-2 text-sm font-semibold capitalize transition-colors ${
                interval === i
                  ? "bg-brand-500 text-on-brand"
                  : "bg-surface-1 text-fg hover:bg-surface-2"
              }`}
            >
              {i}
              {i === "annual" && (
                <span className="ml-2 text-xs font-normal opacity-85">2 months free</span>
              )}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-8 grid gap-px border border-line-strong bg-line-strong sm:grid-cols-2">
        {PLANS.map((p) => {
          const price = interval === "monthly" ? p.monthly : p.annual;
          const isCurrent = currentPlan === p.id;
          const dark = p.highlight;
          return (
            <div
              key={p.id}
              className={`flex flex-col p-8 ${dark ? "bg-brand-700 text-on-brand" : "bg-surface-1"}`}
            >
              <h2
                className={`font-display text-3xl ${dark ? "text-on-brand" : "text-fg"}`}
              >
                {p.name}
              </h2>
              <p className={`mt-2 text-sm ${dark ? "text-on-brand" : "text-fg"}`}>
                {p.blurb}
              </p>
              <p className="mt-5 flex items-baseline gap-1.5">
                <span
                  className={`tnum font-display text-5xl ${dark ? "text-on-brand" : "text-fg"}`}
                >
                  ${price}
                </span>
                <span className={`notation ${dark ? "text-on-brand" : "text-fg-muted"}`}>
                  per {interval === "monthly" ? "month" : "year"}
                </span>
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className={`border-b pb-2.5 last:border-0 ${
                      dark ? "border-brand-500 text-on-brand" : "border-line text-fg"
                    }`}
                  >
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => checkout(p.id)}
                disabled={isCurrent || pending !== null}
                className={`mt-8 cursor-pointer px-4 py-3 font-semibold transition-colors disabled:cursor-default disabled:opacity-60 ${
                  dark
                    ? "bg-warning text-fg hover:bg-brand-100"
                    : "border border-brand-500 text-brand-700 hover:bg-brand-600 hover:text-on-brand"
                }`}
              >
                {isCurrent ? "Current plan" : pending === p.id ? "Starting…" : "Start 7-day trial"}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
