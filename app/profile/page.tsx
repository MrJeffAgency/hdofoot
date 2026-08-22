"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProfilePage() {
  const [copied, setCopied] = useState(false);

  const btcAddress =
    process.env.NEXT_PUBLIC_BTC_ADDRESS ||
    process.env.BTC_ADDRESS ||
    "";

  const telegramBotUrl =
    "https://t.me/hdofoothelp_bot";

  async function copyBitcoinAddress() {
    if (!btcAddress) return;

    try {
      await navigator.clipboard.writeText(btcAddress);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy Bitcoin address:",
        error
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#07090d] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="mb-7">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Profile
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            HDOFOOT information, help and support.
          </p>
        </div>

        {/* =================================================
            HDOFOOT PROFILE CARD
            ================================================= */}

        <section
          className="
            rounded-2xl
            border
            border-white/10
            bg-[#0d1118]
            p-6
            sm:p-8
          "
        >
          <div className="flex flex-col items-center text-center">

            <div
              className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                bg-green-500
                text-4xl
                shadow-lg
              "
            >
              ⚽
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              HDOFOOT
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">
              Welcome to HDOFOOT. Enjoy football,
              live matches, fixtures, leagues and
              more.
            </p>

          </div>
        </section>

        {/* =================================================
            HELP
            ================================================= */}

        <section
          className="
            mt-6
            rounded-2xl
            border
            border-white/10
            bg-[#0d1118]
            p-6
            sm:p-8
          "
        >
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              Help
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Need help or want to contact us?
            </p>
          </div>

          <a
            href={telegramBotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              tv-focus
              flex
              min-h-[56px]
              w-full
              items-center
              gap-4
              rounded-xl
              border
              border-white/10
              bg-[#07090d]
              px-5
              transition
              hover:border-blue-500/40
              hover:bg-[#121821]
              focus:outline-none
            "
          >
            {/* Telegram icon */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-blue-500/15
                text-blue-400
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M21.9 3.6 18.7 20c-.2 1.2-.9 1.5-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6.1 13.7 1.2 12c-1.1-.3-1.1-1 .2-1.5L20.5 3c.9-.3 1.7.2 1.4.6Z" />
              </svg>
            </div>

            <div className="min-w-0 flex-1 text-left">
              <p className="font-semibold text-white">
                HDOFOOT Help Bot
              </p>

              <p className="mt-1 truncate text-sm text-gray-500">
                @hdofoothelp_bot
              </p>
            </div>

            <span className="text-gray-500">
              →
            </span>
          </a>
        </section>

        {/* =================================================
            DONATE
            ================================================= */}

        <section
          className="
            mt-6
            rounded-2xl
            border
            border-white/10
            bg-[#0d1118]
            p-6
            sm:p-8
          "
        >
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              Donate
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              If you enjoy HDOFOOT and would like to
              support the project, you can donate
              using Bitcoin.
            </p>
          </div>

          {/* =================================================
              BITCOIN
              ================================================= */}

          {btcAddress ? (
            <div
              className="
                rounded-xl
                border
                border-white/10
                bg-[#07090d]
                p-5
              "
            >
              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-orange-500/15
                    text-xl
                    font-bold
                    text-orange-400
                  "
                >
                  ₿
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-white">
                    Bitcoin
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    BTC donation address
                  </p>
                </div>

              </div>

              {/* BTC ADDRESS */}

              <div
                className="
                  mt-4
                  rounded-lg
                  border
                  border-white/10
                  bg-[#0d1118]
                  p-3
                "
              >
                <p
                  className="
                    break-all
                    text-xs
                    leading-5
                    text-gray-400
                  "
                >
                  {btcAddress}
                </p>
              </div>

              {/* COPY BUTTON */}

              <button
                type="button"
                onClick={copyBitcoinAddress}
                className="
                  tv-focus
                  mt-3
                  flex
                  min-h-[52px]
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-orange-500
                  px-5
                  font-bold
                  text-black
                  transition
                  hover:bg-orange-400
                  focus:outline-none
                "
              >
                {copied
                  ? "✓ BTC Address Copied"
                  : "Copy BTC Address"}
              </button>
            </div>
          ) : (
            <div
              className="
                rounded-xl
                border
                border-white/10
                bg-[#07090d]
                p-4
                text-sm
                text-gray-500
              "
            >
              Bitcoin donation address is not configured.
            </div>
          )}
        </section>

        {/* =================================================
            NAVIGATION
            ================================================= */}

        <section
          className="
            mt-6
            rounded-2xl
            border
            border-white/10
            bg-[#0d1118]
            p-6
          "
        >
          <Link
            href="/"
            className="
              tv-focus
              flex
              min-h-[52px]
              w-full
              items-center
              justify-center
              rounded-xl
              bg-green-500
              px-6
              font-bold
              text-black
              transition
              hover:bg-green-400
              focus:outline-none
            "
          >
            Back to HDOFOOT
          </Link>
        </section>

      </div>
    </main>
  );
} 