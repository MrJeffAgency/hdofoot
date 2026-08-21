import MovieHome from "@/components/MovieHome";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  original_language: string;
}

interface TMDBResponse {
  results: Movie[];
}

async function getMovies(url: string): Promise<Movie[]> {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return [];
  }

  const separator = url.includes("?") ? "&" : "?";

  const res = await fetch(
    `${url}${separator}api_key=${apiKey}`,
    {
      next: {
        revalidate: 3600,
      },
    }
  );

  if (!res.ok) {
    return [];
  }

  const data: TMDBResponse = await res.json();

  return data.results || [];
}

export default async function MoviePage() {
  const [
    trending,
    horror,
    animated,
    hollywood,
    marvel,
  ] = await Promise.all([
    getMovies(
      "https://api.themoviedb.org/3/trending/movie/week"
    ),

    getMovies(
      "https://api.themoviedb.org/3/discover/movie?with_genres=27&sort_by=vote_average.desc&vote_count.gte=200"
    ),

    getMovies(
      "https://api.themoviedb.org/3/discover/movie?with_genres=16&sort_by=popularity.desc"
    ),

    getMovies(
      "https://api.themoviedb.org/3/discover/movie?with_original_language=en&sort_by=popularity.desc"
    ),

    getMovies(
      "https://api.themoviedb.org/3/discover/movie?with_companies=420"
    ),
  ]);

  return (
    <MovieHome
      trending={trending}
      horror={horror}
      animated={animated}
      hollywood={hollywood}
      marvel={marvel}
    />
  );
}