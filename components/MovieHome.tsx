"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MovieSearch from "@/components/MovieSearch";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  original_language?: string;
}

interface MovieHomeProps {
  trending: Movie[];
  horror: Movie[];
  animated: Movie[];
  hollywood: Movie[];
  marvel: Movie[];
}

interface ContinueWatchingMovie {
  id: number;
  title: string;
  poster_path: string | null;
  progress?: number;
}

function MovieCard({
  movie,
}: {
  movie: Movie | ContinueWatchingMovie;
}) {
  const releaseDate =
    "release_date" in movie ? movie.release_date : "";

  const rating =
    "vote_average" in movie ? movie.vote_average : 0;

  return (
    <Link
      href={`/movie/${movie.id}`}
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
      <div className="aspect-[2/3] overflow-hidden bg-[#121821]">
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
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

      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-white">
          {movie.title}
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

function MovieRow({
  title,
  movies,
}: {
  title: string;
  movies: (Movie | ContinueWatchingMovie)[];
}) {
  if (!movies.length) {
    return null;
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
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
          />
        ))}
      </div>
    </section>
  );
}

export default function MovieHome({
  trending,
  horror,
  animated,
  hollywood,
  marvel,
}: MovieHomeProps) {
  const [continueWatching, setContinueWatching] =
    useState<ContinueWatchingMovie[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        "continueWatching"
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
      {/* Header */}
      <section className="px-4 pb-6 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Movies
          </h1>

          <p className="mt-2 text-sm text-gray-400">
  Watch movies, discover new releases and explore
  your favorites.
</p>

{/* Movie Search */}
<div className="mt-3">
  <MovieSearch />
</div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
{/* Continue Watching */}
{continueWatching.length > 0 ? (
  <MovieRow
    title="Continue Watching"
    movies={continueWatching}
  />
) : (
  <section className="mb-10">
    <div className="mb-4">
      <p className="text-sm text-gray-400">
        No movies in Continue Watching yet
      </p>
    </div>
  </section>
)}

        {/* Trending */}
        <MovieRow
          title="Trending Movies"
          movies={trending}
        />

        {/* Horror */}
        <MovieRow
          title="Top Horror Movies"
          movies={horror}
        />

        {/* Animation */}
        <MovieRow
          title="Animated Movies"
          movies={animated}
        />

        {/* Hollywood */}
        <MovieRow
          title="Hollywood Movies"
          movies={hollywood}
        />

        {/* Marvel */}
        <MovieRow
          title="Marvel Collection"
          movies={marvel}
        />
      </div>
    </main>
  );
}