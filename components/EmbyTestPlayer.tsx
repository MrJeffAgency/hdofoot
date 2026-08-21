"use client";

import { useEffect, useRef, useState } from "react";

export default function EmbyTestPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const onLoadedMetadata = () => {
      setStatus(
        `Loaded — ${Math.round(video.duration)} seconds`
      );
    };

    const onCanPlay = () => {
      setStatus("Ready to play");
    };

    const onPlaying = () => {
      setStatus("Playing");
    };

    const onPause = () => {
      setStatus("Paused");
    };

    const onError = () => {
      setStatus("Playback error");
      console.error("Video error:", video.error);
    };

    video.addEventListener(
      "loadedmetadata",
      onLoadedMetadata
    );

    video.addEventListener(
      "canplay",
      onCanPlay
    );

    video.addEventListener(
      "playing",
      onPlaying
    );

    video.addEventListener(
      "pause",
      onPause
    );

    video.addEventListener(
      "error",
      onError
    );

    return () => {
      video.removeEventListener(
        "loadedmetadata",
        onLoadedMetadata
      );

      video.removeEventListener(
        "canplay",
        onCanPlay
      );

      video.removeEventListener(
        "playing",
        onPlaying
      );

      video.removeEventListener(
        "pause",
        onPause
      );

      video.removeEventListener(
        "error",
        onError
      );
    };
  }, []);

  return (
    <div className="w-full bg-black">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        className="aspect-video h-auto w-full bg-black"
        src="/api/emby/test-stream/11"
      />

      <p className="mt-2 px-2 text-xs text-gray-400">
        {status}
      </p>
    </div>
  );
}