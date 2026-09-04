/** The mark: a chevron splits into three rays, one per engine — the product's
 *  whole thesis in four strokes. Drawn as geometry, not set as type, so it holds
 *  at 16px and never waits on a font. Indigo is the chevron ("you"); the rays are
 *  ChatGPT emerald, Gemini azure, Perplexity rose. Tokens, so dark mode adapts. */
export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={`transition-transform duration-300 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${className}`}
      aria-hidden
      focusable="false"
    >
      <g fill="none" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6 L19 16 L8 26" stroke="var(--color-brand-500)" />
        <path d="M21 15 L29 9" stroke="var(--color-openai)" />
        <path d="M22 16 L30 16" stroke="var(--color-gemini)" />
        <path d="M21 17 L29 23" stroke="var(--color-perplexity)" />
      </g>
    </svg>
  );
}

/** Fraunces set tight — the serif gives the lockup a voice the quiet sans UI
 *  deliberately withholds. The mark answers on hover (see Mark). */
export default function Wordmark({
  className = "",
  markClassName = "h-8 w-8",
  textClassName = "text-xl text-fg",
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <Mark className={markClassName} />
      <span className={`font-serif font-medium leading-none tracking-tight ${textClassName}`}>
        First Chair
      </span>
    </span>
  );
}
