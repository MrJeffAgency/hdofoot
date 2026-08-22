import { NextRequest, NextResponse } from "next/server";

const SEARCH_QUERIES = {
  football: "football highlights",
  wwe: "WWE highlights",
} as const;

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "YouTube API key is not configured.",
        },
        { status: 500 }
      );
    }

    const category =
      request.nextUrl.searchParams.get("category") ||
      "football";

    if (
      category !== "football" &&
      category !== "wwe"
    ) {
      return NextResponse.json(
        {
          error: "Invalid YouTube category.",
        },
        { status: 400 }
      );
    }

    const query = SEARCH_QUERIES[category];

    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: "12",
      order: "date",
      videoEmbeddable: "true",
      safeSearch: "moderate",
      key: apiKey,
    });

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
      {
        next: {
          revalidate: 900,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "YouTube API error:",
        errorText
      );

      return NextResponse.json(
        {
          error: "YouTube API request failed.",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const videos = (data.items || [])
      .filter(
        (item: any) =>
          item.id?.videoId
      )
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet?.title || "",
        description:
          item.snippet?.description || "",
        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          "",
        channel:
          item.snippet?.channelTitle || "",
        publishedAt:
          item.snippet?.publishedAt || "",
      }));

    return NextResponse.json({
      ok: true,
      category,
      videos,
    });
  } catch (error) {
    console.error(
      "YouTube route error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load YouTube videos.",
      },
      { status: 500 }
    );
  }
}