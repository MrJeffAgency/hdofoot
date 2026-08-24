import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "HDOFOOT",
  description:
    "Live football scores, fixtures, leagues and matches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#07090d] text-white antialiased">

        {/* GOOGLE ADSENSE */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9450563411919624"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <Header />

        <div className="desktop-layout">

          {/* DESKTOP SIDEBAR */}
          <div className="hidden lg:flex shrink-0">
            <Sidebar />
          </div>

          {/* PAGE CONTENT */}
          <main className="desktop-main tv-main w-full min-w-0">
            {children}
          </main>

        </div>

        {/* PHONE + TABLET NAVIGATION */}
        <MobileNav />

      </body>
    </html>
  );
}