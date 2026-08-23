"use client";

import { useEffect, useState } from "react";
import LocalVideoPlayer from "@/components/LocalVideoPlayer";

interface LocalVideo {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<LocalVideo[]>([]);
  const [selectedVideo, setSelectedVideo] =
    useState<LocalVideo | null>(null);

  const [error, setError] = useState("");

  /* -------------------------------------------------------- */
  /* LOAD FILES */
  /* -------------------------------------------------------- */

  function handleFiles(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    setError("");

    const videoFiles = files.filter((file) => {
      return (
        file.type.startsWith("video/") ||
        /\.(mp4|mkv|webm|mov|m4v|avi|ts)$/i.test(
          file.name
        )
      );
    });

    if (videoFiles.length === 0) {
      setError(
        "No supported video files were selected."
      );
      return;
    }

    const newVideos: LocalVideo[] =
      videoFiles.map((file, index) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      }));

    setVideos((current) => {
      const existingIds = new Set(
        current.map((video) => video.id)
      );

      return [
        ...current,
        ...newVideos.filter(
          (video) =>
            !existingIds.has(video.id)
        ),
      ];
    });

    /*
     * Select the first newly added video.
     */
    if (newVideos[0]) {
      setSelectedVideo(newVideos[0]);
    }

    /*
     * Allow selecting the same file again.
     */
    event.target.value = "";
  }

  /* -------------------------------------------------------- */
  /* REMOVE VIDEO */
  /* -------------------------------------------------------- */

  function removeVideo(id: string) {
    setVideos((current) =>
      current.filter(
        (video) => video.id !== id
      )
    );

    setSelectedVideo((current) => {
      if (!current || current.id !== id) {
        return current;
      }

      return null;
    });
  }

  /* -------------------------------------------------------- */
  /* CLEAR ALL */
  /* -------------------------------------------------------- */

  function clearVideos() {
    setVideos([]);
    setSelectedVideo(null);
    setError("");
  }

  /* -------------------------------------------------------- */
  /* FORMAT SIZE */
  /* -------------------------------------------------------- */

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) {
      return `${Math.round(
        bytes / 1024
      )} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(
        bytes /
        (1024 * 1024)
      ).toFixed(1)} MB`;
    }

    return `${(
      bytes /
      (1024 * 1024 * 1024)
    ).toFixed(2)} GB`;
  }

  return (
    <main className="min-h-screen bg-[#07090d] text-white">

      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-5 md:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="min-w-0">

            <p className="text-xs font-bold uppercase tracking-widest text-green-400">
              HDOFOOT
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              My Videos
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Play video files directly from your device.
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            {/* FILE PICKER */}

            <label
              className="
                tv-focus
                tv-nav-item
                inline-flex
                min-h-[48px]
                cursor-pointer
                items-center
                justify-center
                rounded-xl
                bg-green-500
                px-5
                font-bold
                text-black
              "
            >
              <input
                type="file"
                accept="video/*,.mkv,.avi,.ts,.mov,.m4v"
                multiple
                onChange={handleFiles}
                className="hidden"
              />

              + Add Videos
            </label>

            {videos.length > 0 && (
              <button
                type="button"
                onClick={clearVideos}
                className="
                  tv-focus
                  tv-nav-item
                  min-h-[48px]
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-5
                  font-semibold
                  text-gray-300
                "
              >
                Clear All
              </button>
            )}

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-950/50 p-4">
            <p className="text-sm font-semibold text-red-300">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY STATE */}

        {videos.length === 0 && (
          <section className="rounded-2xl border border-white/10 bg-[#0d1118] p-8 text-center sm:p-12">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-8 w-8 text-green-400"
              >
                <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
                <path d="m10 9 5 3-5 3V9Z" />
              </svg>

            </div>

            <h2 className="mt-5 text-xl font-bold">
              No videos selected
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Select one or more videos from your phone,
              tablet, or Android TV device to play them
              directly in HDOFOOT.
            </p>

            <label
              className="
                tv-focus
                tv-nav-item
                mx-auto
                mt-6
                inline-flex
                min-h-[48px]
                cursor-pointer
                items-center
                rounded-xl
                bg-green-500
                px-6
                font-bold
                text-black
              "
            >
              <input
                type="file"
                accept="video/*,.mkv,.avi,.ts,.mov,.m4v"
                multiple
                onChange={handleFiles}
                className="hidden"
              />

              Choose Video
            </label>

          </section>
        )}

        {/* PLAYER */}

        {selectedVideo && (
          <section className="mb-8">

            <LocalVideoPlayer
              file={selectedVideo.file}
              title={selectedVideo.name}
              onClose={() =>
                setSelectedVideo(null)
              }
            />

          </section>
        )}

        {/* VIDEO LIST */}

        {videos.length > 0 && (
          <section>

            <div className="mb-4 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  Your Videos
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {videos.length}{" "}
                  {videos.length === 1
                    ? "video"
                    : "videos"}{" "}
                  loaded
                </p>
              </div>

            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {videos.map((video) => {
                const isSelected =
                  selectedVideo?.id === video.id;

                return (
                  <div
                    key={video.id}
                    className={`
                      overflow-hidden
                      rounded-2xl
                      border
                      bg-[#0d1118]
                      transition
                      ${
                        isSelected
                          ? "border-green-500/60"
                          : "border-white/10"
                      }
                    `}
                  >

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedVideo(video)
                      }
                      className="
                        tv-focus
                        tv-nav-item
                        block
                        w-full
                        text-left
                      "
                    >

                      <div className="flex aspect-video items-center justify-center bg-black">

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-10 w-10 text-green-400"
                        >
                          <rect
                            x="3"
                            y="5"
                            width="18"
                            height="14"
                            rx="2"
                          />

                          <path d="m10 9 5 3-5 3V9Z" />
                        </svg>

                      </div>

                      <div className="p-4">

                        <h3 className="truncate text-sm font-bold text-white">
                          {video.name}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatSize(
                            video.size
                          )}
                        </p>

                      </div>

                    </button>

                    <div className="border-t border-white/10 p-3">

                      <button
                        type="button"
                        onClick={() =>
                          removeVideo(video.id)
                        }
                        className="
                          tv-focus
                          tv-nav-item
                          w-full
                          rounded-lg
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          text-red-400
                          hover:bg-red-500/10
                        "
                      >
                        Remove
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>

          </section>
        )}

      </div>

    </main>
  );
}
