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
      <div className="border border-line-strong bg-surface-1">
        <div className="border-b border-line-strong bg-surface-2 px-6 py-2.5">
          <span className="notation text-[0.8rem] text-fg-muted">Link issued</span>
        </div>
        <div className="px-6 py-6">
          <p role="status" className="text-fg">
            {message}
          </p>
          <p className="mt-3 text-sm text-fg">
            Not there within a minute? Check spam, then send another.
          </p>
          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="notation mt-5 cursor-pointer border-b-2 border-warning pb-0.5 text-brand-700 hover:border-brand-500 disabled:opacity-60"
          >
            {resending ? "Sending…" : "Send another link"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-line-strong bg-surface-1">
      <div className="border-b border-line-strong bg-surface-2 px-6 py-2.5">
        <span className="notation text-[0.8rem] text-fg-muted">Sign-in request</span>
      </div>
      <div className="px-6 py-6">
        <label className="block text-sm">
          <span className="notation text-fg-muted">Work email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@firm.com"
            className="mt-1 w-full border-0 border-b border-line-strong bg-transparent px-0 py-2 text-fg placeholder:text-fg-muted/55 focus:border-brand-500 focus:outline-none focus:ring-0"
          />
        </label>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-6 w-full cursor-pointer bg-brand-500 px-4 py-3.5 font-semibold text-on-brand transition-colors hover:bg-brand-600 disabled:cursor-wait disabled:opacity-70"
        >
          {status === "submitting" ? "Sending…" : "Email me a sign-in link"}
        </button>
        {status === "error" && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
