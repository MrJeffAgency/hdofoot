import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres?: {
    id: number;
    name: string;
  }[];
  credits?: {
    cast?: CastMember[];
  };
}

export default async function MovieWatchPage({
  params,
}: PageProps) {
  const { id } = await params;

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return (
      <main className="min-h-screen bg-[#07090d] p-6 text-white">
        <h1 className="text-2xl font-bold">
          TMDB_API_KEY is not configured.
        </h1>
      </main>
    );
  }

  let movie: Movie | null = null;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${encodeURIComponent(
        id
      )}?api_key=${encodeURIComponent(
        apiKey
      )}&language=en-US&append_to_response=credits`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`TMDB request failed: ${res.status}`);
    }

    movie = await res.json();
  } catch (error) {
    console.error("Movie watch page error:", error);
  }

  if (!movie) {
    return (
      <main className="min-h-screen bg-[#07090d] p-6 text-white">
        <h1 className="text-2xl font-bold">
          Unable to load movie
        </h1>

        <Link
          href={`/movie/${id}`}
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
            text-green-400
          "
        >
          ← Back to Movie
        </Link>
      </main>
    );
  }

  const cast = movie.credits?.cast?.slice(0, 12) ?? [];

  const embedUrl = `https://vidsrc.to/embed/movie/${encodeURIComponent(
    id
  )}`;

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-5 md:px-6 lg:px-8">

        {/* Back */}

        <Link
          href={`/movie/${movie.id}`}
          className="
            tv-focus
            mb-5
            inline-flex
            min-h-[44px]
            items-center
            rounded-xl
            px-3
            py-2
            text-sm
            text-gray-300
          "
        >
          ← Back to Movie
        </Link>

        {/* PLAYER */}

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
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={movie.title}
              className="h-full w-full border-0"
              allow="
                autoplay;
                fullscreen;
                picture-in-picture;
                encrypted-media
              "
              allowFullScreen
            />
          </div>
        </div>

        {/* MOVIE INFORMATION */}

        <section className="mt-8">
          <div className="flex flex-col gap-6 sm:flex-row">

            {/* Poster */}

            <div className="w-32 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:w-40">
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="h-auto w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center bg-[#121821] text-xs text-gray-500">
                  No Poster
                </div>
              )}
            </div>

            {/* Details */}

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-black sm:text-3xl">
                {movie.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-400">
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

              {movie.genres && movie.genres.length > 0 && (
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

              <p className="mt-5 max-w-4xl text-sm leading-6 text-gray-300 sm:text-base">
                {movie.overview ||
                  "No description available."}
              </p>
            </div>
          </div>
        </section>

        {/* CAST */}

        {cast.length > 0 && (
          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-2xl font-bold">
                Cast
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Actors in this movie
              </p>
            </div>

            <div
              className="
                grid
                grid-cols-3
                gap-4
                sm:grid-cols-4
                md:grid-cols-6
                lg:grid-cols-8
              "
            >
              {cast.map((actor) => (
                <div
                  key={actor.id}
                  className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-white/10
                    bg-[#0d1118]
                  "
                >
                  <div className="aspect-[2/3] bg-[#121821]">
                    {actor.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w342${actor.profile_path}`}
                        alt={actor.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-xs text-gray-500">
                        No Photo
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="truncate text-sm font-semibold">
                      {actor.name}
                    </h3>

                    <p className="mt-1 truncate text-xs text-gray-500">
                      {actor.character || "Unknown role"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}