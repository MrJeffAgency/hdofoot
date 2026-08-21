import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
    season: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id, season } = await params;

    /* =====================================================
       VALIDATE PARAMETERS
       ===================================================== */

    if (!id || !season) {
      return NextResponse.json(
        {
          error: "Missing TV show ID or season number",
        },
        { status: 400 }
      );
    }

    const showId = Number(id);
    const seasonNumber = Number(season);

    if (
      !Number.isInteger(showId) ||
      showId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid TV show ID",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(seasonNumber) ||
      seasonNumber < 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid season number",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       TMDB API KEY
       ===================================================== */

    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      console.error(
        "TMDB_API_KEY is not configured"
      );

      return NextResponse.json(
        {
          error: "TMDB API key is not configured",
        },
        { status: 500 }
      );
    }

    /* =====================================================
       FETCH SEASON FROM TMDB
       ===================================================== */

    const tmdbUrl =
      `https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}` +
      `?api_key=${encodeURIComponent(apiKey)}` +
      `&language=en-US`;

    const res = await fetch(tmdbUrl, {
      next: {
        revalidate: 3600,
      },
    });

    /* =====================================================
       HANDLE TMDB ERRORS
       ===================================================== */

    if (!res.ok) {
      let errorData: unknown;

      try {
        errorData = await res.json();
      } catch {
        errorData = await res.text();
      }

      console.error(
        "TMDB TV Season Error:",
        res.status,
        errorData
      );

      return NextResponse.json(
        {
          error: "TMDB season request failed",
          status: res.status,
          details: errorData,
        },
        {
          status: res.status,
        }
      );
    }

    /* =====================================================
       RETURN SEASON + EPISODES
       ===================================================== */

    const data = await res.json();

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error(
      "TV Season API Error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load TV season",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}