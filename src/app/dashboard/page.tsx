import Link from "next/link";
import { ArrowUpRight, BarChart3 } from "lucide-react";
import { ENGINE_LABELS } from "@/lib/seed";
import { createClient } from "@/lib/supabase/server";
import { SovDonut, Sparkline, TrendChart } from "./charts";
import { getDashboardData } from "./data";
import Shell from "./shell";

/** Workspace plan for the trial-countdown banner (RLS-scoped, same as /billing).
 *  Days-left computed here — the client Shell must stay pure (no Date.now in render). */
async function getPlan(): Promise<{ plan: string | null; trialDaysLeft: number | null }> {
  const supabase = await createClient();
  const { data } = await supabase.from("workspaces").select("plan, trial_ends_at").limit(1);
  const plan = data?.[0]?.plan ?? null;
  const ends = data?.[0]?.trial_ends_at;
  const trialDaysLeft = ends
    ? Math.max(0, Math.ceil((new Date(ends).getTime() - Date.now()) / 86400_000))
    : null;
  return { plan, trialDaysLeft };
}

export default async function Dashboard() {
  const [data, { plan, trialDaysLeft }] = await Promise.all([getDashboardData(), getPlan()]);

  // No brand yet — send the user through onboarding.
  if (!data) {
    return (
      <Shell brandName={null} plan={plan} trialDaysLeft={trialDaysLeft}>
        <EmptyState
          title="Set up your first brand"
          body="Add your firm, competitors and the questions you want tracked. Your first scan runs right after."
          cta={{ label: "Start onboarding", href: "/onboarding" }}
        />
      </Shell>
    );
  }

  // Brand exists but no scores yet — first scan is still pending.
  if (!data.hasScans || data.trend.length === 0) {
    return (
      <Shell brandName={data.brandName} plan={plan} trialDaysLeft={trialDaysLeft}>
        <EmptyState
          title="Your first scan is on the way"
          body="We run your prompts against ChatGPT, Gemini and Perplexity every day. Scores appear here once the first daily scan completes."
        />
      </Shell>
    );
  }

  const { trend, sov, promptRows: prompts, citationGaps: citations, recommendations } = data;
  const { today, delta } = data.hero;
  const missingCount = citations.filter((c) => !c.brandListed).length;

  return (
    <Shell brandName={data.brandName} plan={plan} trialDaysLeft={trialDaysLeft}>
      <main className="mx-auto max-w-7xl space-y-6 p-6">
          {/* ① Score hero + ② SOV donut */}
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-xl border border-border bg-surface-0 p-6 shadow-card lg:col-span-2">
              <h2 className="text-sm font-semibold text-ink-600">
                Visibility Score — 30 days
              </h2>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="tnum text-5xl font-bold text-primary-900">{today}</span>
                <span className="text-ink-600">/100</span>
                <span
                  className={`tnum flex items-center gap-0.5 rounded-full px-2 py-0.5 text-sm font-semibold ${
                    delta >= 0
                      ? "bg-accent-600/10 text-accent-600"
                      : "bg-danger-600/10 text-danger-600"
                  }`}
                >
                  <ArrowUpRight className={`h-4 w-4 ${delta < 0 ? "rotate-90" : ""}`} aria-hidden />
                  {delta >= 0 ? "+" : ""}
                  {delta} vs last week
                </span>
              </div>
              <div className="mt-4">
                <Sparkline data={trend} />
              </div>
            </section>

            <section className="rounded-xl border border-border bg-surface-0 p-6 shadow-card">
              <h2 className="text-sm font-semibold text-ink-600">Share of voice</h2>
              <div className="mt-2">
                {sov.length > 0 ? (
                  <SovDonut data={sov} />
                ) : (
                  <p className="py-8 text-center text-sm text-ink-600">
                    No firm mentions in the latest scan.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* ③ Trend chart */}
          <section className="rounded-xl border border-border bg-surface-0 p-6 shadow-card">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-600">
              <BarChart3 className="h-4 w-4" aria-hidden /> Score by engine
            </h2>
            <div className="mt-4">
              <TrendChart data={trend} />
            </div>
          </section>

          {/* ④ Prompt results table */}
          <section className="rounded-xl border border-border bg-surface-0 shadow-card">
            <h2 className="px-6 pt-6 text-sm font-semibold text-ink-600">
              Latest scan — prompt results
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-ink-600">
                    <th className="px-6 py-2 font-medium">Prompt</th>
                    <th className="px-3 py-2 font-medium">Engine</th>
                    <th className="px-3 py-2 font-medium">Mention</th>
                    <th className="tnum px-3 py-2 font-medium">Position</th>
                    <th className="px-6 py-2 font-medium">Sentiment</th>
                  </tr>
                </thead>
                <tbody>
                  {prompts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-center text-ink-600">
                        No responses recorded in the latest scan.
                      </td>
                    </tr>
                  )}
                  {prompts.map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="max-w-md truncate px-6 py-2 text-ink-900">{r.prompt}</td>
                      <td className="px-3 py-2 text-ink-600">{ENGINE_LABELS[r.engine]}</td>
                      <td className="px-3 py-2">
                        {r.recommended ? (
                          <span className="rounded-full bg-accent-600/10 px-2 py-0.5 text-xs font-semibold text-accent-600">
                            Recommended
                          </span>
                        ) : r.mentioned ? (
                          <span className="rounded-full bg-primary-500/10 px-2 py-0.5 text-xs font-semibold text-primary-500">
                            Mentioned
                          </span>
                        ) : (
                          <span className="rounded-full bg-surface-50 px-2 py-0.5 text-xs font-semibold text-ink-600">
                            Absent
                          </span>
                        )}
                      </td>
                      <td className="tnum px-3 py-2 text-ink-900">{r.position ?? "—"}</td>
                      <td className="px-6 py-2 text-ink-600">{r.sentiment ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ⑤ Citations + recommendations (F9) */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-border bg-surface-0 p-6 shadow-card">
              <h2 className="text-sm font-semibold text-ink-600">Top cited sources</h2>
              {citations.length > 0 ? (
                <>
                  <ul className="mt-3 space-y-2 text-sm">
                    {citations.map((c) => (
                      <li key={c.domain} className="flex items-center justify-between">
                        <span className="font-medium text-ink-900">{c.domain}</span>
                        <span className="tnum text-ink-600">
                          cited for {c.citedInPrompts}/{c.totalPrompts} prompts ·{" "}
                          {c.brandListed ? (
                            <span className="font-semibold text-accent-600">listed</span>
                          ) : (
                            <span className="font-semibold text-danger-600">missing</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-warn-600">
                    You&apos;re missing from {missingCount} of {citations.length} top-cited
                    sources.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-ink-600">
                  No sources were cited in the latest scan yet.
                </p>
              )}
            </section>

            <section className="rounded-xl border border-border bg-surface-0 p-6 shadow-card">
              <h2 className="text-sm font-semibold text-ink-600">What to fix first</h2>
              {recommendations.length > 0 ? (
                <ol className="mt-3 space-y-3 text-sm">
                  {recommendations.map((r) => (
                    <li key={r.action}>
                      <p className="font-semibold text-ink-900">{r.action}</p>
                      <p className="text-ink-600">{r.evidence}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-ink-600">
                  No citation gaps found — you&apos;re listed on the sources the engines cite.
                </p>
              )}
            </section>
          </div>
        </main>
    </Shell>
  );
}

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { label: string; href: string };
}) {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-3 px-6 py-24 text-center">
      <h1 className="font-heading text-2xl font-bold text-primary-900">{title}</h1>
      <p className="text-ink-600">{body}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-2 rounded-lg bg-primary-700 px-5 py-2.5 font-semibold text-white hover:bg-primary-500"
        >
          {cta.label}
        </Link>
      )}
    </main>
  );
}
