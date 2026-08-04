import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms — First Chair" };

const UPDATED = "August 2026";

/* States only what the product actually does and what pricing actually is.
   Entity, jurisdiction, and governing law are left as [BRACKETS] for the
   owner and counsel to complete before taking payment. */
export default function TermsPage() {
  return (
    <article className="text-ink-700">
      <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] text-ink-900">Terms</h1>
      <p className="notation mt-3 text-ink-500">Last updated {UPDATED}</p>

      <p className="mt-8 text-lg">
        Plain terms for using First Chair. Using the service means agreeing to them.
      </p>

      <Section title="What the service does">
        <p>
          First Chair sends questions to public AI assistants — currently ChatGPT, Gemini and
          Perplexity — through their official APIs, records the answers, and scores whether a
          firm you track is recommended, mentioned, or absent.
        </p>
      </Section>

      <Section title="What we do not promise">
        <p>
          This matters more than the rest of this page, so it is not buried:
        </p>
        <List
          items={[
            "API answers are not guaranteed identical to what a person sees in the consumer ChatGPT, Gemini or Perplexity apps. They track closely; they are not the same system, and no tool can honestly claim otherwise.",
            "AI engines are non-deterministic and change without notice. Scores move for reasons outside anyone's control, including ours.",
            "We do not promise that using First Chair will improve your visibility, your rankings, or your caseload. We report what the engines say; acting on it is your work.",
            "Nothing here is legal advice, and nothing here is advertising compliance advice. You remain responsible for your own bar rules on attorney advertising.",
          ]}
        />
      </Section>

      <Section title="Your account">
        <p>
          You need a working email address, and you are responsible for what happens under
          your account. Sign-in links are personal — treat them like a password. Tell us at{" "}
          <Mail /> if you think someone else has access.
        </p>
        <p>
          You may track firms you represent or compete with. Do not enter client names,
          matter details, or privileged information; the product has no use for it.
        </p>
      </Section>

      <Section title="Payment">
        <List
          items={[
            "Solo is $49 per month for one firm. Agency is $149 per month for up to ten firms. Annual billing is charged as ten months.",
            "The trial runs 7 days and requires a card. Nothing is charged until it ends. Cancel during the trial and you are not billed.",
            "Subscriptions renew automatically until cancelled. Cancel any time from the billing portal; access continues to the end of the paid period.",
            "Payments are handled by Stripe. We do not see or store card numbers.",
          ]}
        />
        <p className="mt-4">
          We can change prices, but not on an existing subscription without notice by email
          first.
        </p>
      </Section>

      <Section title="Fair use">
        <p>
          Plan limits are real limits, not suggestions. Do not resell raw access, script the
          service, or attempt to circumvent the brand limits on your plan. Agencies are
          expressly welcome to report on results to their own clients — that is the Agency
          plan working as intended.
        </p>
      </Section>

      <Section title="Your data and ours">
        <p>
          The firm data and questions you enter remain yours. You grant us permission to
          process them to run the service, as described in the{" "}
          <a href="/privacy" className="border-b border-ox-500/40 text-ox-700 hover:border-ox-700">
            privacy policy
          </a>
          . Engine answers are stored so your scores stay auditable. The software, interface,
          scoring method, and prompt library remain ours.
        </p>
      </Section>

      <Section title="Ending it">
        <p>
          You can close your account at any time; we delete your data as described in the
          privacy policy. We may suspend an account for non-payment or for the fair-use
          breaches above, and we will tell you why.
        </p>
      </Section>

      <Section title="Liability">
        <p>
          The service is provided as-is. To the extent the law allows, our total liability is
          limited to what you paid us in the 12 months before the claim. We do not exclude
          liability the law does not let us exclude.
        </p>
        <p className="mt-4 border-l-2 border-canary-400 bg-canary-100 px-4 py-3 text-sm text-ink-700">
          Operator: [LEGAL ENTITY NAME], [REGISTERED ADDRESS]. Governing law: [JURISDICTION].
          These bracketed details must be completed, and these terms reviewed by counsel,
          before taking payment.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms: <Mail />.
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 border-t border-border-strong pt-6">
      <h2 className="font-display text-2xl text-ox-700">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((t) => (
        <li key={t} className="border-b border-border pb-2.5 last:border-0">
          {t}
        </li>
      ))}
    </ul>
  );
}

function Mail() {
  return (
    <a
      href="mailto:kandulanikhilvarma@gmail.com"
      className="border-b border-ox-500/40 text-ox-700 hover:border-ox-700"
    >
      kandulanikhilvarma@gmail.com
    </a>
  );
}
