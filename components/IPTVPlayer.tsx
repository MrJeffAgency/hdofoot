"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface IPTVPlayerProps {
  url: string;
  title: string;
}

export default function IPTVPlayer({
  url,
  title,
}: IPTVPlayerProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const hlsRef =
    useRef<Hls | null>(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [started, setStarted] =
    useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    let destroyed = false;
    let hls: Hls | null = null;

    setError("");
    setLoading(true);
    setStarted(false);

    /*
     * Clean up any previous HLS instance.
     */
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    /*
     * Basic video configuration.
     */
    video.controls = true;
    video.playsInline = true;
    video.autoplay = true;
    video.muted = true;

    /*
     * ---------------------------------------------------------
     * NATIVE HLS
     * ---------------------------------------------------------
     *
     * Safari, iOS and some Android/TV browsers can play HLS
     * without HLS.js.
     */
    const nativeHls =
      video.canPlayType(
        "application/vnd.apple.mpegurl"
      );

    if (nativeHls) {
      video.src = url;

      const handleLoadedMetadata = () => {
        if (destroyed) return;

        setLoading(false);
        setError("");

        video
          .play()
          .then(() => {
            if (!destroyed) {
              setStarted(true);
            }
          })
          .catch(() => {
            /*
             * Autoplay may be blocked.
             * Controls are still available.
             */
          });
      };

      const handlePlaying = () => {
        if (destroyed) return;

        setLoading(false);
        setError("");
        setStarted(true);
      };

      const handleWaiting = () => {
        if (destroyed) return;

        setLoading(true);
      };

      const handleError = () => {
        if (destroyed) return;

        setLoading(false);
        setError(
          "This channel could not be played by the browser."
        );
      };

      video.addEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      video.addEventListener(
        "playing",
        handlePlaying
      );

      video.addEventListener(
        "waiting",
        handleWaiting
      );

      video.addEventListener(
        "error",
        handleError
      );

      return () => {
        destroyed = true;

        video.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );

        video.removeEventListener(
          "playing",
          handlePlaying
        );

        video.removeEventListener(
          "waiting",
          handleWaiting
        );

        video.removeEventListener(
          "error",
          handleError
        );

        video.pause();
        video.removeAttribute("src");
        video.load();
      };
    }

    /*
     * ---------------------------------------------------------
     * HLS.JS
     * ---------------------------------------------------------
     */
    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,

        /*
         * More forgiving settings for IPTV.
         */
        lowLatencyMode: false,

        backBufferLength: 30,

        manifestLoadingTimeOut: 15000,
        manifestLoadingMaxRetry: 3,
        manifestLoadingRetryDelay: 1000,

        levelLoadingTimeOut: 15000,
        levelLoadingMaxRetry: 3,
        levelLoadingRetryDelay: 1000,

        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 3,
        fragLoadingRetryDelay: 1000,
      });

      hlsRef.current = hls;

      /*
       * Load the playlist.
       */
      hls.loadSource(url);
      hls.attachMedia(video);

      /*
       * Manifest successfully loaded.
       */
      hls.on(
        Hls.Events.MANIFEST_PARSED,
        () => {
          if (destroyed) return;

          setLoading(false);
          setError("");

          video
            .play()
            .then(() => {
              if (!destroyed) {
                setStarted(true);
              }
            })
            .catch(() => {
              /*
               * Browser may block autoplay.
               */
            });
        }
      );

      /*
       * Playback actually started.
       */
      hls.on(
        Hls.Events.FRAG_BUFFERED,
        () => {
          if (destroyed) return;

          setLoading(false);
          setError("");
        }
      );

      video.addEventListener(
        "playing",
        () => {
          if (destroyed) return;

          setLoading(false);
          setError("");
          setStarted(true);
        }
      );

      /*
       * HLS errors.
       */
      hls.on(
        Hls.Events.ERROR,
        (_, data) => {
          if (destroyed) return;

          console.error(
            "IPTV HLS error:",
            data
          );

          /*
           * Try recovery before giving up.
           */
          if (
            data.fatal &&
            data.type ===
              Hls.ErrorTypes.NETWORK_ERROR
          ) {
            console.log(
              "Recovering IPTV network error..."
            );

            hls?.startLoad();

            return;
          }

          if (
            data.fatal &&
            data.type ===
              Hls.ErrorTypes.MEDIA_ERROR
          ) {
            console.log(
              "Recovering IPTV media error..."
            );

            hls?.recoverMediaError();

            return;
          }

          /*
           * Unknown fatal error.
           */
          if (data.fatal) {
            setLoading(false);

            setError(
              "Unable to play this channel."
            );

            hls?.destroy();
            hls = null;
            hlsRef.current = null;
          }
        }
      );

      return () => {
        destroyed = true;

        hls?.destroy();
        hls = null;
        hlsRef.current = null;

        video.pause();
        video.removeAttribute("src");
        video.load();
      };
    }

    /*
     * Device doesn't support HLS.
     */
    setLoading(false);

    setError(
      "This device does not support HLS playback."
    );

    return () => {
      destroyed = true;
    };
  }, [url]);

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-black
        shadow-2xl
      "
    >
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          controls
          playsInline
          autoPlay
          muted
          preload="auto"
          className="
            h-full
            w-full
            bg-black
            object-contain
          "
          aria-label={title}
        />

        {loading && !error && (
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-black/40
            "
          >
            <div className="text-center">
              <div
                className="
                  mx-auto
                  mb-3
                  h-8
                  w-8
                  animate-spin
                  rounded-full
                  border-2
                  border-white/20
                  border-t-green-400
                "
              />

              <p className="text-sm text-gray-300">
                Loading {title}...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-black/80
              p-6
              text-center
            "
          >
            <div>
              <div className="mb-3 text-4xl">
                📺
              </div>

              <h2 className="font-bold">
                Channel unavailable
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                {error}
              </p>

              <p className="mt-3 break-all text-xs text-gray-600">
                {url}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}