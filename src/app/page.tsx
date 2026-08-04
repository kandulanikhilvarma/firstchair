import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuditForm from "./audit-form";
import Wordmark from "./wordmark";

/* Illustrative record — synthetic. No real firm, no live engine answer.
   Replace with a captured probe response before launch. */
const TRANSCRIPT = {
  question: "best personal injury lawyer in Austin",
  engine: "ChatGPT",
  answer: [
    { text: "Based on client reviews and case results, a few well-regarded options are " },
    { text: "Barnes Whitfield", firm: true },
    { text: ", " },
    { text: "Ruiz & Associates", firm: true },
    { text: ", and " },
    { text: "Kessler Injury Law", firm: true },
    { text: ". Each handles serious-injury claims and offers free consultations." },
  ],
};

const RECORD = [
  {
    term: "Visibility score",
    detail:
      "One number, 0–100, built from every prompt: recommended counts 1.0, first-mentioned 0.6, mentioned 0.4. The arithmetic is printed next to the score, so a partner can check it.",
  },
  {
    term: "Share of voice",
    detail:
      "How often the engines name you against every competitor you track — question by question, not in aggregate hand-waving.",
  },
  {
    term: "Cited sources",
    detail:
      "The pages the engines actually quote when they answer. Where you are missing from a source they trust, that is the work order.",
  },
  {
    term: "The raw answer",
    detail:
      "Every response is stored verbatim. Any number here opens to the text it came from. Nothing is summarized away.",
  },
];

const PROCEEDINGS = [
  {
    step: "First",
    title: "You enter the firm",
    body: "Name, city, practice area, and up to five competitors. We generate the twenty questions prospective clients ask about that practice in that city.",
  },
  {
    step: "Then",
    title: "The engines are put to the question",
    body: "Every day, all twenty questions go to ChatGPT, Gemini and Perplexity through their official APIs. Answers are recorded exactly as returned.",
  },
  {
    step: "Finally",
    title: "The record is entered",
    body: "Mentions, recommendations, position, and citations are extracted and scored. Movement — yours or a competitor's — reaches you by email each week.",
  },
];

