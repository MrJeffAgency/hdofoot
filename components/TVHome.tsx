"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TVSearch from "@/components/TVSearch";

interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  original_language?: string;
}

interface TVHomeProps {
  trending: TVShow[];
  action: TVShow[];
  usShows: TVShow[];
  animated: TVShow[];
  newReleases: TVShow[];
  topPicks: TVShow[];
  kids: TVShow[];
}

interface ContinueWatchingTV {
  id: number;
  name: string;
  poster_path: string | null;
  progress?: number;
}

/* =========================================================
   TV CARD
   ========================================================= */

function TVCard({
  show,
}: {
  show: TVShow | ContinueWatchingTV;
}) {
  const releaseDate =
    "first_air_date" in show
      ? show.first_air_date
      : "";

  const rating =
    "vote_average" in show
      ? show.vote_average
      : 0;

  return (
    <Link
      href={`/tv/${show.id}`}
      className="
        tv-focus
        group
        relative
        block
        w-[140px]
        shrink-0
        overflow-hidden
        rounded-xl
        border
        border-white/10
        bg-[#0d1118]
        transition
        duration-200
        hover:border-green-500/40
        hover:bg-[#121821]
        sm:w-[160px]
        md:w-[175px]
        lg:w-[185px]
      "
    >
      {/* Poster */}

      <div className="aspect-[2/3] overflow-hidden bg-[#121821]">
        {show.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
            alt={show.name}
            className="
              h-full
              w-full
              object-cover
              transition
              duration-300
              group-hover:scale-105
            "
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-500">
            No Poster
          </div>
        )}
      </div>

      {/* Information */}

      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-white">
          {show.name}
        </h3>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
          <span>
            {releaseDate
              ? releaseDate.slice(0, 4)
              : ""}
          </span>

          {rating > 0 && (
            <span className="text-green-400">
              ★ {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   TV ROW
   ========================================================= */

function TVRow({
  title,
  shows,
}: {
  title: string;
  shows: TVShow[];
}) {
  /*
   * Keep the section visible even when TMDB
   * returns no results.
   */

  if (!shows.length) {
    return (
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-white sm:text-2xl">
          {title}
        </h2>

        <p className="text-sm text-gray-400">
          No series available right now.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          {title}
        </h2>
      </div>

      <div
        className="
          flex
          gap-4
          overflow-x-auto
          pb-3
          scrollbar-hide
        "
      >
        {shows.map((show) => (
          <TVCard
            key={show.id}
            show={show}
          />
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   TV HOME
   ========================================================= */

export default function TVHome({
  trending,
  action,
  usShows,
  animated,
  newReleases,
  topPicks,
  kids,
}: TVHomeProps) {
  const [continueWatching, setContinueWatching] =
    useState<ContinueWatchingTV[]>([]);

  /* =======================================================
     CONTINUE WATCHING
     ======================================================= */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        "continueWatchingTV"
      );

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setContinueWatching(parsed);
      }
    } catch {
      setContinueWatching([]);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#07090d] text-white">

      {/* =================================================
          HEADER
          ================================================= */}

      <section className="px-4 pb-6 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <h1 className="text-3xl font-bold sm:text-4xl">
            TV Shows
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Watch TV shows, discover new series and
            explore your favorites.
          </p>

          {/* TV Search */}

          <div className="mt-3">
            <TVSearch />
          </div>

        </div>
      </section>

      {/* =================================================
          CONTENT
          ================================================= */}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =================================================
            CONTINUE WATCHING TV SHOWS
            ================================================= */}

        {continueWatching.length > 0 ? (
          <TVRow
            title="Continue Watching TV Shows"
            shows={continueWatching}
          />
        ) : (
          <section className="mb-10">
            <div className="mb-4">
              <p className="text-sm text-gray-400">
                No TV shows in Continue Watching yet
              </p>
            </div>
          </section>
        )}

        {/* =================================================
            TRENDING SERIES
            ================================================= */}

        <TVRow
          title="Trending Series"
          shows={trending}
        />

        {/* =================================================
            ACTION SERIES
            ================================================= */}

        <TVRow
          title="Action Series"
          shows={action}
        />

        {/* =================================================
            US TV SHOWS
            ================================================= */}

        <TVRow
          title="US TV Shows"
          shows={usShows}
        />

        {/* =================================================
            ANIMATED TV SHOWS
            ================================================= */}

        <TVRow
          title="Animated TV Shows"
          shows={animated}
        />

        {/* =================================================
            NEW RELEASES
            ================================================= */}

        <TVRow
          title="New Releases TV Shows"
          shows={newReleases}
        />

        {/* =================================================
            TOP PICKS
            ================================================= */}

        <TVRow
          title="Top Picks TV Shows"
          shows={topPicks}
        />

        {/* =================================================
            KIDS TV SHOWS
            ================================================= */}

        <TVRow
          title="Kids TV Shows"
          shows={kids}
        />

      </div>
    </main>
  );
}