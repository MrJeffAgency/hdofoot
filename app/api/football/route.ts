import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://v3.football.api-sports.io";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "API_FOOTBALL_KEY is not configured",
        },
        { status: 500 }
      );
    }

    const searchParams =
      request.nextUrl.searchParams;

    const endpoint =
      searchParams.get("endpoint") || "fixtures";

    const allowedEndpoints = [
      "fixtures",
      "leagues",
      "standings",
      "teams",
      "players",
    ];

    if (!allowedEndpoints.includes(endpoint)) {
      return NextResponse.json(
        {
          error: "Invalid football API endpoint",
        },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();

    searchParams.forEach((value, key) => {
      if (key !== "endpoint") {
        params.set(key, value);
      }
    });

    const url =
      `${API_URL}/${endpoint}?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",

      headers: {
        "x-apisports-key": apiKey,
      },

      /*
       * Cache the API-Football response for 30 seconds.
       */
      next: {
        revalidate: 30,
      },
    });

    const data = await response.json();

    /*
     * API-Football can return HTTP 200 while placing
     * quota errors inside the "errors" object.
     */
    if (
      data?.errors &&
      Object.keys(data.errors).length > 0
    ) {
      const requestError =
        data.errors.requests ||
        data.errors.request ||
        "Football API request failed";

      const isRateLimit =
        typeof requestError === "string" &&
        (
          requestError
            .toLowerCase()
            .includes("limit") ||
          requestError
            .toLowerCase()
            .includes("quota") ||
          requestError
            .toLowerCase()
            .includes("rate")
        );

      console.error(
        "API-Football error:",
        requestError
      );

      return NextResponse.json(
        {
          error: isRateLimit
            ? "Football API daily request limit reached"
            : "Football API request failed",

          details: data.errors,

          rateLimited: isRateLimit,
        },
        {
          status: isRateLimit ? 429 : 502,
        }
      );
    }

    /*
     * Handle normal HTTP errors.
     */
    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Football API request failed",
          details: data,
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(data, {
      headers: {
        /*
         * Tell the browser it can reuse this response briefly.
         */
        "Cache-Control":
          "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error(
      "Football API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to fetch football data",
      },
      {
        status: 500,
      }
    );
  }
}