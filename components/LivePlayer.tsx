"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface LivePlayerProps {
  src: string;
  title?: string;
}

export default function LivePlayer({
  src,
  title = "Live Match",
}: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !src) return;

    setError(false);
    setLoading(true);

    /*
     * Clean up previous HLS instance.
     */
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    /*
     * Native HLS support.
     * Mainly Safari / iPhone / iPad.
     */
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;

      const handleLoaded = () => {
        setLoading(false);
      };

      const handleError = () => {
        setLoading(false);
        setError(true);
      };

      video.addEventListener("loadedmetadata", handleLoaded);
      video.addEventListener("error", handleError);

      video.play().catch(() => {
        /*
         * Autoplay may be blocked.
         * User can press play manually.
         */
      });

      return () => {
        video.removeEventListener(
          "loadedmetadata",
          handleLoaded
        );

        video.removeEventListener("error", handleError);

        video.pause();
        video.removeAttribute("src");
        video.load();
      };
    }

    /*
     * HLS.js support.
     */
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);

        video.play().catch(() => {
          /*
           * Autoplay may be blocked.
         */
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error("Live HLS error:", data);

        if (data.fatal) {
          setLoading(false);
          setError(true);
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    setLoading(false);
    setError(true);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="relative aspect-video w-full">

        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          controls
          playsInline
          preload="metadata"
          aria-label={title}
        />

        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-green-400" />

              <p className="mt-3 text-sm font-semibold text-white">
                Loading live stream...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#07090d] p-6 text-center">
            <div>
              <p className="font-semibold text-white">
                Unable to play this live stream
              </p>

              <p className="mt-2 text-sm text-gray-500">
                The stream may be offline or unavailable.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}