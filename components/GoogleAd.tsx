"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function GoogleAd() {
  useEffect(() => {
    try {
      (window.adsbygoogle =
        window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{
        display: "block",
      }}
      data-ad-client="ca-pub-9450563411919624"
      data-ad-slot="6466422687"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}