/** The mark: a counsel table with three seats, the first one taken.
 *  Drawn as geometry, not set as type, so it holds at 16px and never
 *  depends on a font having loaded. Seats are sized generously — at small
 *  scale thin strokes silt up and the shape stops reading. */
export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden focusable="false">
      <rect width="32" height="32" fill="currentColor" />
      <rect x="3" y="8" width="26" height="2" fill="var(--color-canary-400)" opacity="0.55" />
      <rect x="3" y="13" width="7" height="10" fill="var(--color-canary-400)" />
      <rect
        x="12.5"
        y="13"
        width="7"
        height="10"
        fill="var(--color-canary-400)"
        opacity="0.28"
      />
      <rect x="22" y="13" width="7" height="10" fill="var(--color-canary-400)" opacity="0.28" />
    </svg>
  );
}

/** Caps Caslon with wide tracking — the lockup reads as a title page, which is
 *  where the rest of this identity comes from. */
export default function Wordmark({
  className = "",
  markClassName = "h-8 w-8 text-ox-900",
  textClassName = "text-xl text-ox-900",
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Mark className={markClassName} />
      <span
        className={`font-display font-normal uppercase leading-none tracking-[0.14em] ${textClassName}`}
      >
        First Chair
      </span>
    </span>
  );
}
