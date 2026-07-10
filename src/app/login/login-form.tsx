"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "submitting" | "sent" | "error";

const RESEND_COOLDOWN_MS = 30_000;

export default function LoginForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [lastSentAt, setLastSentAt] = useState(0);

  async function sendLink(to: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: to,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return error;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const to = String(new FormData(e.currentTarget).get("email") ?? "");
    setEmail(to);
    const error = await sendLink(to);
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
      setLastSentAt(Date.now());
      setMessage(`Link sent to ${to}.`);
    }
  }

  async function onResend() {
    // Supabase's built-in SMTP rate-limits hard — a cooldown stops users
    // burning their quota by hammering resend.
    if (Date.now() - lastSentAt < RESEND_COOLDOWN_MS) {
      setMessage("Just sent — give it a moment, then check spam.");
      return;
    }
    setResending(true);
    const error = await sendLink(email);
    setResending(false);
    setLastSentAt(Date.now());
    setMessage(error ? error.message : `Link re-sent to ${email}.`);
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-0 p-6 text-center shadow-card">
        <p role="status" className="text-sm text-accent-600">{message}</p>
        <p className="text-sm text-ink-600">
          Not in your inbox after a minute? Check your spam folder — or send it
          again.
        </p>
        <button
          type="button"
          onClick={onResend}
          disabled={resending}
          className="cursor-pointer text-sm font-semibold text-primary-700 hover:text-primary-500 disabled:opacity-60"
        >
          {resending ? "Sending…" : "Send the link again"}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface-0 p-6 shadow-card"
    >
      <label className="text-sm font-medium text-ink-900">
        Work email
        <input
          name="email"
          type="email"
          required
          placeholder="you@firm.com"
          className="w-full rounded-lg border border-border bg-surface-0 px-3 py-2.5 text-ink-900 placeholder:text-ink-600/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        />
      </label>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-1 cursor-pointer rounded-lg bg-primary-700 px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-primary-500 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending link…" : "Email me a sign-in link"}
      </button>
      {status === "error" && (
        <p role="status" className="text-sm text-danger-600">{message}</p>
      )}
    </form>
  );
}
