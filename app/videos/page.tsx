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
    useState<string>("");

  const [error, setError] =
    useState<string>("");

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [volume, setVolume] =
    useState(1);

  const [muted, setMuted] =
    useState(false);

  const [ready, setReady] =
    useState(false);

  /* -------------------------------------------------------- */
  /* CREATE OBJECT URL */
  /* -------------------------------------------------------- */

  useEffect(() => {
    if (!file) {
      return;
    }

    setError("");
    setReady(false);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    const url =
      URL.createObjectURL(file);

    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  /* -------------------------------------------------------- */
  /* CLEAN VIDEO WHEN URL CHANGES */
  /* -------------------------------------------------------- */

  useEffect(() => {
    const video =
      videoRef.current;

    if (!video || !videoUrl) {
      return;
    }

    video.load();

    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [videoUrl]);

  /* -------------------------------------------------------- */
  /* PLAY / PAUSE */
  /* -------------------------------------------------------- */

  async function togglePlay() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (err) {
      console.error(
        "Video play error:",
        err
      );

      setError(
        "The browser could not play this video. The file may use a codec that Android/browser does not support."
      );
    }
  }

  /* -------------------------------------------------------- */
  /* VIDEO EVENTS */
  /* -------------------------------------------------------- */

  function handlePlay() {
    setIsPlaying(true);
  }

  function handlePause() {
    setIsPlaying(false);
  }

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

  function handleLoadedMetadata() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

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
    setReady(true);
    setError("");
  }

  function handleEnded() {
    setIsPlaying(false);
  }

  /* -------------------------------------------------------- */
  /* VIDEO ERROR */
  /* -------------------------------------------------------- */

  function handleVideoError() {
    const video =
      videoRef.current;

    console.error(
      "Local video playback error:",
      video?.error
    );

    setReady(false);

    setError(
      "This video cannot be played by your browser. MP4 videos using H.264 video and AAC audio are the most compatible."
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

    video.currentTime =
      value;

    setCurrentTime(
      value
    );
  }

  /* -------------------------------------------------------- */
  /* VOLUME */
  /* -------------------------------------------------------- */

  function handleVolume(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const value =
      Number(event.target.value);

    video.volume =
      value;

    setVolume(value);

    if (value > 0) {
      video.muted = false;
      setMuted(false);
    }
  }

  function toggleMute() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    video.muted =
      !video.muted;

    setMuted(
      video.muted
    );
  }

  /* -------------------------------------------------------- */
  /* SKIP */
  /* -------------------------------------------------------- */

  function skip(seconds: number) {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const next =
      Math.min(
        Math.max(
          video.currentTime +
            seconds,
          0
        ),
        video.duration || Infinity
      );

    video.currentTime =
      next;

    setCurrentTime(
      next
    );
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
      }
    } catch (err) {
      console.warn(
        "Fullscreen unavailable:",
        err
      );
    }
  }

  /* -------------------------------------------------------- */
  /* FORMAT TIME */
  /* -------------------------------------------------------- */

  function formatTime(
    seconds: number
  ) {
    if (
      !Number.isFinite(
        seconds
      ) ||
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
        (total % 3600) /
          60
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
            {file.name}
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
      <div className="relative aspect-video w-full bg-black">

        {!videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-green-500/20 border-t-green-400" />

              <p className="mt-3 text-sm text-gray-500">
                Loading video...
              </p>
            </div>
          </div>
        )}

        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            preload="auto"
            controls
            controlsList="nodownload"
            className="h-full w-full bg-black object-contain"
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={
              handleLoadedMetadata
            }
            onCanPlay={handleCanPlay}
            onEnded={handleEnded}
            onError={handleVideoError}
          />
        )}

        {/* LOADING */}
        {videoUrl && !ready && !error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="rounded-xl bg-black/70 px-5 py-3 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-green-400" />

              <p className="mt-2 text-xs text-gray-400">
                Preparing video...
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="absolute inset-x-0 bottom-0 bg-red-950/95 p-4">
            <p className="text-center text-sm font-semibold text-red-300">
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
            onChange={
              handleSeek
            }
            className="w-full accent-green-500"
            aria-label="Video progress"
          />
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">

          {/* PLAY */}
          <button
            type="button"
            onClick={togglePlay}
            className="
              tv-focus
              tv-nav-item
              min-h-[44px]
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

          {/* BACK */}
          <button
            type="button"
            onClick={() =>
              skip(-10)
            }
            className="
              tv-focus
              tv-nav-item
              min-h-[44px]
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              text-sm
              font-semibold
              text-white
            "
          >
            −10s
          </button>

          {/* FORWARD */}
          <button
            type="button"
            onClick={() =>
              skip(10)
            }
            className="
              tv-focus
              tv-nav-item
              min-h-[44px]
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              text-sm
              font-semibold
              text-white
            "
          >
            +10s
          </button>

          {/* TIME */}
          <span className="text-xs text-gray-500">
            {formatTime(
              currentTime
            )}{" "}
            /{" "}
            {formatTime(
              duration
            )}
          </span>

          {/* MUTE */}
          <button
            type="button"
            onClick={toggleMute}
            className="
              tv-focus
              tv-nav-item
              ml-auto
              min-h-[44px]
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
            {muted
              ? "Unmute"
              : "Mute"}
          </button>

          {/* VOLUME */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={
              muted
                ? 0
                : volume
            }
            onChange={
              handleVolume
            }
            className="w-24 accent-green-500"
            aria-label="Volume"
          />

          {/* FULLSCREEN */}
          <button
            type="button"
            onClick={
              enterFullscreen
            }
            className="
              tv-focus
              tv-nav-item
              min-h-[44px]
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