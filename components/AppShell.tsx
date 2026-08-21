"use client";

import Link from "next/link";
import { ReactNode } from "react";
import Icon from "@/components/Icons";

const navigation = [
  { href: "/", label: "Home", icon: "home" as const },
  { href: "/live", label: "Live", icon: "liveDot" as const },
  { href: "/fixtures", label: "Fixtures", icon: "calendar" as const },
  { href: "/leagues", label: "Leagues", icon: "trophy" as const },
];

export default function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#07090d] text-white">
      {/* Desktop / TV sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-[#0a0d12] lg:flex lg:flex-col">

        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <Link
            href="/"
            className="tv-focus flex items-center gap-3 rounded-xl px-2 py-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 font-black text-black">
              H
            </div>

            <span className="text-xl font-black tracking-tight">
              HDOFOOT
            </span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-2 p-4">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="tv-focus flex min-h-14 items-center gap-4 rounded-xl px-4 text-sm font-semibold text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <Icon name={item.icon} size={22} />

              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-green-500/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-green-400">
              Live Football
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Scores updated automatically.
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen pb-20 lg:ml-64 lg:pb-0">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0d12]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">

          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="tv-focus flex min-h-16 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-3 text-[11px] font-semibold text-gray-500 hover:text-white"
            >
              <Icon name={item.icon} size={21} />

              <span>{item.label}</span>
            </Link>
          ))}

        </div>
      </nav>
    </div>
  );
}