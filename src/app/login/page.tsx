import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Sign in — Rankwell" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-center font-heading text-2xl font-bold text-ink-900">
          Sign in to Rankwell
        </h1>
        <p className="mb-6 text-center text-sm text-ink-600">
          We email you a sign-in link. No password needed.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
