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
      <div className="border border-border-strong bg-surface-0">
        <div className="border-b border-border-strong bg-surface-50 px-6 py-2.5">
          <span className="notation text-[0.8rem] text-ink-500">Link issued</span>
        </div>
        <div className="px-6 py-6">
          <p role="status" className="text-ink-900">
            {message}
          </p>
          <p className="mt-3 text-sm text-ink-700">
            Not there within a minute? Check spam, then send another.
          </p>
          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="notation mt-5 cursor-pointer border-b-2 border-canary-400 pb-0.5 text-ox-700 hover:border-ox-700 disabled:opacity-60"
          >
            {resending ? "Sending…" : "Send another link"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-border-strong bg-surface-0">
      <div className="border-b border-border-strong bg-surface-50 px-6 py-2.5">
        <span className="notation text-[0.8rem] text-ink-500">Sign-in request</span>
      </div>
      <div className="margin-rule px-6 py-6">
        <label className="block text-sm">
          <span className="notation text-ink-500">Work email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@firm.com"
            className="mt-1 w-full border-0 border-b border-border-strong bg-transparent px-0 py-2 text-ink-900 placeholder:text-ink-500/55 focus:border-ox-700 focus:outline-none focus:ring-0"
          />
        </label>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-6 w-full cursor-pointer bg-ox-700 px-4 py-3.5 font-semibold text-canary-100 transition-colors hover:bg-ox-900 disabled:cursor-wait disabled:opacity-70"
        >
          {status === "submitting" ? "Sending…" : "Email me a sign-in link"}
        </button>
        {status === "error" && (
          <p role="alert" className="mt-3 text-sm text-rule">
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
