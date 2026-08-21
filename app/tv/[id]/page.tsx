import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Genre {
  id: number;
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
  genres: Genre[];
}

interface RecommendedShow {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
}

interface RecommendationsResponse {
  results: RecommendedShow[];
}

/* =========================================================
   RECOMMENDED TV CARD
   ========================================================= */

function RecommendedTVCard({
  show,
}: {
  show: RecommendedShow;
}) {
  return (
    <Link
      href={`/tv/${show.id}`}
      className="
        tv-focus
        group
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
            {show.first_air_date
              ? show.first_air_date.slice(0, 4)
              : "N/A"}
          </span>

          {show.vote_average > 0 && (
            <span className="text-green-400">
              ★ {show.vote_average.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   TV DETAILS PAGE
   ========================================================= */

export default async function TVDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return (
      <main className="min-h-screen bg-[#07090d] p-6 text-white">
        <h1 className="text-2xl font-bold">
          TV Show
        </h1>

        <p className="mt-3 text-gray-400">
          TMDB_API_KEY is not configured.
        </p>
      </main>
    );
  }

  /* =======================================================
     FETCH TV SHOW
     ======================================================= */

  let show: TVShow;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${encodeURIComponent(
        id
      )}?api_key=${encodeURIComponent(
        apiKey
      )}&language=en-US`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!res.ok) {
      return (
        <main className="min-h-screen bg-[#07090d] p-6 text-white">
          <h1 className="text-2xl font-bold">
            TV Show not found
          </h1>

          <Link
            href="/tv"
            className="
              tv-focus
              mt-5
              inline-flex
              min-h-[48px]
              items-center
              rounded-xl
              border
              border-white/10
              bg-[#0d1118]
              px-5
              py-3
              text-green-400
            "
          >
            ← Back to TV Shows
          </Link>
        </main>
      );
    }

    show = await res.json();
  } catch (error) {
    console.error("TMDB TV Details Error:", error);

    return (
      <main className="min-h-screen bg-[#07090d] p-6 text-white">
        <h1 className="text-2xl font-bold">
          Unable to load TV show
        </h1>

        <p className="mt-3 text-gray-400">
          TMDB could not load this TV show right now.
        </p>

        <Link
          href="/tv"
          className="
            tv-focus
            mt-5
            inline-flex
            min-h-[48px]
            items-center
            rounded-xl
            border
            border-white/10
            bg-[#0d1118]
            px-5
            py-3
            text-green-400
          "
        >
          ← Back to TV Shows
        </Link>
      </main>
    );
  }

  /* =======================================================
     FETCH RECOMMENDED TV SHOWS
     ======================================================= */

  let recommendations: RecommendedShow[] = [];

  try {
    const recommendationsRes = await fetch(
      `https://api.themoviedb.org/3/tv/${encodeURIComponent(
        id
      )}/recommendations?api_key=${encodeURIComponent(
        apiKey
      )}&language=en-US&page=1`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (recommendationsRes.ok) {
      const data: RecommendationsResponse =
        await recommendationsRes.json();

      recommendations = data.results || [];
    }
  } catch (error) {
    console.error(
      "TMDB TV Recommendations Error:",
      error
    );
  }

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <main className="min-h-screen bg-[#07090d] text-white">

      {/* =================================================
          HERO / BACKDROP
          ================================================= */}

      <section
        className="
          relative
          min-h-[560px]
          overflow-hidden
        "
        style={{
          backgroundImage: show.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${show.backdrop_path})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay */}

        <div className="absolute inset-0 bg-black/75" />

        {/* Bottom fade */}

        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07090d] to-transparent" />

        <div
          className="
            relative
            z-10
            mx-auto
            flex
            min-h-[560px]
            max-w-7xl
            items-end
            px-4
            py-10
            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              flex
              w-full
              flex-col
              gap-8
              md:flex-row
              md:items-end
            "
          >

            {/* =================================================
                POSTER
                ================================================= */}

            <div
              className="
                w-40
                shrink-0
                overflow-hidden
                rounded-xl
                border
                border-white/10
                bg-[#121821]
                shadow-2xl
                sm:w-48
                md:w-52
              "
            >
              {show.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                  alt={show.name}
                  className="h-auto w-full object-cover"
                />
              ) : (
                <div className="aspect-[2/3] flex items-center justify-center text-sm text-gray-500">
                  No Poster
                </div>
              )}
            </div>

            {/* =================================================
                DETAILS
                ================================================= */}

            <div className="max-w-3xl">

              {/* Back */}

              <Link
                href="/tv"
                className="
                  tv-focus
                  mb-5
                  inline-flex
                  min-h-[48px]
                  items-center
                  rounded-xl
                  border
                  border-white/10
                  bg-[#0d1118]/80
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-gray-300
                  transition
                  hover:border-green-500/40
                  hover:bg-[#121821]
                  focus:outline-none
                "
              >
                ← Back to TV Shows
              </Link>

              {/* Title */}

              <h1
                className="
                  text-3xl
                  font-bold
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                {show.name}
              </h1>

              {/* Metadata */}

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  items-center
                  gap-3
                  text-sm
                  text-gray-300
                "
              >
                <span>
                  {show.first_air_date
                    ? show.first_air_date.slice(0, 4)
                    : "N/A"}
                </span>

                <span>•</span>

                <span className="text-green-400">
                  ★{" "}
                  {typeof show.vote_average === "number"
                    ? show.vote_average.toFixed(1)
                    : "N/A"}
                </span>
              </div>

              {/* Genres */}

              {show.genres?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {show.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="
                        rounded-full
                        border
                        border-white/10
                        bg-white/5
                        px-3
                        py-1
                        text-xs
                        text-gray-300
                      "
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}

              <p
                className="
                  mt-5
                  max-w-2xl
                  text-sm
                  leading-6
                  text-gray-300
                  sm:text-base
                "
              >
                {show.overview ||
                  "No description available."}
              </p>

              {/* =================================================
                  WATCH NOW
                  ================================================= */}

              <div className="mt-7">
                <Link
                  href={`/watch-tv/${show.id}`}
                  className="
                    tv-focus
                    inline-flex
                    min-h-[52px]
                    items-center
                    justify-center
                    rounded-xl
                    bg-green-500
                    px-7
                    font-bold
                    text-black
                    transition
                    hover:bg-green-400
                    focus:outline-none
                  "
                >
                  ▶ Watch Now
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          RECOMMENDED TV SHOWS
          ================================================= */}

      {recommendations.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          <div className="mb-5">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Recommended TV Shows
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              More series you might enjoy
            </p>
          </div>

          <div
            className="
              flex
              gap-4
              overflow-x-auto
              pb-4
              scrollbar-hide
            "
          >
            {recommendations.map((recommended) => (
              <RecommendedTVCard
                key={recommended.id}
                show={recommended}
              />
            ))}
          </div>

        </section>
      )}

    </main>
  );
}