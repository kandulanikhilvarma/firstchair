import { createBrowserClient } from "@supabase/ssr";

/** Browser-side client (anon key, RLS enforced). */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("missing NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY");
  return createBrowserClient(url, key);
}
