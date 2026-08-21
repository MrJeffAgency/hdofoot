"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  overview: string;
  still_path: string | null;
  vote_average: number;
}

interface Season {
  season_number: number;
  episode_count: number;
  name: string;
}

interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genres: {
    id: number;
    name: string;
  }[];
  number_of_seasons: number;
  seasons?: Season[];
}

interface ContinueWatchingTV {
  id: number;
  name: string;
  poster_path: string | null;
  progress?: number;
  season?: number;
  episode?: number;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WatchTVPage({
  params,
}: PageProps) {
  const [id, setId] = useState("");
  const [show, setShow] = useState<TVShow | null>(null);

  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  /* =====================================================
     GET TV SHOW ID
     ===================================================== */

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
    });
  }, [params]);

  /* =====================================================
     LOAD TV SHOW
     ===================================================== */

  useEffect(() => {
    if (!id) return;

    async function loadShow() {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/tv/${encodeURIComponent(id)}`
        );

        if (!res.ok) {
          let errorMessage = "Unknown API error";

          try {
            const data = await res.json();

            errorMessage =
              data?.error ||
              data?.message ||
              JSON.stringify(data);
          } catch {
            try {
              errorMessage = await res.text();
            } catch {
              errorMessage =
                "Unable to read error response";
            }
          }

          throw new Error(
            `TV API Error ${res.status}: ${errorMessage}`
          );
        }

        const data: TVShow = await res.json();

        if (!data || !data.id) {
          throw new Error(
            "TV API Error 200: Response did not contain a valid TV show"
          );
        }

        setShow(data);
        setSeason(1);
        setEpisode(1);
      } catch (error) {
        console.error(
          "TV watch page load error:",
          error
        );

        setShow(null);
      } finally {
        setLoading(false);
      }
    }

    loadShow();
  }, [id]);

  /* =====================================================
     LOAD REAL EPISODES FOR SELECTED SEASON
     ===================================================== */

  useEffect(() => {
    if (!id || !season) return;

    let cancelled = false;

    async function loadEpisodes() {
      setEpisodesLoading(true);

      try {
        const res = await fetch(
          `/api/tv/${encodeURIComponent(
            id
          )}/season/${season}`
        );

        if (!res.ok) {
          let errorMessage =
            "Unknown episode API error";

          try {
            const data = await res.json();

            errorMessage =
              data?.error ||
              data?.message ||
              JSON.stringify(data);
          } catch {
            try {
              errorMessage = await res.text();
            } catch {
              errorMessage =
                "Unable to read episode error response";
            }
          }

          throw new Error(
            `TV Season API Error ${res.status}: ${errorMessage}`
          );
        }

        const data = await res.json();

        console.log(
          "TMDB SEASON RESPONSE:",
          data
        );

        console.log(
          "EPISODE NUMBERS FROM API:",
          Array.isArray(data?.episodes)
            ? data.episodes.map(
                (item: Episode) =>
                  item.episode_number
              )
            : []
        );

        if (cancelled) return;

        /*
         * ONLY use episodes returned by TMDB.
         */
        const realEpisodes: Episode[] =
          Array.isArray(data?.episodes)
            ? data.episodes
            : [];

        const sortedEpisodes = realEpisodes
          .filter(
            (item) =>
              Number.isInteger(
                item.episode_number
              ) &&
              item.episode_number > 0
          )
          .sort(
            (a, b) =>
              a.episode_number -
              b.episode_number
          );

        setEpisodes(sortedEpisodes);

        /*
         * Select the first real episode if
         * the current episode does not exist.
         */
        if (sortedEpisodes.length > 0) {
          const currentExists =
            sortedEpisodes.some(
              (item) =>
                item.episode_number === episode
            );

          if (!currentExists) {
            setEpisode(
              sortedEpisodes[0].episode_number
            );
          }
        } else {
          setEpisode(1);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "TV episode load error:",
            error
          );

          setEpisodes([]);
          setEpisode(1);
        }
      } finally {
        if (!cancelled) {
          setEpisodesLoading(false);
        }
      }
    }

    loadEpisodes();

    return () => {
      cancelled = true;
    };
  }, [id, season]);

  /* =====================================================
     CONTINUE WATCHING TV
     ===================================================== */

  useEffect(() => {
    if (!show || episodes.length === 0) return;

    const episodeExists = episodes.some(
      (item) =>
        item.episode_number === episode
    );

    if (!episodeExists) return;

    try {
      const stored = localStorage.getItem(
        "continueWatchingTV"
      );

      let items: ContinueWatchingTV[] = [];

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          items = parsed;
        }
      }

      const newItem: ContinueWatchingTV = {
        id: show.id,
        name: show.name,
        poster_path: show.poster_path,
        progress: 0,
        season,
        episode,
      };

      items = items.filter(
        (item) => item.id !== show.id
      );

      items.unshift(newItem);

      items = items.slice(0, 20);

      localStorage.setItem(
        "continueWatchingTV",
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        "Continue Watching TV save error:",
        error
      );
    }
  }, [
    show,
    season,
    episode,
    episodes,
  ]);

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07090d] p-6 text-white">
        <h1 className="text-2xl font-bold">
          Loading TV show...
        </h1>
      </main>
    );
  }

  /* =====================================================
     ERROR
     ===================================================== */

  if (!show) {
    return (
      <main className="min-h-screen bg-[#07090d] p-6 text-white">
        <h1 className="text-2xl font-bold">
          TV show not found
        </h1>

        <p className="mt-3 text-sm text-gray-400">
          Check the browser console for the exact API
          error.
        </p>

        <Link
          href="/tv"
          className="
            tv-focus
            mt-5
            inline-flex
            min-h-[52px]
            items-center
            rounded-xl
            border
            border-white/10
            bg-[#0d1118]
            px-6
            py-3
            font-semibold
            text-white
            transition
            hover:border-green-500/40
            focus:outline-none
          "
        >
          ← Back to TV Shows
        </Link>
      </main>
    );
  }

  /* =====================================================
     CURRENT EPISODE
     ===================================================== */

  const currentEpisode = episodes.find(
    (item) =>
      item.episode_number === episode
  );

  /* =====================================================
     VIDSRC PLAYER
     ===================================================== */

  const playerUrl =
    `https://vidsrc.to/embed/tv/${show.id}/${season}/${episode}`;

  return (
    <main className="min-h-screen bg-[#07090d] text-white">

      {/* =================================================
          PLAYER
          ================================================= */}

      <section className="w-full bg-black">
        <div
          className="
            relative
            mx-auto
            aspect-video
            w-full
            max-w-[1600px]
            overflow-hidden
          "
        >
          <iframe
            key={playerUrl}
            src={playerUrl}
            title={`Watch ${show.name}`}
            className="
              absolute
              inset-0
              h-full
              w-full
              border-0
            "
            allow="
              autoplay;
              fullscreen;
              picture-in-picture;
              encrypted-media;
            "
            allowFullScreen
            referrerPolicy="origin"
          />
        </div>
      </section>

      {/* =================================================
          INFORMATION
          ================================================= */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          py-8
          sm:px-6
          lg:px-8
        "
      >

        {/* =================================================
            BACK TO TV SHOW
            ================================================= */}

        <Link
          href={`/tv/${show.id}`}
          className="
            tv-focus
            relative
            z-20
            inline-flex
            min-h-[52px]
            items-center
            justify-center
            rounded-xl
            border
            border-white/10
            bg-[#0d1118]
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:border-green-500/40
            hover:bg-[#121821]
            focus:outline-none
          "
        >
          ← Back to TV Show
        </Link>

        {/* =================================================
            SEASON / EPISODE
            ================================================= */}

        <div
          className="
            mt-7
            rounded-xl
            border
            border-white/10
            bg-[#0d1118]
            p-4
          "
        >
          <div className="flex flex-wrap gap-4">

            {/* =================================================
                SEASON
                ================================================= */}

            <div>
              <label
                htmlFor="season"
                className="
                  mb-2
                  block
                  text-sm
                  text-gray-400
                "
              >
                Season
              </label>

              <select
                id="season"
                value={season}
                onChange={(e) => {
                  const nextSeason =
                    Number(e.target.value);

                  setSeason(nextSeason);

                  /*
                   * Clear the old episode while
                   * the new season is loading.
                   */
                  setEpisode(1);
                  setEpisodes([]);
                }}
                className="
                  tv-focus
                  min-h-[48px]
                  rounded-lg
                  border
                  border-white/10
                  bg-[#07090d]
                  px-4
                  text-white
                  outline-none
                "
              >
                {Array.from(
                  {
                    length: Math.max(
                      show.number_of_seasons,
                      1
                    ),
                  },
                  (_, index) =>
                    index + 1
                ).map((value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    Season {value}
                  </option>
                ))}
              </select>
            </div>

            {/* =================================================
                EPISODE
                ================================================= */}

            <div>
              <label
                htmlFor="episode"
                className="
                  mb-2
                  block
                  text-sm
                  text-gray-400
                "
              >
                Episode
              </label>

              <select
                id="episode"
                value={
                  currentEpisode
                    ? currentEpisode.episode_number
                    : ""
                }
                disabled={
                  episodesLoading ||
                  episodes.length === 0
                }
                onChange={(e) => {
                  setEpisode(
                    Number(e.target.value)
                  );
                }}
                className="
                  tv-focus
                  min-h-[48px]
                  min-w-[220px]
                  rounded-lg
                  border
                  border-white/10
                  bg-[#07090d]
                  px-4
                  text-white
                  outline-none
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {episodesLoading ? (
                  <option value="">
                    Loading episodes...
                  </option>
                ) : episodes.length === 0 ? (
                  <option value="">
                    No episodes available
                  </option>
                ) : (
                  episodes.map((item) => (
                    <option
                      key={item.id}
                      value={item.episode_number}
                    >
                      Episode{" "}
                      {item.episode_number}
                      {item.name
                        ? ` — ${item.name}`
                        : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* =================================================
              EPISODE METADATA
              ================================================= */}

          {currentEpisode && (
            <div className="mt-5 border-t border-white/10 pt-4">

              <h2 className="text-base font-semibold text-white">
                Episode{" "}
                {currentEpisode.episode_number}
                {currentEpisode.name
                  ? ` — ${currentEpisode.name}`
                  : ""}
              </h2>

              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">

                {currentEpisode.air_date && (
                  <span>
                    {currentEpisode.air_date}
                  </span>
                )}

                {currentEpisode.vote_average >
                  0 && (
                  <>
                    <span>•</span>

                    <span className="text-green-400">
                      ★{" "}
                      {currentEpisode.vote_average.toFixed(
                        1
                      )}
                    </span>
                  </>
                )}
              </div>

              {currentEpisode.overview && (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
                  {currentEpisode.overview}
                </p>
              )}
            </div>
          )}
        </div>

        {/* =================================================
            TITLE
            ================================================= */}

        <div className="mt-7">

          <h1
            className="
              text-2xl
              font-bold
              sm:text-3xl
              lg:text-4xl
            "
          >
            {show.name}
          </h1>

          <div
            className="
              mt-3
              flex
              flex-wrap
              items-center
              gap-3
              text-sm
              text-gray-400
            "
          >
            <span>
              {show.first_air_date
                ? show.first_air_date.slice(
                    0,
                    4
                  )
                : "N/A"}
            </span>

            <span>•</span>

            <span>
              Season {season}, Episode{" "}
              {episode}
            </span>

            <span>•</span>

            <span className="text-green-400">
              ★{" "}
              {typeof show.vote_average ===
              "number"
                ? show.vote_average.toFixed(
                    1
                  )
                : "N/A"}
            </span>
          </div>

          <p
            className="
              mt-5
              max-w-3xl
              text-sm
              leading-6
              text-gray-400
              sm:text-base
            "
          >
            {show.overview ||
              "No description available."}
          </p>

        </div>
      </section>
    </main>
  );
}