import Link from "next/link";

/** Read mode: comprehension and wayfinding first, in the same world. */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b-2 border-ox-900 bg-surface-0">
        <div className="mx-auto flex w-full max-w-6xl items-baseline justify-between px-6 py-4">
          <Link href="/" className="font-display text-2xl tracking-tight text-ox-900">
            First Chair
          </Link>
          <Link href="/" className="notation text-ink-700 hover:text-ox-700">
            Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[74ch] flex-1 px-6 py-16">{children}</main>

      <footer className="border-t-2 border-ox-900 bg-surface-0">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-4 px-6 py-8">
          <span className="font-display text-xl text-ox-900">First Chair</span>
          <nav className="flex gap-6">
            <Link href="/privacy" className="notation text-ink-500 hover:text-ox-700">
              Privacy
            </Link>
            <Link href="/terms" className="notation text-ink-500 hover:text-ox-700">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
