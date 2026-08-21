import Link from "next/link";
import TVSearch from "@/components/TVSearch";

interface PageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  overview: string;
}

interface TMDBResponse {
  results: TVShow[];
}

async function searchTVShows(
  query: string
): Promise<TVShow[]> {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey || !query.trim()) {
    return [];
  }

  const url =
    `https://api.themoviedb.org/3/search/tv` +
    `?api_key=${encodeURIComponent(apiKey)}` +
    `&language=en-US` +
    `&query=${encodeURIComponent(query)}` +
    `&include_adult=false`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate: 300,
      },
    });

    if (!res.ok) {
      console.error(
        "TMDB TV Search Error:",
        res.status,
        await res.text()
      );

      return [];
    }

    const data: TMDBResponse = await res.json();

    return data.results || [];
  } catch (error) {
    console.error(
      "TMDB TV Search Fetch Error:",
      error
    );

    return [];
  }
}

export default async function TVSearchPage({
  searchParams,
}: PageProps) {
  const { q } = await searchParams;

  const query = q?.trim() || "";

  const results = await searchTVShows(query);

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
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
        {/* Back to TV */}

        <Link
          href="/tv"
          className="
            tv-focus
            mb-6
            inline-flex
            min-h-[48px]
            items-center
            rounded-xl
            border
            border-white/10
            bg-[#0d1118]
            px-5
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
          ← Back to TV Shows
        </Link>

        {/* Title */}

        <h1 className="text-2xl font-bold sm:text-3xl">
          TV Search
        </h1>

        {/* Existing TV Search */}

        <div className="mt-5">
          <TVSearch />
        </div>

        {/* Search information */}

        {query && (
          <p className="mt-5 text-sm text-gray-400">
            Search results for "{query}"
          </p>
        )}

        {/* No query */}

        {!query && (
          <p className="mt-8 text-gray-400">
            Search for a TV show.
          </p>
        )}

        {/* No results */}

        {query && results.length === 0 && (
          <p className="mt-8 text-gray-400">
            No TV shows found.
          </p>
        )}

        {/* Results */}

        {results.length > 0 && (
          <div
            className="
              mt-8
              grid
              grid-cols-2
              gap-4
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              xl:grid-cols-6
            "
          >
            {results.map((show) => (
              <Link
                key={show.id}
                href={`/tv/${show.id}`}
                className="
                  tv-focus
                  group
                  overflow-hidden
                  rounded-xl
                  border
                  border-white/10
                  bg-[#0d1118]
                  transition
                  duration-200
                  hover:border-green-500/40
                  hover:bg-[#121821]
                  focus:outline-none
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
                  <h2 className="truncate text-sm font-semibold text-white">
                    {show.name}
                  </h2>

                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {show.first_air_date
                        ? show.first_air_date.slice(0, 4)
                        : "N/A"}
                    </span>

                    {show.vote_average > 0 && (
                      <span className="text-green-400">
                        ★{" "}
                        {show.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}