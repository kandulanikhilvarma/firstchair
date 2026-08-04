/** The mark: a counsel table with three seats, the first one taken.
 *  Drawn as geometry, not set as type, so it holds at 16px and never
 *  depends on a font having loaded. */
export function Mark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden focusable="false">
      <rect width="32" height="32" fill="currentColor" />
      <rect x="4" y="9" width="24" height="1.5" fill="var(--color-canary-400)" opacity="0.5" />
      <rect x="4" y="14" width="7" height="9" fill="var(--color-canary-400)" />
      <rect
        x="13.75"
        y="14.75"
        width="5.5"
        height="7.5"
        stroke="var(--color-canary-400)"
        strokeWidth="1.5"
        opacity="0.42"
      />
      <rect
        x="22.25"
        y="14.75"
        width="5.5"
        height="7.5"
        stroke="var(--color-canary-400)"
        strokeWidth="1.5"
        opacity="0.42"
      />
    </svg>
  );
}

/** Caps Caslon with wide tracking — the lockup reads as a title page, which is
 *  where the rest of this identity comes from. */
export default function Wordmark({
  className = "",
  markClassName = "h-7 w-7 text-ox-900",
  textClassName = "text-lg text-ox-900",
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark className={markClassName} />
      <span
        className={`font-display font-normal uppercase leading-none tracking-[0.12em] ${textClassName}`}
      >
        First Chair
      </span>
    </span>
  );
}
