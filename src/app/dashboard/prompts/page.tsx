import type { Outcome } from "@/lib/dashboard";
import { ENGINES, ENGINE_LABELS } from "@/lib/seed";
import { getPromptsView, getShellContext } from "../data";
import Shell from "../shell";
import { EmptyPanel, NoBrandState } from "../states";

const OUTCOME: Record<Outcome, { cls: string; label: string }> = {
  recommended: { cls: "bg-success/10 text-success", label: "Recommended" },
  mentioned: { cls: "bg-brand-50 text-brand-700", label: "Named" },
  absent: { cls: "bg-surface-2 text-fg-muted", label: "Absent" },
};

function OutcomeCell({ o }: { o: Outcome | null }) {
  if (o === null) return <span className="text-fg-muted">—</span>;
  const { cls, label } = OUTCOME[o];
  return <span className={`inline-block px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

export default async function PromptsPage({
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

  const rows = await getPromptsView(ctx.brand.id);
  const active = rows.filter((r) => r.isActive).length;

  return (
    <Shell brandName={ctx.brand.name} {...shellProps}>
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <header>
          <h1 className="font-display text-2xl text-fg">Prompts</h1>
          <p className="mt-1 text-sm text-fg-muted">
            The <span className="tnum font-semibold text-fg">{active}</span> active question
            {active === 1 ? "" : "s"} we ask ChatGPT, Gemini and Perplexity for {ctx.brand.name}, and
            how each engine answered in the latest scan.
          </p>
        </header>

        <section className="border border-line-strong bg-surface-1">
          {rows.length === 0 ? (
            <EmptyPanel>
              No prompts yet. Add your firm and the questions to track in onboarding.
            </EmptyPanel>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-fg-muted">
                    <th className="px-6 py-2 font-medium">Prompt</th>
                    <th className="px-3 py-2 font-medium">Source</th>
                    {ENGINES.map((e) => (
                      <th key={e} className="px-3 py-2 font-medium">
                        {ENGINE_LABELS[e]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className={`border-b border-line last:border-0 ${r.isActive ? "" : "opacity-55"}`}
                    >
                      <td className="max-w-md px-6 py-2 text-fg">
                        {r.text}
                        {!r.isActive && (
                          <span className="ml-2 text-xs text-fg-muted">(paused)</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-fg-muted capitalize">{r.source}</td>
                      {ENGINES.map((e) => (
                        <td key={e} className="px-3 py-2">
                          <OutcomeCell o={r.byEngine[e]} />
                        </td>
                      ))}
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
