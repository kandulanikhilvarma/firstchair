"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "submitting" | "sent" | "error";

export default function LoginForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
      setMessage(`Link sent to ${email}. Check your inbox (and spam).`);
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-border bg-surface-0 p-6 text-center shadow-card">
        <p role="status" className="text-sm text-accent-600">{message}</p>
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
