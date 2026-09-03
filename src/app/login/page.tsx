import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../site-header";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Sign in — First Chair" };

/** Callback failures redirect here with ?error=. Each names the problem and
 *  the way out — previously these bounced back silently. */
const ERRORS: Record<string, string> = {
  link_invalid_or_expired:
    "That sign-in link has already been used or has expired. Links are good for one use — request a fresh one below.",
  missing_code:
    "That link arrived without its sign-in code, which usually means an email client rewrote it. Request a new one and open it directly.",
};

const FALLBACK_ERROR = "We could not complete that sign-in. Request a new link below.";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? (ERRORS[error] ?? FALLBACK_ERROR) : null;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader>
        <Link href="/" className="notation text-fg hover:text-brand-700">
          Back to site
        </Link>
      </SiteHeader>

      <main className="flex flex-1 items-center justify-center bg-surface-2 px-6 py-16">
        <div className="w-full max-w-md">
          <h1 className="font-display text-4xl text-fg">Sign in</h1>
          <p className="mt-3 text-fg">
            We email you a link. There is no password to remember or lose.
          </p>

          {message && (
            <p
              role="alert"
              className="mt-6 bg-surface-1 px-4 py-3 text-sm text-fg"
            >
              {message}
            </p>
          )}

          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
