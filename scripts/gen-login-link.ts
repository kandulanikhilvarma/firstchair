// Dev utility: mint a magic-link URL for local auth testing without SMTP
// (Supabase built-in email is rate-limited to ~2/hour). Server-side only.
// Usage: npx tsx --env-file=.env.local scripts/gen-login-link.ts you@example.com
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
if (!email) {
  console.error("usage: gen-login-link.ts <email>");
  process.exit(1);
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

admin.auth.admin.generateLink({ type: "magiclink", email }).then(({ data, error }) => {
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  const { hashed_token, verification_type } = data.properties;
  console.log(
    `http://localhost:3000/auth/callback?token_hash=${hashed_token}&type=${verification_type}`,
  );
});
