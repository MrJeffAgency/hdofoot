"use client";

import { useEffect, useRef, useState } from "react";

interface EmbyPlayerProps {
  fixtureId: string;
  title?: string;
}

interface PlayResponse {
  ok: boolean;
  stream?: {
    type: "emby" | "hls" | "none";
    itemId?: string;
    url?: string;
  };
  error?: string;
}

export default function EmbyPlayer({
  fixtureId,
  title,
}: EmbyPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [status, setStatus] = useState("Resolving stream...");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveStream() {
      try {
        setStatus("Resolving stream...");

        const response = await fetch(
          `/api/emby/play/${encodeURIComponent(fixtureId)}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Playback API returned ${response.status}`
          );
        }

        const data =
          (await response.json()) as PlayResponse;

        if (!data.ok || !data.stream) {
          throw new Error(
            data.error || "No stream returned"
          );
        }

        if (
          data.stream.type === "emby" &&
          data.stream.itemId
        ) {
          const itemId = data.stream.itemId;

          // Browser-safe proxy.
          // The Emby API key stays on the server.
          const safeUrl =
            `/api/emby/test-stream/${encodeURIComponent(
              itemId
            )}`;

          if (!cancelled) {
            setVideoUrl(safeUrl);
            setStatus(
              `Emby item ${itemId} ready`
            );
          }

          return;
        }

        if (
          data.stream.type === "hls" &&
          data.stream.url
        ) {
          if (!cancelled) {
            setVideoUrl(data.stream.url);
            setStatus("HLS stream ready");
          }

          return;
        }

        if (!cancelled) {
          setStatus("No stream available");
        }
      } catch (error) {
        console.error(
          "Failed to resolve match stream:",
          error
        );

        if (!cancelled) {
          setStatus("Unable to load stream");
        }
      }
    }

    resolveStream();

    return () => {
      cancelled = true;
    };
  }, [fixtureId]);

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
      console.error(
        "Video playback error:",
        video.error
      );

      setStatus("Playback error");
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
  }, [videoUrl]);

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-black">
      {videoUrl ? (
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          className="aspect-video h-auto w-full bg-black"
          src={videoUrl}
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-black">
          <div className="text-center">
            <div className="text-4xl">
              ⚽
            </div>

            <p className="mt-3 text-sm font-bold text-white">
              {status}
            </p>
          </div>
        </div>
      )}

      <div className="border-t border-white/10 bg-[#0d1118] px-4 py-3">
        {title && (
          <p className="text-sm font-bold text-white">
            {title}
          </p>
        )}

        <p className="mt-1 text-xs text-gray-500">
          {status}
        </p>
      </div>
    </div>
  );
}