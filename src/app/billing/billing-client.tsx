"use client";

import { Check } from "lucide-react";
import { useState } from "react";

type Interval = "monthly" | "annual";

const PLANS = [
  {
    id: "solo" as const,
    name: "Solo",
    monthly: 49,
    annual: 490, // 2 months free
    blurb: "1 brand, daily scans across all 3 engines.",
    features: ["1 tracked brand", "Daily scans", "All 3 AI engines", "Weekly email report"],
  },
  {
    id: "agency" as const,
    name: "Agency",
    monthly: 149,
    annual: 1490,
    blurb: "10 brands — daily for 3 priority, weekly for the rest.",
    features: ["10 tracked brands", "Priority daily scans", "All 3 AI engines", "Competitor tracking"],
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

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-600">
          Current plan:{" "}
          <span className="font-semibold text-ink-900 capitalize">{currentPlan}</span>
          {currentPlan === "trial" && trialEndsAt && (
            <> — trial ends {new Date(trialEndsAt).toLocaleDateString()}</>
          )}
        </p>
        {subscribed && (
          <button
            type="button"
            onClick={manage}
            disabled={pending !== null}
            className="cursor-pointer rounded-lg border border-border bg-surface-0 px-4 py-2 text-sm font-semibold text-primary-700 hover:border-primary-500 disabled:opacity-60"
          >
            {pending === "portal" ? "Opening…" : "Manage billing"}
          </button>
        )}
      </div>

      {/* interval toggle */}
      <div className="mt-6 inline-flex rounded-lg border border-border bg-surface-0 p-1">
        {(["monthly", "annual"] as const).map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setInterval(i)}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium capitalize ${
              interval === i ? "bg-primary-700 text-white" : "text-ink-600 hover:text-ink-900"
            }`}
          >
            {i}
            {i === "annual" && <span className="ml-1 text-xs opacity-80">2 months free</span>}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {PLANS.map((p) => {
          const price = interval === "monthly" ? p.monthly : p.annual;
          const isCurrent = currentPlan === p.id;
          return (
            <div
              key={p.id}
              className={`flex flex-col rounded-xl border bg-surface-0 p-6 shadow-card ${
                p.highlight ? "border-primary-500" : "border-border"
              }`}
            >
              <h2 className="font-heading text-xl font-bold text-ink-900">{p.name}</h2>
              <p className="mt-1 text-sm text-ink-600">{p.blurb}</p>
              <p className="tnum mt-4 text-3xl font-bold text-primary-900">
                ${price}
                <span className="text-base font-normal text-ink-600">
                  /{interval === "monthly" ? "mo" : "yr"}
                </span>
              </p>
              <ul className="mt-4 flex flex-1 flex-col gap-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-ink-900">
                    <Check className="h-4 w-4 text-accent-600" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => checkout(p.id)}
                disabled={isCurrent || pending !== null}
                className="mt-6 cursor-pointer rounded-lg bg-primary-700 px-4 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-primary-500 disabled:cursor-default disabled:opacity-60"
              >
                {isCurrent
                  ? "Current plan"
                  : pending === p.id
                    ? "Starting…"
                    : "Start 7-day trial"}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <p role="status" className="mt-4 text-sm text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}
