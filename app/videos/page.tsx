"use client";

import {
  useState,
} from "react";

import LocalVideoPlayer from "@/components/LocalVideoPlayer";

interface LocalVideo {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

export default function VideosPage() {
  const [videos, setVideos] =
    useState<LocalVideo[]>([]);

  const [selectedVideo, setSelectedVideo] =
    useState<LocalVideo | null>(null);

  const [error, setError] =
    useState("");

  /* -------------------------------------------------------- */
  /* LOAD LOCAL VIDEO FILES */
  /* -------------------------------------------------------- */

  function handleFiles(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files =
      Array.from(
        event.target.files || []
      );

    if (files.length === 0) {
      return;
    }

    setError("");

    const videoFiles =
      files.filter((file) => {
        return (
          file.type.startsWith(
            "video/"
          ) ||
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
      videoFiles.map(
        (file, index) => ({
          id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
        })
      );

    setVideos((current) => {
      const existingIds =
        new Set(
          current.map(
            (video) => video.id
          )
        );

      return [
        ...current,
        ...newVideos.filter(
          (video) =>
            !existingIds.has(
              video.id
            )
        ),
      ];
    });

    /*
     * Automatically open the first
     * newly selected video.
     */
    const firstVideo =
      newVideos[0];

    if (firstVideo) {
      setSelectedVideo(
        firstVideo
      );
    }

    /*
     * Allows selecting the same
     * file again later.
     */
    event.target.value = "";
  }

  /* -------------------------------------------------------- */
  /* SELECT VIDEO */
  /* -------------------------------------------------------- */

  function selectVideo(
    video: LocalVideo
  ) {
    setError("");
    setSelectedVideo(video);
  }

  /* -------------------------------------------------------- */
  /* REMOVE VIDEO */
  /* -------------------------------------------------------- */

  function removeVideo(
    id: string
  ) {
    setVideos((current) =>
      current.filter(
        (video) =>
          video.id !== id
      )
    );

    if (
      selectedVideo?.id === id
    ) {
      setSelectedVideo(null);
    }
  }

  /* -------------------------------------------------------- */
  /* FORMAT SIZE */
  /* -------------------------------------------------------- */

  function formatSize(
    bytes: number
  ) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (
      bytes <
      1024 * 1024
    ) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    if (
      bytes <
      1024 *
        1024 *
        1024
    ) {
      return `${(
        bytes /
        (1024 * 1024)
      ).toFixed(1)} MB`;
    }

    return `${(
      bytes /
      (1024 *
        1024 *
        1024)
    ).toFixed(2)} GB`;
  }

  /* -------------------------------------------------------- */
  /* RENDER */
  /* -------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#07090d] text-white">

      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-5 md:px-6 lg:px-8">

        {/* HEADER */}

        <header className="mb-8">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">
            HDOFOOT
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Your Videos
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Select videos stored on your
            device and play them directly
            in your browser.
          </p>

        </header>

        {/* FILE PICKER */}

        <section className="mb-8 rounded-2xl border border-white/10 bg-[#0d1118] p-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-bold">
                Add videos
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                MP4/H.264/AAC is the most
                compatible format.
              </p>
            </div>

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
                px-6
                font-bold
                text-black
              "
            >
              Choose Video

              <input
                type="file"
                accept="video/*,.mkv,.avi,.ts"
                multiple
                onChange={
                  handleFiles
                }
                className="hidden"
              />
            </label>

          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-950/50 p-4">
              <p className="text-sm font-semibold text-red-300">
                {error}
              </p>
            </div>
          )}

        </section>

        {/* PLAYER */}

        {selectedVideo && (
          <section className="mb-8">

            <LocalVideoPlayer
              file={
                selectedVideo.file
              }
              title={
                selectedVideo.name
              }
              onClose={() =>
                setSelectedVideo(
                  null
                )
              }
            />

          </section>
        )}

        {/* VIDEO LIST */}

        {videos.length > 0 && (
          <section>

            <div className="mb-4">

              <h2 className="text-xl font-bold">
                Your Videos
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {videos.length}{" "}
                {videos.length === 1
                  ? "video"
                  : "videos"}{" "}
                selected
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {videos.map(
                (video) => {
                  const isSelected =
                    selectedVideo?.id ===
                    video.id;

                  return (
                    <article
                      key={
                        video.id
                      }
                      className={`
                        overflow-hidden
                        rounded-2xl
                        border
                        ${
                          isSelected
                            ? "border-green-500/60"
                            : "border-white/10"
                        }
                        bg-[#0d1118]
                      `}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          selectVideo(
                            video
                          )
                        }
                        className="
                          tv-focus
                          tv-nav-item
                          block
                          w-full
                          p-4
                          text-left
                        "
                      >

                        <div className="flex h-32 items-center justify-center rounded-xl bg-black">

                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-12 w-12 text-green-400"
                          >
                            <path d="M8 5.14v13.72c0 .77.83 1.25 1.5.86l10.4-6.86a1 1 0 0 0 0-1.72L9.5 4.28C8.83 3.89 8 4.37 8 5.14Z" />
                          </svg>

                        </div>

                        <h3 className="mt-4 truncate text-sm font-bold text-white">
                          {
                            video.name
                          }
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            formatSize(
                              video.size
                            )
                          }
                        </p>

                      </button>

                      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">

                        <span className="truncate pr-3 text-xs text-gray-500">
                          {video.type ||
                            "Video"}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            removeVideo(
                              video.id
                            )
                          }
                          className="
                            tv-focus
                            tv-nav-item
                            shrink-0
                            rounded-lg
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-red-400
                          "
                        >
                          Remove
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          </section>
        )}

        {/* EMPTY STATE */}

        {videos.length === 0 && (
          <section className="rounded-2xl border border-dashed border-white/10 bg-[#0d1118] p-10 text-center">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto h-14 w-14 text-gray-600"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="2"
              />

              <path d="m10 9 5 3-5 3V9Z" />
            </svg>

            <h2 className="mt-4 text-lg font-bold text-gray-300">
              No videos selected
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Choose a video from your
              phone, tablet, or computer
              to start playing it.
            </p>

          </section>
        )}

      </div>

    </main>
  );
}