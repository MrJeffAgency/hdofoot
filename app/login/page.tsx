"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07090d] px-4 text-white">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500 text-3xl">
            ⚽
          </div>

          <h1 className="text-3xl font-bold">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Sign in to continue
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-white/10 bg-[#0d1118] p-6 shadow-2xl"
        >

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              className="
                tv-focus
                min-h-[52px]
                w-full
                rounded-xl
                border
                border-white/10
                bg-[#07090d]
                px-4
                text-white
                outline-none
                focus:border-green-500
              "
              placeholder="you@example.com"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              autoComplete="current-password"
              className="
                tv-focus
                min-h-[52px]
                w-full
                rounded-xl
                border
                border-white/10
                bg-[#07090d]
                px-4
                text-white
                outline-none
                focus:border-green-500
              "
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              tv-focus
              mt-6
              min-h-[52px]
              w-full
              rounded-xl
              bg-green-500
              px-6
              font-bold
              text-black
              transition
              hover:bg-green-400
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{" "}

            <Link
              href="/register"
              className="tv-focus font-semibold text-green-400 hover:text-green-300"
            >
              Create one
            </Link>
          </div>

        </form>
      </div>
    </main>
  );
}