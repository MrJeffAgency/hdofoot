import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

interface TMDBResponse {
  results: Movie[];
  total_results: number;
}

export default async function MovieSearchPage({
  searchParams,
}: PageProps) {
  const { q } = await searchParams;

  const query = q?.trim() || "";
  const apiKey = process.env.TMDB_API_KEY;

  // No search query
  if (!query) {
    return (
      <main className="min-h-screen bg-[#07090d] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/movie"
            className="
              tv-focus
              inline-flex
              min-h-[48px]
              items-center
              rounded-xl
              px-4
              text-sm
              font-semibold
              text-gray-300
            "
          >
            ← Back to Movies
          </Link>

          <h1 className="mt-8 text-3xl font-bold">
            Search Movies
          </h1>

          <p className="mt-2 text-gray-400">
            Enter a movie title to search.
          </p>
        </div>
      </main>
    );
  }

  // TMDB API key missing
  if (!apiKey) {
    return (
      <main className="min-h-screen bg-[#07090d] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/movie"
            className="
              tv-focus
              inline-flex
              min-h-[48px]
              items-center
              rounded-xl
              px-4
              text-sm
              font-semibold
              text-gray-300
            "
          >
            ← Back to Movies
          </Link>

          <h1 className="mt-8 text-3xl font-bold">
            Search Movies
          </h1>

          <p className="mt-3 text-gray-400">
            TMDB API key is not configured.
          </p>
        </div>
      </main>
    );
  }

  const url =
    `https://api.themoviedb.org/3/search/movie` +
    `?api_key=${encodeURIComponent(apiKey)}` +
    `&query=${encodeURIComponent(query)}` +
    `&include_adult=false` +
    `&language=en-US`;

  const res = await fetch(url, {
    next: {
      revalidate: 300,
    },
  });

  if (!res.ok) {
    return (
      <main className="min-h-screen bg-[#07090d] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/movie"
            className="
              tv-focus
              inline-flex
              min-h-[48px]
              items-center
              rounded-xl
              px-4
              text-sm
              font-semibold
              text-gray-300
            "
          >
            ← Back to Movies
          </Link>

          <h1 className="mt-8 text-3xl font-bold">
            Search Movies
          </h1>

          <p className="mt-3 text-gray-400">
            Unable to search movies right now.
          </p>
        </div>
      </main>
    );
  }

  const data: TMDBResponse = await res.json();

  return (
    <main className="min-h-screen bg-[#07090d] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back button */}
        <Link
          href="/movie"
          className="
            tv-focus
            inline-flex
            min-h-[48px]
            items-center
            rounded-xl
            px-4
            text-sm
            font-semibold
            text-gray-300
          "
        >
          ← Back to Movies
        </Link>

        {/* Search heading */}
        <section className="mb-8 mt-6">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Search Results
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Results for{" "}
            <span className="font-semibold text-white">
              "{query}"
            </span>
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {data.total_results}{" "}
            {data.total_results === 1
              ? "movie"
              : "movies"}{" "}
            found
          </p>
        </section>

        {/* No results */}
        {data.results.length === 0 && (
          <section className="rounded-xl border border-white/10 bg-[#0d1118] p-8 text-center">
            <div className="text-4xl">🎬</div>

            <h2 className="mt-4 text-xl font-bold">
              No movies found
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Try searching for another movie title.
            </p>

            <Link
              href="/movie"
              className="
                tv-focus
                mt-6
                inline-flex
                min-h-[48px]
                items-center
                rounded-xl
                bg-green-500
                px-6
                font-semibold
                text-black
              "
            >
              Browse Movies
            </Link>
          </section>
        )}

        {/* Results grid */}
        {data.results.length > 0 && (
          <section
            className="
              grid
              grid-cols-2
              gap-4
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              xl:grid-cols-6
              2xl:grid-cols-7
            "
          >
            {data.results.map((movie) => (
              <Link
                key={movie.id}
                href={`/movie/${movie.id}`}
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
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      No Poster
                    </div>
                  )}
                </div>

                {/* Movie information */}
                <div className="p-3">
                  <h2 className="truncate text-sm font-semibold">
                    {movie.title}
                  </h2>

                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {movie.release_date
                        ? movie.release_date.slice(0, 4)
                        : "N/A"}
                    </span>

                    <span className="text-green-400">
                      ★{" "}
                      {typeof movie.vote_average === "number"
                        ? movie.vote_average.toFixed(1)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}