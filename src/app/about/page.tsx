import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "../site-header";
import Wordmark, { Mark } from "../wordmark";

export const metadata: Metadata = {
  title: "About — First Chair",
  description:
    "First Chair is built by Nikhilvarma Kandula, a founder and AI engineer in Germany. Eighteen months in US fintech, four products live, one peer-reviewed paper.",
};

const EMAIL = "kandulanikhilvarma@gmail.com";

/* Every figure here is a claim someone can check: the paper is in IRJMETS,
   the Lead Developer title is on somebody else's team page, the products are
   URLs that load. Nothing is rounded up. */
const RECORD = [
  { term: "Role", detail: "Founder and AI engineer" },
  {
    term: "Focus",
    detail: "AI and LLM products, full-stack engineering, data engineering, event-driven architecture",
  },
  { term: "Based", detail: "Germany and India" },
  {
    term: "Study",
    detail: "M.Sc. Big Data & Business Analytics, FOM Hochschule, through August 2027",
  },
  {
    term: "Research",
    detail: "Rainfall estimation via data fusion, IRJMETS Vol 7 Issue 3, March 2025",
  },
  { term: "Before", detail: "B.Tech Computer Science, Malla Reddy College, first class with distinction" },
];

const FIGURES = [
  { value: "18", label: "Months in US fintech" },
  { value: "13", label: "Projects written up" },
  { value: "4", label: "Products live in production" },
  { value: "1", label: "Peer-reviewed paper" },
];

const POSITIONS = [
  {
    n: "01",
    title: "Define the metric before you improve it",
    body: "A percentage quoted afterwards is unfalsifiable. So the visibility score prints its own arithmetic next to the number: recommended 1.0, first-mentioned 0.6, mentioned 0.4. A partner can check it.",
  },
  {
    n: "02",
    title: "Know when not to trust the model",
    body: "In a financial audit a confidently wrong answer is worse than no answer. The same holds here: the engines are non-deterministic, so First Chair stores every response verbatim and never summarizes away the text a score came from.",
  },
  {
    n: "03",
    title: "Publish the null result",
    body: "A portfolio of only confirmed hypotheses is a portfolio that has quietly deleted its failures. If a scan finds nothing moved, the report says nothing moved.",
  },
  {
    n: "04",
    title: "Plain language is a test, not a courtesy",
    body: "If the product cannot be explained in a paragraph a non-technical reader follows start to finish, the problem is not yet understood. That paragraph is the first thing on the home page.",
  },
];

const LIVE = [
  {
    name: "Bud",
    body: "A habit tracker built on game mechanics, local-first so it works with no account and no network.",
  },
  {
    name: "Cartwise",
    body: "Turns a photographed receipt into a nutrition summary using OCR and product matching.",
  },
  {
    name: "Knock",
    body: "A local services booking platform, built to handle concurrent users competing for the same slot without double-booking it.",
  },
  {
    name: "Ganymede",
    body: "A credit risk lens with fourteen invariants in the codebase that break the build when a known defect returns.",
  },
];

