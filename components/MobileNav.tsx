"use client";

import Link from "next/link";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    ),
  },
  {
    href: "/live",
    label: "Live",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M5.64 5.64a9 9 0 0 0 0 12.72" />
        <path d="M18.36 5.64a9 9 0 0 1 0 12.72" />
      </svg>
    ),
  },
  {
    href: "/fixtures",
    label: "Matches",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
        />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    ),
  },
  {
    href: "/iptv",
    label: "IPTV",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />
        <path d="M8 21h8" />
        <path d="M12 19v2" />
        <path d="m9 10 4 2-4 2v-4Z" />
        <path d="M16 10h1" />
        <path d="M16 14h1" />
      </svg>
    ),
  },
  {
    href: "/movie",
    label: "Movies",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
        />
        <path d="m3 8 18-4M3 16l18-4M8 4l4 16M16 4l4 16" />
      </svg>
    ),
  },
  {
    href: "/tv",
    label: "TV Shows",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />
        <path d="m8 3 4 2 4-2" />
        <path d="M8 12h.01M12 12h.01M16 12h.01M8 16h8" />
      </svg>
    ),
  },
  {
    href: "/videos",
    label: "Videos",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />
        <path d="m10 9 5 3-5 3V9Z" />
      </svg>
    ),
  },
];

export default function MobileNav() {
  return (
    <nav
      className="
        tv-nav
        fixed
        bottom-0
        left-0
        right-0
        z-50
        border-t
        border-white/10
        bg-[#0d1118]/95
        backdrop-blur-xl
        lg:hidden
      "
      aria-label="Mobile navigation"
    >
      <div
        className="
          tv-nav-inner
          grid
          grid-cols-7
          gap-1
          px-2
          pb-[env(safe-area-inset-bottom)]
        "
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="
              tv-focus
              tv-nav-item
              flex
              min-h-[76px]
              flex-col
              items-center
              justify-center
              gap-1
              rounded-xl
              text-gray-400
            "
          >
            <span className="tv-nav-icon">
              {item.icon}
            </span>

            <span className="tv-nav-label">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}