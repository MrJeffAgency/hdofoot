"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function TVSearchInput() {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");

  useEffect(() => {
    const value = query.trim();

    // Don't search empty text
    if (!value) {
      if (pathname === "/tv/search") {
        router.push("/tv");
      }
      return;
    }

    const timer = setTimeout(() => {
      router.push(
        `/tv/search?q=${encodeURIComponent(value)}`
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [query, router, pathname]);

  return (
    <div className="relative w-full max-w-2xl">
      <div
        className="
          flex
          min-h-[52px]
          items-center
          overflow-hidden
          rounded-xl
          border
          border-white/10
          bg-[#0d1118]
          transition
          focus-within:border-green-500/50
          focus-within:ring-2
          focus-within:ring-green-500/10
        "
      >
        {/* Search icon */}
        <span className="pl-4 text-gray-500">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
        </span>

        {/* Search input */}
        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search TV shows..."
          aria-label="Search TV shows"
          autoComplete="off"
          className="
            min-w-0
            flex-1
            bg-transparent
            px-3
            py-3
            text-sm
            text-white
            outline-none
            placeholder:text-gray-500
          "
        />

        {/* Loading indicator */}
        {query.trim() && (
          <span
            className="
              mr-4
              h-4
              w-4
              animate-pulse
              rounded-full
              border-2
              border-green-400/30
              border-t-green-400
            "
          />
        )}
      </div>
    </div>
  );
}

export default function TVSearch() {
  return <TVSearchInput />;
}