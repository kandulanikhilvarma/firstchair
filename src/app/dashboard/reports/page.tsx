import { ArrowUpRight } from "lucide-react";
import { getReportsView, getShellContext } from "../data";
import Shell from "../shell";
import { EmptyPanel, NoBrandState } from "../states";

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand: requested } = await searchParams;
  const ctx = await getShellContext(requested);
  const shellProps = {
    brands: ctx.brands,
    currentBrandId: ctx.currentBrandId,
    plan: ctx.plan,
    trialDaysLeft: ctx.trialDaysLeft,
  };

  if (!ctx.brand) {
    return (
      <Shell brandName={null} {...shellProps}>
        <NoBrandState />
      </Shell>
    );
  }

  const rows = await getReportsView(ctx.brand.id);

  return (
    <Shell brandName={ctx.brand.name} {...shellProps}>
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <header>
          <h1 className="font-display text-2xl text-fg">Reports</h1>
          <p className="mt-1 text-sm text-fg-muted">
            One row per daily scan for {ctx.brand.name}. A weekly summary of these lands in your
            inbox every Monday.
          </p>
        </header>

        <section className="border border-line-strong bg-surface-1">
          {rows.length === 0 ? (
            <EmptyPanel>
              No scans recorded yet. Your first daily report appears here once the first scan
              completes.
            </EmptyPanel>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-fg-muted">
                    <th className="px-6 py-2 font-medium">Date</th>
                    <th className="tnum px-3 py-2 font-medium">Score</th>
                    <th className="px-3 py-2 font-medium">Change</th>
                    <th className="tnum px-3 py-2 font-medium">Mentions</th>
                    <th className="tnum px-6 py-2 font-medium">Recommended</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.date} className="border-b border-line last:border-0">
                      <td className="px-6 py-2 text-fg">
                        {DATE_FMT.format(new Date(`${r.date}T00:00:00`))}
                      </td>
                      <td className="tnum px-3 py-2 font-semibold text-fg">{r.score}</td>
                      <td className="px-3 py-2">
                        {r.delta === null ? (
                          <span className="text-fg-muted">—</span>
                        ) : (
                          <span
                            className={`tnum inline-flex items-center gap-0.5 font-semibold ${
                              r.delta >= 0 ? "text-success" : "text-danger"
                            }`}
                          >
                            <ArrowUpRight
                              className={`h-3.5 w-3.5 ${r.delta < 0 ? "rotate-90" : ""}`}
                              aria-hidden
                            />
                            {r.delta >= 0 ? "+" : ""}
                            {r.delta}
                          </span>
                        )}
                      </td>
                      <td className="tnum px-3 py-2 text-fg">{r.mentions}</td>
                      <td className="tnum px-6 py-2 text-fg">{r.recommendations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </Shell>
  );
}
