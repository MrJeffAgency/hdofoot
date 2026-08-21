import TVHome from "@/components/TVHome";

interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  original_language: string;
}

interface TMDBResponse {
  results: TVShow[];
}

async function getTVShows(url: string): Promise<TVShow[]> {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    console.error("TMDB_API_KEY is missing");
    return [];
  }

  const separator = url.includes("?") ? "&" : "?";

  try {
    const res = await fetch(
      `${url}${separator}api_key=${encodeURIComponent(
        apiKey
      )}&language=en-US`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();

      console.error(
        "TMDB TV Error:",
        res.status,
        errorText
      );

      return [];
    }

    const data: TMDBResponse = await res.json();

    return data.results || [];
  } catch (error) {
    console.error(
      "TMDB TV Fetch Error:",
      error
    );

    return [];
  }
}

export default async function TVPage() {
  const today = new Date();

  const endDate = today
    .toISOString()
    .split("T")[0];

  const start = new Date(today);

  start.setDate(
    start.getDate() - 365
  );

  const startDate = start
    .toISOString()
    .split("T")[0];

  const [
  trending,
  action,
  usShows,
  animated,
  newReleases,
  topPicks,
  kids,
] = await Promise.all([
    /* =========================================
       TRENDING SERIES
       ========================================= */

    getTVShows(
      "https://api.themoviedb.org/3/trending/tv/week"
    ),

/* =========================================
   ACTION SERIES
   TMDB TV genre 10759 = Action & Adventure
   ========================================= */

getTVShows(
  "https://api.themoviedb.org/3/discover/tv?with_genres=10759&sort_by=popularity.desc"
),

    /* =========================================
       US TV SHOWS
       ========================================= */

    getTVShows(
      "https://api.themoviedb.org/3/discover/tv?with_origin_country=US&sort_by=popularity.desc"
    ),

    /* =========================================
       ANIMATED TV SHOWS
       TMDB TV genre 16 = Animation
       ========================================= */

    getTVShows(
      "https://api.themoviedb.org/3/discover/tv?with_genres=16&sort_by=popularity.desc"
    ),

    /* =========================================
       NEW RELEASES TV SHOWS
       Last 365 days
       ========================================= */

    getTVShows(
      `https://api.themoviedb.org/3/discover/tv?first_air_date.gte=${startDate}&first_air_date.lte=${endDate}&sort_by=first_air_date.desc`
    ),

    /* =========================================
       TOP PICKS TV SHOWS
       ========================================= */

    getTVShows(
      "https://api.themoviedb.org/3/discover/tv?sort_by=vote_average.desc&vote_count.gte=200"
    ),

    /* =========================================
       KIDS TV SHOWS
       TMDB TV genre 10762 = Kids
       ========================================= */

    getTVShows(
      "https://api.themoviedb.org/3/discover/tv?with_genres=10762&sort_by=popularity.desc"
    ),
  ]);

  return (
    <TVHome
  trending={trending}
  action={action}
  usShows={usShows}
  animated={animated}
  newReleases={newReleases}
  topPicks={topPicks}
  kids={kids}
/>
);
}