const ELSEWHERE = [
  { label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
  {
    label: "LinkedIn",
    value: "in/nikhilvarmakandula",
    href: "https://www.linkedin.com/in/nikhilvarmakandula",
  },
  {
    label: "GitHub",
    value: "@kandulanikhilvarma",
    href: "https://github.com/kandulanikhilvarma",
  },
  { label: "Portfolio", value: "kandula.studio", href: "https://kandula.studio" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader>
        <Link href="/" className="notation text-fg hover:text-brand-700">
          Back to site
        </Link>
        <Link
          href="/login"
          className="notation border-b-2 border-brand-500 pb-0.5 text-fg hover:border-brand-700"
        >
          Start free trial
        </Link>
      </SiteHeader>

      {/* Hero — the committed field, same as the home page opens on */}
      <section className="bg-brand-700 text-on-brand">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <h1 className="max-w-[16ch] font-display text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.03] text-on-brand">
            Built by someone who ships.
          </h1>
          <p className="mt-7 max-w-[62ch] text-lg leading-relaxed text-on-brand">
            First Chair is built and run by Nikhilvarma Kandula, a founder and AI engineer
            in Germany. He spent eighteen months in US fintech before this. One person writes
            the scan engine, reads the answers, and answers the support email.
          </p>
          <blockquote className="ink-in mt-10 max-w-[54ch] border-l-2 border-on-brand/40 pl-6 font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.2] italic text-on-brand">
            The best data work is invisible. The pipeline nobody notices because it never
            breaks.
          </blockquote>
        </div>
      </section>

      {/* 01 — background, with the checkable record filed beside it */}
      <Section n="01" title="Background">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
          <div className="space-y-5 text-fg">
            <p className="text-lg">
              Eighteen months at MicroIntech, a US fintech, went from data engineer to lead
              developer. The work was rebuilding a monolithic financial platform into
              event-driven microservices carrying 500+ concurrent users at full transaction
              integrity, and wiring an LLM audit pipeline that cut fifteen hours of weekly
              manual review down to about three.
            </p>
            <p>
              The habits behind this product come from there: idempotent decisions, logged
              propensities, and the assumption that anything unlogged did not happen. It is
              also where the confidence routing came from: the engineering that sends a
              doubtful case to a human instead of letting a model guess.
            </p>
            <p>
              Alongside it, Lead Developer at EngineeredPrompts, a premium AI-prompt
              platform. He built the prompt library and model orchestration behind it, the
              paid tier end to end, and led the two developers on it. That title is
              published on their own team page, which is the only version of the claim
              worth anything.
            </p>
            <p>
              Now in Germany reading for an M.Sc. in Big Data & Business Analytics at FOM
              Hochschule through August 2027, alongside peer-reviewed research on rainfall
              estimation by data fusion. It reached a probability of detection of 0.58,
              beating Kriging with External Drift on the same dataset.
            </p>
          </div>

          <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-1">
            {RECORD.map((item) => (
              <div key={item.term} className="border-t border-line-strong pt-3">
                <dt className="notation text-fg-muted">{item.term}</dt>
                <dd className="mt-1 text-fg">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-14 grid gap-px border border-line-strong bg-line-strong sm:grid-cols-2 lg:grid-cols-4">
          {FIGURES.map((f) => (
            <div key={f.label} className="bg-surface-1 px-6 py-7">
              <p className="tnum font-display text-5xl leading-none text-brand-700">{f.value}</p>
              <p className="notation mt-3 text-fg-muted">{f.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 02 — the positions that decide how the product is built */}
      <Section n="02" title="How this one is built" tone="ruled">
        <p className="max-w-[62ch] text-lg text-fg">
          Not values. Four positions paid for at least once, each one visible in a decision
          this product actually made.
        </p>
        <ol className="mt-10 space-y-px">
          {POSITIONS.map((p) => (
            <li
              key={p.n}
              className="grid gap-x-8 gap-y-2 border-t border-line-strong bg-surface-1/70 px-6 py-7 md:grid-cols-[5rem_1fr]"
            >
              <span className="notation tnum pt-1 text-accent">{p.n}</span>
              <div>
                <h3 className="font-display text-2xl text-fg">{p.title}</h3>
                <p className="mt-2 max-w-[66ch] text-fg">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* 03 — the other live products, so "ships" is checkable */}
      <Section n="03" title="Other things that are live">
        <p className="max-w-[62ch] text-lg text-fg">
          Each of these is running, not a screenshot in a deck. First Chair is the one you
          are reading.
        </p>
        <dl className="mt-12 grid gap-x-16 gap-y-10 md:grid-cols-2">
          {LIVE.map((item) => (
            <div key={item.name} className="border-t border-line-strong pt-5">
              <dt className="font-display text-2xl text-brand-700">{item.name}</dt>
              <dd className="mt-2 max-w-[58ch] text-fg">{item.body}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10">
          <a
            href="https://kandula.studio"
            className="notation border-b border-brand-500/50 pb-0.5 text-brand-700 hover:border-brand-500"
          >
            See all of it at kandula.studio
          </a>
        </p>
      </Section>

      {/* 04 — the name, and the mark that carries it */}
      <Section n="04" title="Why it is called First Chair">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_minmax(0,20rem)] lg:gap-16">
          <div className="space-y-5 text-fg">
            <p className="text-lg">
              At counsel table, first chair is the lawyer who runs the case. That lawyer
              stands up, examines the witness, and answers for what ends up in the
              record. Second chair does real work and is not the name anyone repeats
              afterwards.
            </p>
            <p>
              An AI answer is a record too. Asked for the best firm in a city, an engine
              names two or three, and the rest of the market is not in the transcript at
              all. This product exists to tell you which chair you are sitting in today,
              and to keep the receipt.
            </p>
            <p>
              The mark is the same idea reduced: a counsel table with three seats, the
              first one taken.
            </p>
          </div>

          <div
            className="flex items-center justify-center border border-line-strong bg-surface-2 p-10"
            aria-hidden
          >
            <Mark className="h-32 w-32 text-fg" />
          </div>
        </div>
      </Section>

      {/* 05 — contact */}
      <Section n="05" title="Get in touch">
        <p className="max-w-[62ch] text-lg text-fg">
          Questions about the scan engine, the evidence behind a number, or working
          together. Email reaches a person, usually the same day.
        </p>
        <dl className="mt-10 grid gap-px border border-line-strong bg-line-strong sm:grid-cols-2 lg:grid-cols-4">
          {ELSEWHERE.map((item) => (
            <div key={item.label} className="bg-surface-1 px-6 py-6">
              <dt className="notation text-fg-muted">{item.label}</dt>
              <dd className="mt-2">
                <a
                  href={item.href}
                  className="border-b border-brand-500/40 pb-0.5 text-brand-700 hover:border-brand-500"
                >
                  {item.value}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* The ask */}
      <section className="bg-brand-700 text-on-brand">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-8 px-6 py-16">
          <div>
            <h2 className="max-w-[20ch] font-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.08] text-on-brand">
              Find out what the engines say about your firm.
            </h2>
            <p className="mt-3 max-w-[52ch] text-on-brand">
              A free audit runs twenty questions against ChatGPT, Gemini and Perplexity and
              returns the answers verbatim.
            </p>
          </div>
          <Link
            href="/"
            className="bg-on-brand px-5 py-3 font-semibold text-brand-700 transition-colors hover:bg-brand-100"
          >
            Run a free audit
          </Link>
        </div>
      </section>

      <footer className="border-t-2 border-brand-700 bg-surface-1">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-4 px-6 py-10">
          <Wordmark markClassName="h-6 w-6 text-fg" textClassName="text-xl text-fg" />
          <p className="notation text-fg-muted">
            AI visibility for law firms. ChatGPT, Gemini, Perplexity.
          </p>
          <nav className="flex gap-6">
            <Link href="/about" className="notation text-fg-muted hover:text-brand-700">
              About
            </Link>
            <Link href="/privacy" className="notation text-fg-muted hover:text-brand-700">
              Privacy
            </Link>
            <Link href="/terms" className="notation text-fg-muted hover:text-brand-700">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/** Numbered section. The number runs inline in a left column with the heading,
 *  never stacked above it as an eyebrow — that pattern is banned in this world. */
function Section({
  n,
  title,
  tone = "plain",
  children,
}: {
  n: string;
  title: string;
  tone?: "plain" | "ruled";
  children: React.ReactNode;
}) {
  const field =
    tone === "ruled" ? "border-b border-line bg-brand-50" : "border-b border-line bg-surface-1";
  return (
    <section className={field}>
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2 className="flex items-baseline gap-5 text-[clamp(2rem,3.6vw,3rem)] text-fg">
          <span className="notation tnum text-accent">{n}</span>
          <span>{title}</span>
        </h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
