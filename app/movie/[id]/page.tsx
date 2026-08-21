import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Movie {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres?: {
    id: number;
    name: string;
  }[];
}

interface MovieListItem {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

interface TMDBResponse {
  results?: MovieListItem[];
}

export default async function MovieDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return (
      <main className="min-h-screen bg-[#07090d] p-6 text-white">
        <h1 className="text-2xl font-bold">Movies</h1>

        <p className="mt-3 text-gray-400">
          TMDB_API_KEY is not configured.
        </p>
      </main>
    );
  }

  /* =====================================================
     MOVIE DETAILS
     ===================================================== */

  let movie: Movie;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${encodeURIComponent(
        id
      )}?api_key=${encodeURIComponent(apiKey)}&language=en-US`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`TMDB movie request failed: ${res.status}`);
    }

    movie = await res.json();
  } catch (error) {
    console.error("Movie details error:", error);

    return (
      <main className="min-h-screen bg-[#07090d] p-6 text-white">
        <h1 className="text-2xl font-bold">
          Unable to load movie
        </h1>

        <p className="mt-3 text-gray-400">
          TMDB could not load this movie right now.
        </p>

        <Link
          href="/movie"
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
          ← Back to Movies
        </Link>
      </main>
    );
  }

  /* =====================================================
     RECOMMENDED MOVIES
     ===================================================== */

  let recommendedMovies: MovieListItem[] = [];

  try {
    const recommendedRes = await fetch(
      `https://api.themoviedb.org/3/movie/${encodeURIComponent(
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

    if (recommendedRes.ok) {
      const data: TMDBResponse =
        await recommendedRes.json();

      recommendedMovies = Array.isArray(data.results)
        ? data.results
            .filter((item) => item.id !== movie.id)
            .slice(0, 12)
        : [];
    }
  } catch (error) {
    console.error("Recommended movies error:", error);

    // Recommendations are optional.
    // The movie page will still work.
    recommendedMovies = [];
  }

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section
        className="
          relative
          min-h-[520px]
          overflow-hidden
        "
        style={{
          backgroundImage: movie.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70" />

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-48
            bg-gradient-to-t
            from-[#07090d]
            to-transparent
          "
        />

        <div
          className="
            relative
            z-10
            mx-auto
            flex
            min-h-[520px]
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
            {/* Poster */}

            <div
              className="
                w-40
                shrink-0
                overflow-hidden
                rounded-xl
                border
                border-white/10
                shadow-2xl
                sm:w-48
              "
            >
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="h-auto w-full object-cover"
                />
              ) : (
                <div
                  className="
                    flex
                    aspect-[2/3]
                    items-center
                    justify-center
                    bg-[#121821]
                    text-gray-500
                  "
                >
                  No Poster
                </div>
              )}
            </div>

            {/* Details */}

            <div className="max-w-3xl">
              <Link
                href="/movie"
                className="
                  tv-focus
                  mb-5
                  inline-flex
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  text-gray-300
                "
              >
                ← Back to Movies
              </Link>

              <h1
                className="
                  text-3xl
                  font-bold
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                {movie.title}
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
                  {movie.release_date
                    ? movie.release_date.slice(0, 4)
                    : "N/A"}
                </span>

                <span>•</span>

                <span>
                  {movie.runtime
                    ? `${movie.runtime} min`
                    : "Runtime N/A"}
                </span>

                <span>•</span>

                <span className="text-green-400">
                  ★{" "}
                  {typeof movie.vote_average === "number"
                    ? movie.vote_average.toFixed(1)
                    : "N/A"}
                </span>
              </div>

              {/* Genres */}

              {movie.genres &&
                movie.genres.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
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

              {/* Overview */}

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
                {movie.overview ||
                  "No description available."}
              </p>

              {/* Watch Movie */}

              <div className="mt-7">
                <Link
                  href={`/watch/${movie.id}`}
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
                  ▶ Watch Movie
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          RECOMMENDED MOVIES
          ===================================================== */}

      {recommendedMovies.length > 0 && (
        <section
          className="
            mx-auto
            max-w-7xl
            px-4
            py-10
            sm:px-6
            lg:px-8
          "
        >
          <div className="mb-5">
            <h2 className="text-2xl font-bold">
              Recommended Movies
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Movies you may also like
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-4
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              xl:grid-cols-6
            "
          >
            {recommendedMovies.map((recommended) => (
              <Link
                key={recommended.id}
                href={`/movie/${recommended.id}`}
                className="
                  tv-focus
                  group
                  overflow-hidden
                  rounded-xl
                  border
                  border-white/10
                  bg-[#0d1118]
                  transition
                  hover:border-green-500/40
                  hover:bg-[#121821]
                "
              >
                {/* Poster */}

                <div
                  className="
                    aspect-[2/3]
                    overflow-hidden
                    bg-[#121821]
                  "
                >
                  {recommended.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${recommended.poster_path}`}
                      alt={recommended.title}
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
                    <div
                      className="
                        flex
                        h-full
                        items-center
                        justify-center
                        text-sm
                        text-gray-500
                      "
                    >
                      No Poster
                    </div>
                  )}
                </div>

                {/* Movie info */}

                <div className="p-3">
                  <h3
                    className="
                      truncate
                      text-sm
                      font-semibold
                    "
                  >
                    {recommended.title}
                  </h3>

                  <div
                    className="
                      mt-2
                      flex
                      items-center
                      justify-between
                      text-xs
                      text-gray-400
                    "
                  >
                    <span>
                      {recommended.release_date
                        ? recommended.release_date.slice(0, 4)
                        : "N/A"}
                    </span>

                    <span className="text-green-400">
                      ★{" "}
                      {typeof recommended.vote_average ===
                      "number"
                        ? recommended.vote_average.toFixed(1)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}