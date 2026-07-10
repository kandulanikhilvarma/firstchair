import Link from "next/link";
import AuditForm from "./audit-form";

const STEPS = [
  {
    title: "Tell us your firm",
    body: "Name, city, practice area. We generate the 20 questions your prospective clients actually ask AI assistants.",
  },
  {
    title: "We ask the engines",
    body: "Every day we put those questions to ChatGPT, Gemini and Perplexity and record exactly what they answer — raw responses kept, nothing hidden.",
  },
  {
    title: "See who they recommend",
    body: "Your visibility score, share of voice vs competitors, and the sources the engines cite — so you know precisely what to fix.",
  },
];

const FAQS = [
  {
    q: "Is this what ChatGPT really answers?",
    a: "We query the same models through their official APIs with neutral prompts. API answers closely track the consumer apps but aren't guaranteed identical — no tool can promise that, and any vendor who does is overselling. Perplexity and Gemini responses include their live citations, which is the data that matters for fixing your visibility.",
  },
  {
    q: "How fresh is the data?",
    a: "Paid plans scan daily. Your dashboard shows a 30-day trend, and the weekly email flags any movement — yours or a competitor's.",
  },
  {
    q: "Can I track competitors?",
    a: "Yes — up to 5 competitor firms per brand. Share of voice shows exactly how often the engines pick them over you, question by question.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Monthly billing through Stripe, cancel in one click from the billing portal. The 7-day trial requires a card but charges nothing until it ends.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Top nav — logo + the way in for returning + new customers */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-xl font-bold text-primary-900">Rankwell</span>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-ink-600 hover:text-ink-900"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-500"
          >
            Start free trial
          </Link>
        </nav>
      </header>

      {/* Hero — audit form IS the CTA (§3.4) */}
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 py-20 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl text-center lg:text-left">
          <h1 className="text-4xl font-bold text-primary-900 sm:text-5xl">
            Is ChatGPT recommending your firm — or your competitor?
          </h1>
          <p className="mt-5 text-lg text-ink-600">
            Prospective clients now ask AI assistants for lawyer recommendations.
            Rankwell shows you what ChatGPT, Gemini and Perplexity say about your
            firm — and how to become the one they recommend.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-ink-600 lg:justify-start">
            <span>Tracks: ChatGPT</span>
            <span>Google Gemini</span>
            <span>Perplexity</span>
          </div>
          <p className="mt-4 text-center lg:text-left">
            <Link
              href="/audit/demo"
              className="text-sm font-semibold text-primary-700 hover:text-primary-500"
            >
              Not ready? See a sample report →
            </Link>
          </p>
        </div>
        <AuditForm />
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-surface-0">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-3xl font-bold text-primary-900">
            How it works
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="tnum text-sm font-semibold text-primary-500">
                  Step {i + 1}
                </span>
                <h3 className="mt-1 text-xl font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-ink-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold text-primary-900">Pricing</h2>
        <p className="mt-2 text-center text-ink-600">
          7-day free trial on both plans. Annual billing = 2 months free.
        </p>
        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-0 p-8 shadow-card">
            <h3 className="text-xl font-semibold text-ink-900">Solo</h3>
            <p className="tnum mt-2 text-4xl font-bold text-primary-900">
              $49<span className="text-base font-medium text-ink-600">/mo</span>
            </p>
            <ul className="mt-4 space-y-2 text-ink-600">
              <li>1 brand</li>
              <li>20 prompts, daily scans</li>
              <li>Competitor tracking (5)</li>
              <li>Weekly email report</li>
            </ul>
            <Link
              href="/login"
              className="mt-6 block rounded-lg border border-primary-700 px-4 py-2.5 text-center font-semibold text-primary-700 transition-colors duration-200 hover:bg-primary-700 hover:text-white"
            >
              Start 7-day trial
            </Link>
          </div>
          <div className="rounded-xl border-2 border-primary-500 bg-surface-0 p-8 shadow-card-hover">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-ink-900">Agency</h3>
              <span className="rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
            </div>
            <p className="tnum mt-2 text-4xl font-bold text-primary-900">
              $149<span className="text-base font-medium text-ink-600">/mo</span>
            </p>
            <ul className="mt-4 space-y-2 text-ink-600">
              <li>10 client brands</li>
              <li>Daily scans on 3 priority brands, weekly on the rest</li>
              <li>Competitor tracking per brand</li>
              <li>Client-ready weekly emails</li>
            </ul>
            <Link
              href="/login"
              className="mt-6 block rounded-lg bg-primary-700 px-4 py-2.5 text-center font-semibold text-white transition-colors duration-200 hover:bg-primary-500"
            >
              Start 7-day trial
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-surface-0">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-center text-3xl font-bold text-primary-900">
            Questions lawyers ask us
          </h2>
          <dl className="mt-10 space-y-8">
            {FAQS.map((f) => (
              <div key={f.q}>
                <dt className="text-lg font-semibold text-ink-900">{f.q}</dt>
                <dd className="mt-2 text-ink-600">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10 text-sm text-ink-600">
        <span className="font-semibold text-primary-900">Rankwell</span>
        <span>AI visibility tracking for law firms.</span>
      </footer>
    </div>
  );
}
