"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <h1 className="font-display text-3xl text-fg">Something went wrong</h1>
      <p className="text-fg-muted">
        We hit an unexpected error. Try again — if it keeps happening, contact support.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 cursor-pointer bg-brand-500 px-5 py-2.5 font-semibold text-on-brand hover:bg-brand-600"
      >
        Try again
      </button>
    </main>
  );
}
