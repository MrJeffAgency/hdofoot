import { NextResponse } from "next/server";

interface RouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: RouteProps
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Missing TV show ID",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "TMDB API key is not configured",
        },
        {
          status: 500,
        }
      );
    }

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
      return NextResponse.json(
        {
          error: "TV show not found",
        },
        {
          status: res.status,
        }
      );
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error(
      "TV show API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load TV show",
      },
      {
        status: 500,
      }
    );
  }
}