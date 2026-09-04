import Link from "next/link";

/** Shown on every dashboard route when the workspace has no brand yet. */
export function NoBrandState() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-3 px-6 py-24 text-center">
      <h1 className="font-display text-3xl text-fg">Set up your first brand</h1>
      <p className="text-fg-muted">
        Add your firm, competitors and the questions you want tracked. Your first scan runs right
        after.
      </p>
      <Link
        href="/onboarding"
        className="mt-2 bg-brand-500 px-5 py-2.5 font-semibold text-on-brand hover:bg-brand-600"
      >
        Start onboarding
      </Link>
    </main>
  );
}

/** In-panel empty message for a data view that has a brand but no rows yet. */
export function EmptyPanel({ children }: { children: React.ReactNode }) {
  return <p className="px-6 py-10 text-center text-sm text-fg-muted">{children}</p>;
}
