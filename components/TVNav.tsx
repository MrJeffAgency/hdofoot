"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Live", href: "/live" },
  { label: "Matches", href: "/fixtures" },
  { label: "Leagues", href: "/leagues" },
  { label: "Movies", href: "/movie" },
  { label: "TV Shows", href: "/tv" },
  { label: "WWE", href: "/wwe" },
];

export default function TVNav() {
  const [isTV, setIsTV] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.platform || "";

    const detectedTV =
      /Android TV/i.test(ua) ||
      /GoogleTV/i.test(ua) ||
      /SmartTV/i.test(ua) ||
      /BRAVIA/i.test(ua) ||
      /AFTM/i.test(ua) ||
      /AFTB/i.test(ua) ||
      /AFTT/i.test(ua) ||
      /NetCast/i.test(ua) ||
      /Web0S/i.test(ua) ||
      /Tizen/i.test(ua);

    setIsTV(detectedTV);
  }, []);

  if (!isTV) {
    return null;
  }

  return (
    <nav
      className="
        tv-nav
        fixed
        bottom-0
        left-0
        right-0
        z-[9999]
        border-t
        border-white/10
        bg-[#0d1118]/95
        backdrop-blur-xl
      "
      aria-label="TV navigation"
    >
      <div className="tv-nav-inner">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="
              tv-nav-item
              tv-focus
              flex
              flex-col
              items-center
              justify-center
              gap-2
              rounded-xl
              text-white/60
              outline-none
            "
          >
            <span className="tv-nav-label">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}