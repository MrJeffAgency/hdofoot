import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "HDOFOOT",
  description: "Live football scores, fixtures, leagues and matches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#07090d] text-white antialiased">

        <Header />

        <div className="desktop-layout">
          <Sidebar />

          <main className="desktop-main tv-main w-full min-w-0">
            {children}
          </main>
        </div>

        <MobileNav />

      </body>
    </html>
  );
}