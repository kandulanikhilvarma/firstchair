import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Server-side client bound to the request's auth cookies (RLS enforced). */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("missing NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY");
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // called from a Server Component — proxy.ts handles session refresh
        }
      },
    },
  });
}
