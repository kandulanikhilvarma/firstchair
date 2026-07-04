import {
  ArrowUpRight,
  BarChart3,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Users,
} from "lucide-react";
import { recommendFromCitations } from "@/lib/scoring/recommend";
import {
  DEMO_BRAND,
  ENGINE_LABELS,
  seedCitations,
  seedPromptRows,
  seedShareOfVoice,
  seedTrend,
} from "@/lib/seed";
import { SovDonut, Sparkline, TrendChart } from "./charts";
import SignOutButton from "./sign-out-button";

// ponytail: static demo dashboard on seeded data; swaps to daily_scores reads when Supabase lands

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Prompts", icon: MessageSquareText, active: false },
  { label: "Competitors", icon: Users, active: false },
  { label: "Reports", icon: FileText, active: false },
  { label: "Settings", icon: Settings, active: false },
];

function scoreOf(p: { openai: number; gemini: number; perplexity: number }) {
  return Math.round((p.openai + p.gemini + p.perplexity) / 3);
}

export default function Dashboard() {
  const trend = seedTrend();
  const sov = seedShareOfVoice();
  const prompts = seedPromptRows();
  const citations = seedCitations();
  const recommendations = recommendFromCitations(
    citations.map((c) => ({
      domain: c.domain,
      citedInPrompts: c.citedInPrompts,
      totalPrompts: 10,
      brandListed: c.brandListed,
      competitorsListed: c.competitorsListed,
    })),
  );

  const today = scoreOf(trend[trend.length - 1]);
  const weekAgo = scoreOf(trend[trend.length - 8]);
  const delta = today - weekAgo;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar §3.3 */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface-0 px-4 py-6 lg:block">
        <span className="px-2 text-xl font-bold text-primary-900">Rankwell</span>
        <nav className="mt-8 space-y-1">
          {NAV.map(({ label, icon: Icon, active }) => (
            <a
              key={label}
              href="#"
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-primary-700 text-white"
                  : "text-ink-600 hover:bg-surface-50 hover:text-ink-900"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </a>
          ))}
          <SignOutButton />
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Topbar with brand switcher */}
        <header className="flex items-center justify-between border-b border-border bg-surface-0 px-6 py-4">
          <label className="flex items-center gap-2 text-sm font-medium text-ink-600">
            Brand
            <select
              defaultValue={DEMO_BRAND}
              className="cursor-pointer rounded-lg border border-border bg-surface-0 px-3 py-1.5 font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option>{DEMO_BRAND}</option>
            </select>
          </label>
          <span className="rounded-full bg-warn-600/10 px-3 py-1 text-xs font-semibold text-warn-600">
            Demo data
          </span>
        </header>

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
                <SovDonut data={sov} />
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
              <ul className="mt-3 space-y-2 text-sm">
                {citations.map((c) => (
                  <li key={c.domain} className="flex items-center justify-between">
                    <span className="font-medium text-ink-900">{c.domain}</span>
                    <span className="tnum text-ink-600">
                      cited for {c.citedInPrompts}/10 prompts ·{" "}
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
                You&apos;re missing from{" "}
                {citations.filter((c) => !c.brandListed).length} of{" "}
                {citations.length} top-cited sources.
              </p>
            </section>

            <section className="rounded-xl border border-border bg-surface-0 p-6 shadow-card">
              <h2 className="text-sm font-semibold text-ink-600">What to fix first</h2>
              <ol className="mt-3 space-y-3 text-sm">
                {recommendations.map((r) => (
                  <li key={r.action}>
                    <p className="font-semibold text-ink-900">{r.action}</p>
                    <p className="text-ink-600">{r.evidence}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
