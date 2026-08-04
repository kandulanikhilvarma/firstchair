import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Explicit back navigation. Deliberately not history.back(): a browser-history
 * jump lands somewhere different depending on how the visitor arrived, which is
 * exactly the unpredictability that makes people feel lost. Every instance
 * names where it goes.
 */
export default function BackLink({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`notation inline-flex items-center gap-1.5 text-ink-500 transition-colors hover:text-ox-700 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}
