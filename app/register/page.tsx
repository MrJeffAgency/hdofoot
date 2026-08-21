"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (
      data.user &&
      data.session
    ) {
      router.replace("/");
      router.refresh();
      return;
    }

    setMessage(
      "Account created. Check your email to confirm your account."
    );

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07090d] px-4 text-white">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500 text-3xl">
            ⚽
          </div>

          <h1 className="text-3xl font-bold">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Create an account to access the app
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="rounded-2xl border border-white/10 bg-[#0d1118] p-6 shadow-2xl"
        >

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
              {message}
            </div>
          )}

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

          <label
            htmlFor="password"
            className="mb-2 mt-5 block text-sm font-medium text-gray-300"
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
            minLength={6}
            autoComplete="new-password"
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
            placeholder="At least 6 characters"
          />

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
              ? "Creating account..."
              : "Create Account"}
          </button>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}

            <Link
              href="/login"
              className="tv-focus font-semibold text-green-400 hover:text-green-300"
            >
              Sign In
            </Link>
          </div>

        </form>
      </div>
    </main>
  );
}