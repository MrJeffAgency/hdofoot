"use client";

import { useEffect, useState } from "react";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  publishedAt: string;
}

interface YouTubeResponse {
  ok: boolean;
  videos?: YouTubeVideo[];
  error?: string;
}

export default function YouTubePage() {
  const [football, setFootball] = useState<YouTubeVideo[]>([]);
  const [wwe, setWwe] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] =
    useState<YouTubeVideo | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVideos() {
      try {
        setLoading(true);
        setError("");

        const [footballRes, wweRes] =
          await Promise.all([
            fetch(
              "/api/youtube?category=football",
              {
                cache: "no-store",
              }
            ),
            fetch(
              "/api/youtube?category=wwe",
              {
                cache: "no-store",
              }
            ),
          ]);

        const footballData =
          (await footballRes.json()) as YouTubeResponse;

        const wweData =
          (await wweRes.json()) as YouTubeResponse;

        if (!footballRes.ok) {
          throw new Error(
            footballData.error ||
              "Unable to load football videos."
          );
        }

        if (!wweRes.ok) {
          throw new Error(
            wweData.error ||
              "Unable to load WWE videos."
          );
        }

        if (!cancelled) {
          setFootball(footballData.videos || []);
          setWwe(wweData.videos || []);
        }
      } catch (err) {
        console.error(
          "YouTube loading error:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load YouTube videos."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadVideos();

    return () => {
      cancelled = true;
    };
  }, []);

  function VideoCard({
    video,
  }: {
    video: YouTubeVideo;
  }) {
    return (
      <button
        type="button"
        onClick={() => setSelectedVideo(video)}
        className="
          tv-focus
          tv-nav-item
          group
          w-full
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-[#0d1118]
          text-left
          transition
          hover:border-green-500/40
          hover:bg-[#121821]
          focus:outline-none
        "
      >
        <div className="relative aspect-video overflow-hidden bg-black">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
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
            <div className="flex h-full items-center justify-center text-gray-500">
              No thumbnail
            </div>
          )}

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-black/0
              transition
              group-hover:bg-black/40
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-green-500
                text-black
                opacity-0
                transition
                group-hover:opacity-100
              "
            >
              ▶
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3
            className="
              line-clamp-2
              text-sm
              font-bold
              text-white
            "
          >
            {video.title}
          </h3>

          <p className="mt-2 truncate text-xs text-gray-500">
            {video.channel}
          </p>
        </div>
      </button>
    );
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#07090d]
        px-4
        py-6
        pb-28
        text-white
        sm:px-6
        lg:px-8
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">
            YTB
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Football highlights and WWE highlights.
          </p>
        </div>

        {/* LOADING */}

        {loading && (
          <div
            className="
              flex
              min-h-[240px]
              items-center
              justify-center
              rounded-2xl
              border
              border-white/10
              bg-[#0d1118]
            "
          >
            <div className="text-center">
              <div className="text-4xl">
                ▶
              </div>

              <p className="mt-3 text-sm font-semibold text-gray-400">
                Loading YTB videos...
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div
            className="
              rounded-2xl
              border
              border-red-500/20
              bg-[#0d1118]
              p-6
            "
          >
            <p className="font-semibold text-red-400">
              Unable to load YTB
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* FOOTBALL */}

            <section>
              <div className="mb-4">
                <h2 className="text-xl font-bold">
                  ⚽ Football Highlights
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Latest football highlights and
                  match videos.
                </p>
              </div>

              {football.length > 0 ? (
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4
                  "
                >
                  {football.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-[#0d1118] p-5 text-sm text-gray-500">
                  No football highlights found.
                </div>
              )}
            </section>

            {/* WWE */}

            <section className="mt-10">
              <div className="mb-4">
                <h2 className="text-xl font-bold">
                  🤼 WWE Highlights
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Latest WWE highlights and videos.
                </p>
              </div>

              {wwe.length > 0 ? (
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4
                  "
                >
                  {wwe.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-[#0d1118] p-5 text-sm text-gray-500">
                  No WWE highlights found.
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* YOUTUBE PLAYER */}

      {selectedVideo && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/90
            px-3
            py-6
            backdrop-blur-sm
          "
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="
              w-full
              max-w-5xl
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-[#0d1118]
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
              <h2 className="line-clamp-1 text-sm font-bold text-white">
                {selectedVideo.title}
              </h2>

              <button
                type="button"
                onClick={() =>
                  setSelectedVideo(null)
                }
                className="
                  tv-focus
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/5
                  text-xl
                  text-gray-400
                  hover:bg-white/10
                  hover:text-white
                  focus:outline-none
                "
                aria-label="Close video"
              >
                ×
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                className="h-full w-full"
                allow="
                  accelerometer;
                  autoplay;
                  clipboard-write;
                  encrypted-media;
                  gyroscope;
                  picture-in-picture;
                  web-share
                "
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}