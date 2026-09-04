import Link from "next/link";
import { ArrowUpRight, BarChart3 } from "lucide-react";
import { ENGINE_LABELS } from "@/lib/seed";
import { SovDonut, Sparkline, TrendChart } from "./charts";
import { getBrands, getDashboardData, getPlan } from "./data";
import Shell from "./shell";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand: requestedBrand } = await searchParams;
  const [data, { plan, trialDaysLeft }, brands] = await Promise.all([
    getDashboardData(requestedBrand),
    getPlan(),
    getBrands(),
  ]);
  const currentBrandId = brands.find((b) => b.id === requestedBrand)?.id ?? brands[0]?.id ?? null;
  const shellProps = { brands, currentBrandId, plan, trialDaysLeft };

  // No brand yet — send the user through onboarding.
  if (!data) {
    return (
      <Shell brandName={null} {...shellProps}>
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
      <Shell brandName={data.brandName} {...shellProps}>
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
    <Shell brandName={data.brandName} {...shellProps}>
      <main className="mx-auto max-w-7xl space-y-6 p-6">
          {/* ① Score hero + ② SOV donut */}
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="border border-line-strong bg-surface-1 p-6 lg:col-span-2">
              <h2 className="text-sm font-semibold text-fg-muted">
                Visibility Score, last 30 days
              </h2>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="tnum font-display text-6xl text-brand-700">{today}</span>
                <span className="text-fg-muted">/100</span>
                <span
                  className={`tnum flex items-center gap-0.5 px-2 py-0.5 text-sm font-semibold ${
                    delta >= 0
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
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

            <section className="border border-line-strong bg-surface-1 p-6">
              <h2 className="text-sm font-semibold text-fg-muted">Share of voice</h2>
              <div className="mt-2">
                {sov.length > 0 ? (
                  <SovDonut data={sov} />
                ) : (
                  <p className="py-8 text-center text-sm text-fg-muted">
                    No firm mentions in the latest scan.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* ③ Trend chart */}
          <section className="border border-line-strong bg-surface-1 p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-fg-muted">
              <BarChart3 className="h-4 w-4" aria-hidden /> Score by engine
            </h2>
            <div className="mt-4">
              <TrendChart data={trend} />
            </div>
          </section>

          {/* ④ Prompt results table */}
          <section className="border border-line-strong bg-surface-1">
            <h2 className="px-6 pt-6 text-sm font-semibold text-fg-muted">
              Latest scan: prompt results
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-fg-muted">
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
                      <td colSpan={5} className="px-6 py-6 text-center text-fg-muted">
                        No responses recorded in the latest scan.
                      </td>
                    </tr>
                  )}
                  {prompts.map((r, i) => (
                    <tr key={i} className="border-b border-line last:border-0">
                      <td className="max-w-md truncate px-6 py-2 text-fg">{r.prompt}</td>
                      <td className="px-3 py-2 text-fg-muted">{ENGINE_LABELS[r.engine]}</td>
                      <td className="px-3 py-2">
                        {r.recommended ? (
                          <span className="bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                            Recommended
                          </span>
                        ) : r.mentioned ? (
                          <span className="bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                            Mentioned
                          </span>
                        ) : (
                          <span className="bg-surface-2 px-2 py-0.5 text-xs font-semibold text-fg-muted">
                            Absent
                          </span>
                        )}
                      </td>
                      <td className="tnum px-3 py-2 text-fg">{r.position ?? "—"}</td>
                      <td className="px-6 py-2 text-fg-muted">{r.sentiment ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ⑤ Citations + recommendations (F9) */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="border border-line-strong bg-surface-1 p-6">
              <h2 className="text-sm font-semibold text-fg-muted">Top cited sources</h2>
              {citations.length > 0 ? (
                <>
                  <ul className="mt-3 space-y-2 text-sm">
                    {citations.map((c) => (
                      <li key={c.domain} className="flex items-center justify-between">
                        <span className="font-medium text-fg">{c.domain}</span>
                        <span className="tnum text-fg-muted">
                          cited for {c.citedInPrompts}/{c.totalPrompts} prompts ·{" "}
                          {c.brandListed ? (
                            <span className="font-semibold text-success">listed</span>
                          ) : (
                            <span className="font-semibold text-danger">missing</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-warning">
                    You&apos;re missing from {missingCount} of {citations.length} top-cited
                    sources.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-fg-muted">
                  No sources were cited in the latest scan yet.
                </p>
              )}
            </section>

            <section className="border border-line-strong bg-surface-1 p-6">
              <h2 className="text-sm font-semibold text-fg-muted">What to fix first</h2>
              {recommendations.length > 0 ? (
                <ol className="mt-3 space-y-3 text-sm">
                  {recommendations.map((r) => (
                    <li key={r.action}>
                      <p className="font-semibold text-fg">{r.action}</p>
                      <p className="text-fg-muted">{r.evidence}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-fg-muted">
                  No citation gaps found. You&apos;re listed on the sources the engines cite.
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
      <h1 className="font-display text-3xl text-fg">{title}</h1>
      <p className="text-fg-muted">{body}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-2 bg-brand-500 px-5 py-2.5 font-semibold text-on-brand hover:bg-brand-600"
        >
          {cta.label}
        </Link>
      )}
    </main>
  );
}
