"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EmbyVideo {
  id: string;
  name: string;
  type: string;
  overview: string;
  year: number | null;
  path: string | null;
  image: string | null;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<EmbyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVideos() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/emby/videos", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load Emby videos."
          );
        }

        setVideos(data.items ?? []);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Emby videos."
        );
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  return (
    <main className="min-h-screen w-full bg-[#07090d] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-5 md:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-green-400">
            HDOFOOT
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Videos
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Your videos from Emby.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-10 text-center">
            <p className="text-sm text-gray-500">
              Loading videos...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <p className="font-semibold text-red-400">
              {error}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Make sure Emby is running and your API key is configured.
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && videos.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
              <span className="text-2xl text-green-400">
                ▶
              </span>
            </div>

            <h2 className="mt-4 text-lg font-bold">
              No videos found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              No videos were found in your Emby Video library.
            </p>
          </div>
        )}

        {/* VIDEOS */}
        {!loading && !error && videos.length > 0 && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">
                  My Videos
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {videos.length} videos
                </p>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/videos/watch/${video.id}`}
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
                  {/* POSTER */}
                  <div className="aspect-[2/3] w-full overflow-hidden bg-[#080b10]">

                    {video.image ? (
                      <img
                        src={video.image}
                        alt={video.name}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition
                          duration-300
                          group-hover:scale-105
                        "
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-4xl font-black text-green-400">
                          ▶
                        </span>
                      </div>
                    )}

                  </div>

                  {/* INFO */}
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
          </>
        )}

      </div>
    </main>
  );
}