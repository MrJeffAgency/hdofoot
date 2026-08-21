"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07090d] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-8">
            <p className="text-sm text-gray-400">
              Loading account...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * LOGGED OUT
   */

  if (!user) {
    return (
      <main className="min-h-screen bg-[#07090d] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">

          <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-6 sm:p-8">

            <div className="flex flex-col items-center text-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15 text-green-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-10 w-10"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                </svg>
              </div>

              <h1 className="mt-5 text-2xl font-bold sm:text-3xl">
                Welcome to HDOFOOT
              </h1>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">
                Sign in to access your account and continue using HDOFOOT.
              </p>

              <div className="mt-7 flex w-full max-w-sm flex-col gap-3 sm:flex-row">

                <Link
                  href="/login"
                  className="
                    tv-focus
                    flex
                    min-h-[52px]
                    flex-1
                    items-center
                    justify-center
                    rounded-xl
                    bg-green-500
                    px-6
                    font-bold
                    text-black
                    transition
                    hover:bg-green-400
                    focus:outline-none
                  "
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="
                    tv-focus
                    flex
                    min-h-[52px]
                    flex-1
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/10
                    bg-[#121821]
                    px-6
                    font-semibold
                    text-white
                    transition
                    hover:border-green-500/40
                    hover:bg-[#18201c]
                    focus:outline-none
                  "
                >
                  Create Account
                </Link>

              </div>

            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * LOGGED IN
   */

  const email =
    user.email || "No email available";

  const initial =
    email.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-[#07090d] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <div className="mb-7">
          <h1 className="text-2xl font-bold sm:text-3xl">
            My Account
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Manage your HDOFOOT account.
          </p>
        </div>

        {/* PROFILE CARD */}

        <section className="rounded-2xl border border-white/10 bg-[#0d1118] p-6 sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            {/* AVATAR */}

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-green-500 text-3xl font-black text-black">
              {initial}
            </div>

            {/* USER INFORMATION */}

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Signed in as
              </p>

              <h2 className="mt-1 break-all text-xl font-bold text-white">
                {email}
              </h2>

              <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Account active
              </div>
            </div>

          </div>

          {/* ACCOUNT DETAILS */}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">

            <div className="rounded-xl border border-white/10 bg-[#07090d] p-4">
              <p className="text-xs text-gray-500">
                Email
              </p>

              <p className="mt-2 break-all text-sm font-medium text-white">
                {email}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#07090d] p-4">
              <p className="text-xs text-gray-500">
                Account status
              </p>

              <p className="mt-2 text-sm font-medium text-green-400">
                Active
              </p>
            </div>

          </div>

          {/* ACTIONS */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <Link
              href="/"
              className="
                tv-focus
                flex
                min-h-[52px]
                flex-1
                items-center
                justify-center
                rounded-xl
                bg-green-500
                px-6
                font-bold
                text-black
                transition
                hover:bg-green-400
                focus:outline-none
              "
            >
              Back to HDOFOOT
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="
                tv-focus
                flex
                min-h-[52px]
                flex-1
                items-center
                justify-center
                rounded-xl
                border
                border-red-500/20
                bg-red-500/10
                px-6
                font-semibold
                text-red-400
                transition
                hover:border-red-500/40
                hover:bg-red-500/15
                focus:outline-none
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loggingOut
                ? "Signing out..."
                : "Sign Out"}
            </button>

          </div>

        </section>

        {/* ACCOUNT INFORMATION */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0d1118] p-6">

          <h2 className="text-lg font-bold">
            Account
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            Your HDOFOOT account is connected to
            Supabase Authentication.
          </p>

          <div className="mt-5 rounded-xl border border-green-500/10 bg-green-500/5 p-4">
            <p className="text-sm text-green-400">
              ✓ Authentication is active
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              You can use your account across the
              protected areas of the app.
            </p>
          </div>

        </section>

      </div>
    </main>
  );
}