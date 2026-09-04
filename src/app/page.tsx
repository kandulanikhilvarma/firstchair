import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuditForm from "./audit-form";
import SiteHeader from "./site-header";
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
      "How often the engines name you against each competitor you track. We count it question by question, not as one blended average.",
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
    body: "We extract and score every mention, recommendation, position, and citation. Each week you get an email when your standing or a competitor's changes.",
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

  // Auth-aware nav: a logged-in visitor arriving from "View site" was still
  // shown "Log in / Start free trial", which reads as being signed out.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader>
        {user ? (
          <Link
            href="/dashboard"
            className="notation border-b-2 border-brand-500 pb-0.5 text-fg hover:border-brand-700"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" className="notation text-fg hover:text-brand-700">
              Log in
            </Link>
            <Link
              href="/login"
              className="notation border-b-2 border-brand-500 pb-0.5 text-fg hover:border-brand-700"
            >
              Start free trial
            </Link>
          </>
        )}
      </SiteHeader>

      {/* Hero — full oxblood field, headline against a filed form */}
      <section className="bg-brand-700 text-on-brand">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_27rem] lg:items-start lg:gap-16">
          <div className="min-w-0">
            {/* Measure lives on the heading, where `ch` resolves against the
                display face — on the wrapper it resolves against 16px body
                text and crushes the column to ~150px. */}
            <h1 className="max-w-[15ch] font-display text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.03] text-on-brand">
              Your next client asked an AI. It named three firms.
            </h1>
            <p className="mt-7 max-w-[54ch] text-lg leading-relaxed text-on-brand">
              People now ask ChatGPT, Gemini and Perplexity which lawyer to call. Those
              answers are being given today, about your practice, whether or not anyone at
              your firm has read one. First Chair reads them every day and keeps the receipt.
            </p>
            <p className="mt-6">
              <Link
                href="/audit/demo"
                className="notation border-b border-on-brand/50 pb-0.5 text-on-brand hover:border-on-brand"
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
        <div className="border-t border-brand-500">
          <div className="mx-auto w-full max-w-6xl px-6 py-14">
            <p className="notation text-on-brand/80">
              Asked of {TRANSCRIPT.engine}: “{TRANSCRIPT.question}”
            </p>
            <blockquote className="ink-in transcript mt-5 max-w-[74ch] border-l-2 border-on-brand/40 pl-6 text-lg text-on-brand">
              {TRANSCRIPT.answer.map((part, i) =>
                part.firm ? (
                  <mark key={i} className="bg-accent-2 px-1 font-bold text-on-brand">
                    {part.text}
                  </mark>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </blockquote>
            <p className="ink-in ink-in-2 mt-6 flex flex-wrap items-baseline gap-x-3 text-on-brand">
              <span className="notation text-on-brand/80">Your firm</span>
              <span className="transcript text-lg">not mentioned</span>
            </p>
            <p className="mt-8 text-xs text-on-brand/70">
              Illustrative example. Not a real firm and not a live answer. Your audit
              returns your own.
            </p>
          </div>
        </div>
      </section>

      {/* What the record contains — a definition list, not a card grid */}
      <section className="border-b border-line bg-surface-1">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div>
            <h2 className="max-w-[16ch] text-[clamp(2rem,3.6vw,3rem)] text-fg">
              Every number opens to the sentence it came from.
            </h2>
            <p className="mt-5 max-w-[62ch] text-lg text-fg">
              Most visibility tools hand you a score and ask for trust. A partner will ask
              where the number came from, and you should be able to answer in one click.
            </p>
          </div>

          <dl className="mt-14 grid gap-x-16 gap-y-10 md:grid-cols-2">
            {RECORD.map((item) => (
              <div key={item.term} className="border-t border-line-strong pt-5">
                <dt className="font-display text-2xl text-brand-700">{item.term}</dt>
                <dd className="mt-2 max-w-[58ch] text-fg">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Proceedings — ruled legal-pad stock; the sequence carries real information */}
      <section className="border-b border-line bg-brand-50">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="text-[clamp(2rem,3.6vw,3rem)] text-fg">How it proceeds</h2>
          <ol className="mt-12 space-y-px">
            {PROCEEDINGS.map((p) => (
              <li
                key={p.step}
                className="grid gap-x-8 gap-y-2 border-t border-line-strong bg-surface-1/70 px-6 py-7 md:grid-cols-[7rem_1fr]"
              >
                <span className="notation pt-1 text-accent">{p.step}</span>
                <div>
                  <h3 className="font-display text-2xl text-fg">{p.title}</h3>
                  <p className="mt-2 max-w-[66ch] text-fg">{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Fee schedule */}
      <section className="border-b border-line bg-surface-1">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="text-[clamp(2rem,3.6vw,3rem)] text-fg">Schedule of fees</h2>
          <p className="mt-4 text-fg">
            Seven-day trial on both. Annual billing is two months free.
          </p>

          <div className="mt-12 grid gap-px border border-line-strong bg-line-strong md:grid-cols-2">
            <div className="bg-surface-1 p-8">
              <h3 className="font-display text-3xl text-fg">Solo</h3>
              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="tnum font-display text-5xl text-fg">$49</span>
                <span className="notation text-fg-muted">per month</span>
              </p>
              <p className="tnum mt-1 text-sm text-fg-muted">
                or $490 a year, <span className="font-medium text-success">save $98</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-fg">
                <li className="border-b border-line pb-2.5">One firm</li>
                <li className="border-b border-line pb-2.5">20 questions, scanned daily</li>
                <li className="border-b border-line pb-2.5">Five competitors tracked</li>
                <li>Weekly email report</li>
              </ul>
              <Link
                href={user ? "/billing" : "/login"}
                className="mt-8 block border border-brand-500 px-4 py-3 text-center font-semibold text-brand-700 transition-colors hover:bg-brand-600 hover:text-on-brand"
              >
                Start trial
              </Link>
            </div>

            <div className="bg-brand-700 p-8 text-on-brand">
              <h3 className="font-display text-3xl text-on-brand">Agency</h3>
              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="tnum font-display text-5xl">$149</span>
                <span className="notation text-on-brand">per month</span>
              </p>
              <p className="tnum mt-1 text-sm text-on-brand/85">or $1,490 a year, save $298</p>
              <ul className="mt-6 space-y-2.5 text-on-brand">
                <li className="border-b border-brand-500 pb-2.5">Ten client firms</li>
                <li className="border-b border-brand-500 pb-2.5">
                  Daily on three priority firms, weekly on the rest
                </li>
                <li className="border-b border-brand-500 pb-2.5">Competitors tracked per firm</li>
                <li>Client-ready weekly emails</li>
              </ul>
              <Link
                href={user ? "/billing" : "/login"}
                className="mt-8 block bg-on-brand px-4 py-3 text-center font-semibold text-brand-700 transition-colors hover:bg-brand-100"
              >
                Start trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Questions, set as a transcript */}
      <section className="bg-surface-2">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="text-[clamp(2rem,3.6vw,3rem)] text-fg">Questions lawyers ask</h2>
          <dl className="mt-12 max-w-[76ch] space-y-8">
            {FAQS.map((f) => (
              <div key={f.q} className="border-t border-line-strong pt-6">
                <dt className="transcript flex gap-3 text-lg text-fg">
                  <span className="text-accent">Q.</span>
                  <span>{f.q}</span>
                </dt>
                <dd className="transcript mt-3 flex gap-3 text-fg">
                  <span className="text-fg-muted">A.</span>
                  <span className="max-w-[68ch]">{f.a}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Colophon */}
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
