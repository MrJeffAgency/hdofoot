"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface FixturePlayerProps {
  type: "emby" | "hls";
  src: string;
  title?: string;
}

export default function FixturePlayer({
  type,
  src,
  title = "Live Match",
}: FixturePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !src) return;

    // --------------------------------------------------
    // EMBY / normal browser-supported video
    // --------------------------------------------------

    if (type === "emby") {
      video.src = src;

      video.play().catch(() => {
        // Browser may require user interaction.
      });

      return () => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      };
    }

    // --------------------------------------------------
    // HLS
    // --------------------------------------------------

    if (type === "hls") {
      // Safari / iOS / browsers with native HLS
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;

        video.play().catch(() => {
          // Autoplay may be blocked.
        });

        return () => {
          video.pause();
          video.removeAttribute("src");
          video.load();
        };
      }

      // Chrome / Android / Android TV / Firefox
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {
            // User can press play.
          });
        });

        return () => {
          hls.destroy();
        };
      }

      console.error("HLS is not supported by this browser.");

      return;
    }
  }, [src, type]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        className="aspect-video w-full"
        controls
        playsInline
        preload="metadata"
        aria-label={title}
      />
    </div>
  );
}