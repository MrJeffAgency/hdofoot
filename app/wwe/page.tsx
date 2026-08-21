"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EmbyVideo {
  id: string;
  name: string;
  type: string;
  overview: string;
  year: number | null;
  image: string | null;
}

export default function WWEPage() {
  const [videos, setVideos] = useState<EmbyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVideos() {
      try {
        const response = await fetch("/api/emby/wwe", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load WWE videos.");
        }

        setVideos(data.items ?? []);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load WWE videos."
        );
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-8">

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-green-400">
            HDOFOOT
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            WWE
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Your WWE videos from Emby.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-10 text-center">
            <p className="text-sm text-gray-500">
              Loading WWE videos...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <p className="font-semibold text-red-400">
              {error}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Make sure Emby is running at your configured server address.
            </p>
          </div>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400">
              <span className="text-2xl">W</span>
            </div>

            <h2 className="mt-4 text-lg font-bold">
              No WWE videos found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Emby did not return any videos matching WWE.
            </p>
          </div>
        )}

        {!loading && !error && videos.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/wwe/watch/${video.id}`}
                className="
                  tv-focus
                  tv-nav-item
                  group
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/10
                  bg-[#0d1118]
                  transition
                  hover:border-green-500/30
                  hover:bg-[#10161f]
                "
              >
                <div className="aspect-[2/3] overflow-hidden bg-[#080b10]">
                  {video.image ? (
                    <img
                      src={video.image}
                      alt={video.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-green-400">
                      <span className="text-4xl font-black">
                        WWE
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h2 className="truncate text-sm font-bold text-white">
                    {video.name}
                  </h2>

                  {video.year && (
                    <p className="mt-1 text-xs text-gray-500">
                      {video.year}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}