const FAQS = [
  {
    q: "Is this really what ChatGPT tells my clients?",
    a: "We query the same models through their official APIs with neutral prompts. API answers track the consumer apps closely but are not guaranteed identical, and no tool can honestly promise otherwise. Gemini and Perplexity return their live citations, which is the part you can actually act on.",
  },
  {
    q: "How current is it?",
    a: "Paid plans scan every day. The dashboard holds a 30-day trend and the weekly email flags what moved.",
  },
  {
    q: "Can I track the firms I compete with?",
    a: "Up to five per brand. Share of voice shows how often an engine picks them over you, question by question.",
  },
  {
    q: "Can I cancel?",
    a: "In one click from the billing portal. The 7-day trial takes a card and charges nothing until it ends.",
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; token_hash?: string; type?: string }>;
}) {
  // Supabase falls back to the Site URL (this root) when emailRedirectTo isn't
  // in the Redirect URLs allowlist, dropping the auth code here instead of at
  // /auth/callback. Forward it so login still completes.
  const params = await searchParams;
  if (params.code || params.token_hash) {
    const forward = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) forward.set(k, v);
    redirect(`/auth/callback?${forward.toString()}`);
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Masthead — a title page, not a nav bar */}
      <header className="border-b-2 border-ox-900 bg-surface-0">
        <div className="mx-auto flex w-full max-w-6xl items-baseline justify-between px-6 py-4">
          <Link href="/" aria-label="First Chair home">
            <Wordmark />
          </Link>
          <nav className="flex items-baseline gap-6">
            <Link href="/login" className="notation text-ink-700 hover:text-ox-700">
              Log in
            </Link>
            <Link
              href="/login"
              className="notation border-b-2 border-canary-400 pb-0.5 text-ox-900 hover:border-ox-700"
            >
              Start free trial
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — full oxblood field, headline against a filed form */}
      <section className="bg-ox-900 text-canary-100">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_27rem] lg:items-start lg:gap-16">
          <div className="min-w-0">
            {/* Measure lives on the heading, where `ch` resolves against the
                display face — on the wrapper it resolves against 16px body
                text and crushes the column to ~150px. */}
            <h1 className="max-w-[15ch] font-display text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.03] text-canary-100">
              Your next client asked an AI. It named three firms.
            </h1>
            <p className="mt-7 max-w-[54ch] text-lg leading-relaxed text-canary-200">
              People now ask ChatGPT, Gemini and Perplexity which lawyer to call. Those
              answers are being given today, about your practice, whether or not anyone at
              your firm has read one. First Chair reads them every day and keeps the receipt.
            </p>
            <p className="mt-6">
              <Link
                href="/audit/demo"
                className="notation border-b border-canary-400/60 pb-0.5 text-canary-400 hover:border-canary-400"
              >
                See a finished report first
              </Link>
            </p>
          </div>

          <div className="lg:justify-self-end">
            <AuditForm />
          </div>
        </div>

        {/* The proof: a verbatim answer, inking in as a stamp presses */}
        <div className="border-t border-ox-700">
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <p className="notation text-canary-400">
              Asked of {TRANSCRIPT.engine} — “{TRANSCRIPT.question}”
            </p>
            <blockquote className="ink-in transcript mt-5 max-w-[74ch] border-l-2 border-canary-400 pl-6 text-lg text-canary-100">
              {TRANSCRIPT.answer.map((part, i) =>
                part.firm ? (
                  <mark key={i} className="bg-canary-400 px-1 font-bold text-ox-900">
                    {part.text}
                  </mark>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </blockquote>
            <p className="ink-in ink-in-2 mt-6 flex flex-wrap items-baseline gap-x-3 text-canary-200">
              <span className="notation text-canary-400">Your firm</span>
              <span className="transcript text-lg">not mentioned</span>
            </p>
            <p className="mt-8 text-xs text-canary-200/70">
              Illustrative example. Not a real firm and not a live answer — your audit
              returns your own.
            </p>
          </div>
        </div>
      </section>

      {/* What the record contains — a definition list, not a card grid */}
      <section className="border-b border-border bg-surface-0">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
            <div>
              <h2 className="max-w-[16ch] text-[clamp(2rem,3.6vw,3rem)] text-ink-900">
                Every number opens to the sentence it came from.
              </h2>
              <p className="mt-5 max-w-[62ch] text-lg text-ink-700">
                Most visibility tools hand you a score and ask for trust. A partner will ask
                where the number came from, and you should be able to answer in one click.
              </p>
            </div>
            <Image
              src="/img/record.jpg"
              alt="A report bound in oxblood cloth on a walnut desk beside a canary legal pad, fountain pen and reading glasses."
              width={1536}
              height={1024}
              sizes="(max-width: 1024px) 100vw, 26rem"
              className="w-full"
            />
          </div>

          <dl className="mt-14 grid gap-x-16 gap-y-10 md:grid-cols-2">
            {RECORD.map((item) => (
              <div key={item.term} className="border-t border-border-strong pt-5">
                <dt className="font-display text-2xl text-ox-700">{item.term}</dt>
                <dd className="mt-2 max-w-[58ch] text-ink-700">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Proceedings — ruled legal-pad stock; the sequence carries real information */}
      <section className="ruled border-b border-border bg-canary-100">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="text-[clamp(2rem,3.6vw,3rem)] text-ink-900">How it proceeds</h2>
          <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1fr_minmax(0,20rem)] lg:gap-14">
          <ol className="space-y-px">
            {PROCEEDINGS.map((p) => (
              <li
                key={p.step}
                className="grid gap-x-8 gap-y-2 border-t border-border-strong bg-surface-0/70 px-6 py-7 md:grid-cols-[7rem_1fr]"
              >
                <span className="notation pt-1 text-rule">{p.step}</span>
                <div>
                  <h3 className="font-display text-2xl text-ink-900">{p.title}</h3>
                  <p className="mt-2 max-w-[66ch] text-ink-700">{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
            <Image
              src="/img/detail.jpg"
              alt="A hand drawing a canary highlighter line across a page in a cloth-bound volume."
              width={1000}
              height={1250}
              sizes="(max-width: 1024px) 100vw, 20rem"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* A quiet band — the page has been dense; let it breathe before the ask */}
      <section aria-hidden className="border-b border-border">
        <Image
          src="/img/library.jpg"
          alt=""
          width={1205}
          height={742}
          sizes="100vw"
          className="h-[40vh] min-h-64 w-full object-cover"
        />
      </section>

      {/* Fee schedule */}
      <section className="border-b border-border bg-surface-0">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="text-[clamp(2rem,3.6vw,3rem)] text-ink-900">Schedule of fees</h2>
          <p className="mt-4 text-ink-700">
            Seven-day trial on both. Annual billing is two months free.
          </p>

          <div className="mt-12 grid gap-px border border-border-strong bg-border-strong md:grid-cols-2">
            <div className="bg-surface-0 p-8">
              <h3 className="font-display text-3xl text-ink-900">Solo</h3>
              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="tnum font-display text-5xl text-ink-900">$49</span>
                <span className="notation text-ink-500">per month</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-ink-700">
                <li className="border-b border-border pb-2.5">One firm</li>
                <li className="border-b border-border pb-2.5">20 questions, scanned daily</li>
                <li className="border-b border-border pb-2.5">Five competitors tracked</li>
                <li>Weekly email report</li>
              </ul>
              <Link
                href="/login"
                className="mt-8 block border border-ox-700 px-4 py-3 text-center font-semibold text-ox-700 transition-colors hover:bg-ox-700 hover:text-canary-100"
              >
                Start trial
              </Link>
            </div>

            <div className="bg-ox-900 p-8 text-canary-100">
              <h3 className="font-display text-3xl text-canary-100">Agency</h3>
              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="tnum font-display text-5xl">$149</span>
                <span className="notation text-canary-200">per month</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-canary-200">
                <li className="border-b border-ox-700 pb-2.5">Ten client firms</li>
                <li className="border-b border-ox-700 pb-2.5">
                  Daily on three priority firms, weekly on the rest
                </li>
                <li className="border-b border-ox-700 pb-2.5">Competitors tracked per firm</li>
                <li>Client-ready weekly emails</li>
              </ul>
              <Link
                href="/login"
                className="mt-8 block bg-canary-400 px-4 py-3 text-center font-semibold text-ox-900 transition-colors hover:bg-canary-200"
              >
                Start trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Questions, set as a transcript */}
      <section className="bg-surface-50">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="text-[clamp(2rem,3.6vw,3rem)] text-ink-900">Questions lawyers ask</h2>
          <dl className="mt-12 max-w-[76ch] space-y-8">
            {FAQS.map((f) => (
              <div key={f.q} className="border-t border-border-strong pt-6">
                <dt className="transcript flex gap-3 text-lg text-ink-900">
                  <span className="text-rule">Q.</span>
                  <span>{f.q}</span>
                </dt>
                <dd className="transcript mt-3 flex gap-3 text-ink-700">
                  <span className="text-ink-500">A.</span>
                  <span className="max-w-[68ch]">{f.a}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Colophon */}
      <footer className="border-t-2 border-ox-900 bg-surface-0">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-4 px-6 py-10">
          <Wordmark markClassName="h-6 w-6 text-ox-900" textClassName="text-xl text-ox-900" />
          <p className="notation text-ink-500">
            AI visibility for law firms — ChatGPT, Gemini, Perplexity
          </p>
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
