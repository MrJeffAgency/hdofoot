import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: RouteProps
) {
  /*
   * Verify the Supabase session before
   * allowing access to TMDB data.
   */
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await params;

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
} 