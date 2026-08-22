"use client";

import { useState } from "react";
import LivePlayer from "@/components/LivePlayer";
import Icon from "@/components/Icons";

interface LiveChannel {
  id: string;
  name: string;
  logo?: string;
  league?: string;
  stream: string;
}

interface LiveMatchesProps {
  channels: LiveChannel[];
}

export default function LiveMatches({
  channels,
}: LiveMatchesProps) {
  const [selected, setSelected] =
    useState<LiveChannel | null>(null);

  if (!channels || channels.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-400">
          <Icon name="football" size={22} />
        </div>

        <p className="mt-4 font-semibold text-white">
          No live streams available
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Check your live.json file and try again.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* PLAYER */}

      {selected && (
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                LIVE NOW
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                {selected.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="
                tv-focus
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-4
                py-2
                text-sm
                font-semibold
                text-gray-300
                transition
                hover:bg-white/10
                focus:outline-none
              "
            >
              Close
            </button>
          </div>

          <LivePlayer
            src={selected.stream}
            title={selected.name}
          />
        </section>
      )}

      {/* LIVE CHANNELS */}

      <div className="mb-4 flex items-center gap-2">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400" />

        <span className="text-sm font-semibold text-green-400">
          LIVE STREAMS
        </span>

        <span className="text-xs text-gray-500">
          {channels.length}{" "}
          {channels.length === 1
            ? "stream"
            : "streams"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="
              rounded-2xl
              border
              border-white/10
              bg-[#0d1118]
              p-5
              transition
              hover:border-green-500/30
              hover:bg-[#10161f]
            "
          >
            <div className="flex items-center gap-4">

              {channel.logo ? (
                <img
                  src={channel.logo}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-xl object-contain"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                  <Icon name="football" size={22} />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-white">
                  {channel.name}
                </p>

                {channel.league && (
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {channel.league}
                  </p>
                )}
              </div>

              <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-green-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                LIVE
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelected(channel)}
              className="
                tv-focus
                tv-nav-item
                mt-5
                flex
                min-h-[52px]
                w-full
                items-center
                justify-center
                rounded-xl
                bg-green-500
                px-5
                font-bold
                text-black
                transition
                hover:bg-green-400
                focus:outline-none
              "
            >
              ▶ Watch Live
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}