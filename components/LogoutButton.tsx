"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="
        tv-focus
        min-h-[44px]
        rounded-xl
        border
        border-white/10
        bg-[#0d1118]
        px-4
        text-sm
        font-semibold
        text-white
        transition
        hover:border-red-500/40
        hover:text-red-400
      "
    >
      Logout
    </button>
  );
}