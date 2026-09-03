import Link from "next/link";
import Wordmark from "./wordmark";

/** One header for every standalone page (home, legal, login, onboarding, audit
 *  demo) so the logo is identical and always links home. The dashboard shell
 *  has its own sidebar treatment and does not use this. */
export default function SiteHeader({
  homeHref = "/",
  children,
}: {
  homeHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="border-b-2 border-brand-700 bg-surface-1">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href={homeHref} aria-label="First Chair home">
          <Wordmark />
        </Link>
        {children ? <nav className="flex items-baseline gap-6">{children}</nav> : null}
      </div>
    </header>
  );
}
