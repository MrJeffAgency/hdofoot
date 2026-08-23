"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

interface LocalVideoPlayerProps {
  file: File;
  title: string;
  onClose?: () => void;
}

export default function LocalVideoPlayer({
  file,
  title,
  onClose,
}: LocalVideoPlayerProps) {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const [videoUrl, setVideoUrl] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  /* -------------------------------------------------------- */
  /* CREATE VIDEO URL */
  /* -------------------------------------------------------- */

  useEffect(() => {
    if (!file) {
      return;
    }

    setError("");
    setLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const url =
      URL.createObjectURL(file);

    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  /* -------------------------------------------------------- */
  /* LOAD VIDEO */
  /* -------------------------------------------------------- */

  useEffect(() => {
    const video =
      videoRef.current;

    if (!video || !videoUrl) {
      return;
    }

    setLoading(true);
    setError("");

    video.load();

    return () => {
      video.pause();
    };
  }, [videoUrl]);

  /* -------------------------------------------------------- */
  /* PLAY */
  /* -------------------------------------------------------- */

  async function playVideo() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    try {
      setError("");

      await video.play();

      setIsPlaying(true);
    } catch (err) {
      console.error(
        "Video playback failed:",
        err
      );

      setError(
        "The browser could not play this video. MP4/H.264 videos are recommended."
      );

      setIsPlaying(false);
    }
  }

  /* -------------------------------------------------------- */
  /* PAUSE / PLAY */
  /* -------------------------------------------------------- */

  async function togglePlay() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      await playVideo();
    } else {
      video.pause();
    }
  }

  /* -------------------------------------------------------- */
  /* VIDEO READY */
  /* -------------------------------------------------------- */

  function handleLoadedMetadata() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    setLoading(false);

    if (
      Number.isFinite(
        video.duration
      )
    ) {
      setDuration(
        video.duration
      );
    }
  }

  function handleCanPlay() {
    setLoading(false);
  }

  /* -------------------------------------------------------- */
  /* TIME */
  /* -------------------------------------------------------- */

  function handleTimeUpdate() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    setCurrentTime(
      video.currentTime
    );
  }

  /* -------------------------------------------------------- */
  /* SEEK */
  /* -------------------------------------------------------- */

  function handleSeek(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const value =
      Number(event.target.value);

    video.currentTime = value;

    setCurrentTime(value);
  }

  /* -------------------------------------------------------- */
  /* VIDEO ERROR */
  /* -------------------------------------------------------- */

  function handleVideoError() {
    setLoading(false);
    setIsPlaying(false);

    const video =
      videoRef.current;

    const mediaError =
      video?.error;

    console.error(
      "Local video error:",
      mediaError
    );

    if (
      mediaError?.code ===
      MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
    ) {
      setError(
        `This browser cannot play "${file.name}". MP4 videos encoded with H.264/AAC are the safest format for Android and web browsers.`
      );

      return;
    }

    setError(
      "Unable to play this video."
    );
  }

  /* -------------------------------------------------------- */
  /* FORMAT TIME */
  /* -------------------------------------------------------- */

  function formatTime(
    seconds: number
  ) {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return "0:00";
    }

    const total =
      Math.floor(seconds);

    const hours =
      Math.floor(
        total / 3600
      );

    const minutes =
      Math.floor(
        (total % 3600) / 60
      );

    const secs =
      total % 60;

    if (hours > 0) {
      return `${hours}:${String(
        minutes
      ).padStart(
        2,
        "0"
      )}:${String(
        secs
      ).padStart(
        2,
        "0"
      )}`;
    }

    return `${minutes}:${String(
      secs
    ).padStart(
      2,
      "0"
    )}`;
  }

  /* -------------------------------------------------------- */
  /* FULLSCREEN */
  /* -------------------------------------------------------- */

  async function enterFullscreen() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    try {
      if (
        document.fullscreenElement
      ) {
        await document.exitFullscreen();
        return;
      }

      if (
        video.requestFullscreen
      ) {
        await video.requestFullscreen();
        return;
      }

      const webkitVideo =
        video as HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
        };

      if (
        webkitVideo.webkitEnterFullscreen
      ) {
        webkitVideo.webkitEnterFullscreen();
      }
    } catch (err) {
      console.warn(
        "Fullscreen failed:",
        err
      );
    }
  }

  /* -------------------------------------------------------- */
  /* RENDER */
  /* -------------------------------------------------------- */

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">

      {/* HEADER */}

      <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#0d1118] px-4 py-3">

        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-white">
            {title}
          </h2>

          <p className="mt-1 truncate text-xs text-gray-500">
            Playing from your device
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="
              tv-focus
              tv-nav-item
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-white/5
              text-gray-300
            "
            aria-label="Close player"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6 6 18" />
            </svg>
          </button>
        )}

      </div>

      {/* PLAYER */}

      <div className="relative bg-black">

        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            preload="auto"
            className="
              block
              min-h-[240px]
              max-h-[75vh]
              w-full
              bg-black
              object-contain
            "
            onPlay={() =>
              setIsPlaying(true)
            }
            onPause={() =>
              setIsPlaying(false)
            }
            onTimeUpdate={
              handleTimeUpdate
            }
            onLoadedMetadata={
              handleLoadedMetadata
            }
            onCanPlay={
              handleCanPlay
            }
            onError={
              handleVideoError
            }
          />
        )}

        {/* LOADING */}

        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">

            <div className="text-center">

              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-green-400" />

              <p className="mt-3 text-sm text-gray-400">
                Loading video...
              </p>

            </div>

          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="absolute inset-x-0 bottom-0 bg-red-950/95 p-4 text-center">

            <p className="text-sm font-semibold text-red-300">
              {error}
            </p>

          </div>
        )}

      </div>

      {/* CONTROLS */}

      <div className="bg-[#0d1118] p-4">

        {/* PROGRESS */}

        {duration > 0 && (
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-green-500"
            aria-label="Video progress"
          />
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={togglePlay}
              className="
                tv-focus
                tv-nav-item
                flex
                min-h-[44px]
                items-center
                justify-center
                rounded-xl
                bg-green-500
                px-5
                font-bold
                text-black
              "
            >
              {isPlaying
                ? "Pause"
                : "Play"}
            </button>

            <span className="text-xs text-gray-500">
              {formatTime(
                currentTime
              )}{" "}
              /{" "}
              {formatTime(
                duration
              )}
            </span>

          </div>

          <button
            type="button"
            onClick={enterFullscreen}
            className="
              tv-focus
              tv-nav-item
              flex
              min-h-[44px]
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              text-sm
              font-semibold
              text-gray-300
            "
          >
            Fullscreen
          </button>

        </div>

      </div>

    </div>
  );
}