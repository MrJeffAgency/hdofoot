"use client";

import Link from "next/link";
import Icon from "@/components/Icons";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090d]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 lg:px-6">

        {/* LOGO */}
        <Link
          href="/"
          className="tv-focus flex items-center gap-2 rounded-xl text-xl font-black tracking-tight"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500 text-black">
            <Icon name="football" size={20} />
          </span>

          <span>
            HDO<span className="text-green-400">FOOT</span>
          </span>
        </Link>

        {/* ACCOUNT */}
        <Link
          href="/profile"
          aria-label="Account"
          className="
            tv-focus
            flex
            min-h-[44px]
            items-center
            gap-3
            rounded-xl
            border
            border-white/10
            bg-[#0d1118]
            px-3
            text-gray-300
            transition
            hover:border-green-500/40
            hover:bg-[#121821]
            hover:text-white
            focus:outline-none
          "
        >
          <span
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-green-500/15
              text-green-400
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
            </svg>
          </span>

          <span className="hidden text-sm font-semibold sm:block">
            Account
          </span>
        </Link>

      </div>
    </header>
  );
}