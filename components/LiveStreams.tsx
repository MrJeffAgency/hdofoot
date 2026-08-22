"use client";

import { useEffect, useState } from "react";
import FixturePlayer from "@/components/FixturePlayer";

interface LiveStream {
  id: string;
  title: string;
  league?: string;
  url: string;
  type?: "m3u8" | "hls";
  logo?: string;
}

export default function LiveStreams() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStreams() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/live.json", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `live.json returned ${response.status}`
          );
        }

        const data = await response.json();

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data.streams)
            ? data.streams
            : Array.isArray(data.channels)
              ? data.channels
              : [];

        setStreams(items);
      } catch (err) {
        console.error("Failed to load live.json:", err);
        setError("Unable to load live streams.");
      } finally {
        setLoading(false);
      }
    }

    loadStreams();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-8 text-center">
        <div className="text-3xl">⚽</div>

        <p className="mt-3 text-sm font-semibold text-white">
          Loading live streams...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-8 text-center">
        <p className="text-sm font-semibold text-red-400">
          {error}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="
            tv-focus
            mt-4
            rounded-xl
            bg-green-500
            px-5
            py-3
            font-bold
            text-black
            focus:outline-none
          "
        >
          Try Again
        </button>
      </div>
    );
  }

  if (streams.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-8 text-center">
        <div className="text-3xl">📺</div>

        <p className="mt-3 text-sm font-semibold text-white">
          No live streams available
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Live streams will appear here when they are available.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Live Now
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {streams.length} live stream
            {streams.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-green-400">
            Live
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {streams.map((stream) => (
          <article
            key={stream.id}
            className="
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-[#0d1118]
            "
          >
            <FixturePlayer
              src={stream.url}
              type="hls"
            />

            <div className="p-5">
              <div className="flex items-start gap-4">
                {stream.logo && (
                  <img
                    src={stream.logo}
                    alt=""
                    className="h-12 w-12 rounded-xl object-contain"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white">
                    {stream.title}
                  </h3>

                  {stream.league && (
                    <p className="mt-1 text-sm text-gray-500">
                      {stream.league}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}