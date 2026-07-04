import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Magic-link landing: verify the link, set the session cookie, make sure the
 * user has a workspace (first login = signup), then send them to the app.
 *
 * Preferred flow is ?token_hash=&type= (email templates link here directly) —
 * it works even when the link is opened in a different browser than the one
 * that requested it (phone mail apps). ?code= PKCE is kept as fallback for
 * the default Supabase templates.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");

  const supabase = await createClient();
  let user = null;
  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) console.error("verifyOtp failed:", error.message);
    user = data?.user ?? null;
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) console.error("exchangeCodeForSession failed:", error.message);
    user = data?.user ?? null;
  } else {
    return NextResponse.redirect(new URL("/login?error=missing_code", url.origin));
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=link_invalid_or_expired", url.origin));
  }

  await ensureWorkspace(user.id, user.email ?? "");

  return NextResponse.redirect(new URL("/dashboard", url.origin));
}

/**
 * Workspace + membership creation is service-role-only by design — RLS
 * blocks user-side inserts (see 0001_init.sql policy comments).
 * ponytail: not transactional — a failure between the two inserts leaves an
 * orphan workspace, and a double-click could race. Next login self-heals the
 * user (members check reruns); move to a Postgres function if it ever matters.
 */
async function ensureWorkspace(userId: string, email: string) {
  const admin = createAdminClient();

  const { data: membership, error: readErr } = await admin
    .from("members")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (readErr) throw new Error(`members read failed: ${readErr.message}`);
  if (membership) return;

  const name = email.split("@")[0] || "My workspace";
  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: workspace, error: wsErr } = await admin
    .from("workspaces")
    .insert({ name, trial_ends_at: trialEndsAt })
    .select("id")
    .single();
  if (wsErr) throw new Error(`workspace insert failed: ${wsErr.message}`);

  const { error: memberErr } = await admin
    .from("members")
    .insert({ user_id: userId, workspace_id: workspace.id, role: "owner" });
  if (memberErr) throw new Error(`member insert failed: ${memberErr.message}`);
}
