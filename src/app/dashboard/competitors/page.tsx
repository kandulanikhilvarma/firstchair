import { getCompetitorsView, getShellContext } from "../data";
import Shell from "../shell";
import { EmptyPanel, NoBrandState } from "../states";

export default async function CompetitorsPage({
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

  const rows = await getCompetitorsView(ctx.brand.id);
  const yourRank = rows.findIndex((r) => r.isYou) + 1;
  const ahead = rows.filter((r) => !r.isYou && r.mentions > (rows.find((y) => y.isYou)?.mentions ?? 0));

  return (
    <Shell brandName={ctx.brand.name} {...shellProps}>
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <header>
          <h1 className="font-display text-2xl text-fg">Competitors</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {rows.length > 1 ? (
              <>
                {ctx.brand.name} ranks{" "}
                <span className="tnum font-semibold text-fg">
                  #{yourRank} of {rows.length}
                </span>{" "}
                by mentions in the latest scan
                {ahead.length > 0 ? (
                  <>
                    {" "}
                    — <span className="font-semibold text-danger">{ahead.length}</span> competitor
                    {ahead.length === 1 ? " is" : "s are"} named more often than you.
                  </>
                ) : (
                  <> — no tracked competitor is named more often than you.</>
                )}
              </>
            ) : (
              <>Share of voice against the competitors you track, from the latest scan.</>
            )}
          </p>
        </header>

        <section className="border border-line-strong bg-surface-1">
          {rows.length === 0 ? (
            <EmptyPanel>No mentions recorded in the latest scan yet.</EmptyPanel>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-fg-muted">
                    <th className="px-6 py-2 font-medium">Firm</th>
                    <th className="tnum px-3 py-2 font-medium">Mentions</th>
                    <th className="tnum px-3 py-2 font-medium">Recommended</th>
                    <th className="px-6 py-2 font-medium">Share of voice</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-line last:border-0">
                      <td className="px-6 py-2">
                        <span className={r.isYou ? "font-semibold text-brand-700" : "text-fg"}>
                          {r.name}
                        </span>
                        {r.isYou && (
                          <span className="ml-2 rounded-sm bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-700">
                            You
                          </span>
                        )}
                      </td>
                      <td className="tnum px-3 py-2 text-fg">{r.mentions}</td>
                      <td className="tnum px-3 py-2 text-fg">{r.recommended}</td>
                      <td className="px-6 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-surface-2">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${r.sovPct}%`,
                                backgroundColor: r.isYou
                                  ? "var(--color-brand-500)"
                                  : "var(--color-fg-subtle)",
                              }}
                            />
                          </div>
                          <span className="tnum text-fg-muted">{r.sovPct}%</span>
                        </div>
                      </td>
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
