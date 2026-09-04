import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy — First Chair" };

const UPDATED = "August 2026";

/* Describes only what the application actually does today. Company entity,
   jurisdiction, and governing law are deliberately left as [BRACKETS] — those
   are the owner's facts to supply, and counsel should review before launch. */
export default function PrivacyPage() {
  return (
    <article className="text-fg">
      <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] text-fg">
        Privacy
      </h1>
      <p className="notation mt-3 text-fg-muted">Last updated {UPDATED}</p>

      <p className="mt-8 text-lg">
        First Chair records how public AI assistants answer questions about law firms. This
        page states plainly what we collect, where it goes, and how to get rid of it.
      </p>

      <Section title="What we collect">
        <p>Three things, and nothing else:</p>
        <List
          items={[
            "Account data — your email address, and the workspace created when you first sign in. We use magic links, so we never receive or store a password.",
            "Firm data you enter — the firm names, aliases, cities, practice areas, competitors, and questions you choose to track. This is your input, not data we gather about you.",
            "Scan results — the answers public AI engines return to those questions, stored verbatim, along with the scores derived from them.",
          ]}
        />
        <p className="mt-4">
          We do not use advertising trackers, we do not sell data, and we do not build
          profiles of individuals.
        </p>
      </Section>

      <Section title="Where your data goes">
        <p>
          Running this service means sending some data to other companies. The complete
          list:
        </p>
        <dl className="mt-5 space-y-4">
          <Processor name="Supabase" role="Database and authentication. Stores everything above." />
          <Processor name="Vercel" role="Hosting. Processes requests and standard server logs." />
          <Processor
            name="OpenAI, Google, Perplexity"
            role="The engines we query. They receive the tracking questions — for example “best personal injury lawyer in Austin” — never your email or account details."
          />
          <Processor name="Stripe" role="Payments. Stripe handles card details directly; we never see or store a card number." />
          <Processor name="Resend" role="Email delivery for sign-in links and weekly reports." />
        </dl>
      </Section>

      <Section title="A note on the questions we send">
        <p>
          The questions sent to AI engines are the kind any member of the public could type.
          They contain firm names and practice areas — business information, not personal
          information about your clients. Do not enter client names, matter details, or any
          privileged information into First Chair. The product has no use for it, and it
          would leave our systems as part of a query.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          Account and firm data are kept while your account is open. Raw engine responses are
          retained so that every score stays auditable — that traceability is the point of
          the product. Close your account and we delete both, along with any workspace that
          has no remaining members.
        </p>
      </Section>

      <Section title="Your choices">
        <List
          items={[
            "Get a copy of your data, or have it corrected.",
            "Delete your account and everything attached to it.",
            "Stop the weekly report from its unsubscribe link without closing your account.",
          ]}
        />
        <p className="mt-4">
          Email <Mail /> and we will action it. Depending on where you live, the GDPR or
          state privacy laws may give you further rights; we apply the list above to
          everyone regardless.
        </p>
      </Section>

      <Section title="Security">
        <p>
          Every table enforces row-level security, so one workspace cannot read another&apos;s
          data. Data is encrypted in transit and at rest by our infrastructure providers.
          Sign-in is by emailed link, which means there is no password to leak. No system is
          perfect; if you find a problem, write to <Mail /> and we will respond.
        </p>
      </Section>

      <Section title="Changes and contact">
        <p>
          If this policy changes materially we will email account holders rather than quietly
          editing this page. Questions, requests, or complaints: <Mail />.
        </p>
        <p className="mt-4 border-l-2 border-brand-500 bg-brand-50 px-4 py-3 text-sm text-fg">
          Operator: Kandula Studio, Warangal, Telangana 506001, India.
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 border-t border-line-strong pt-6">
      <h2 className="font-display text-2xl text-brand-700">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((t) => (
        <li key={t} className="border-b border-line pb-2.5 last:border-0">
          {t}
        </li>
      ))}
    </ul>
  );
}

function Processor({ name, role }: { name: string; role: string }) {
  return (
    <div className="border-b border-line pb-3 last:border-0">
      <dt className="font-semibold text-fg">{name}</dt>
      <dd className="mt-1">{role}</dd>
    </div>
  );
}

function Mail() {
  return (
    <a
      href="mailto:kandulanikhilvarma@gmail.com"
      className="border-b border-brand-500/40 text-brand-700 hover:border-brand-500"
    >
      kandulanikhilvarma@gmail.com
    </a>
  );
}
