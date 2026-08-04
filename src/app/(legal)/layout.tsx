import Link from "next/link";
import SiteHeader from "../site-header";
import Wordmark from "../wordmark";

/** Read mode: comprehension and wayfinding first, in the same world. */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader>
        <Link href="/" className="notation text-ink-700 hover:text-ox-700">
          Back to site
        </Link>
      </SiteHeader>

      <main className="mx-auto w-full max-w-[74ch] flex-1 px-6 py-16">{children}</main>

      <footer className="border-t-2 border-ox-900 bg-surface-0">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-4 px-6 py-8">
          <Wordmark markClassName="h-6 w-6 text-ox-900" textClassName="text-xl text-ox-900" />
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
