"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-fg-muted hover:bg-surface-2 hover:text-fg"
    >
      <LogOut className="h-5 w-5" aria-hidden />
      Sign out
    </button>
  );
}
