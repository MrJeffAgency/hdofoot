import { NextResponse } from "next/server";

interface Stream {
  type: "emby" | "hls" | "none";
  itemId?: string;
  url?: string;
}

interface StreamsResponse {
  ok: boolean;
  streams?: Record<string, Stream>;
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      fixtureId: string;
    }>;
  }
) {
  const { fixtureId } = await context.params;

  const serverUrl =
    process.env.EMBY_SERVER_URL?.replace(/\/$/, "");

  const embyApiKey =
    process.env.EMBY_API_KEY;

  if (!serverUrl || !embyApiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Playback server is not configured.",
      },
      { status: 500 }
    );
  }

  try {
    /*
     * TEMPORARY TEST MAPPING
     *
     * Fixture 1623384 uses the known-good
     * Emby item 11.
     *
     * Keep this mapping for testing.
     */
    if (fixtureId === "1623384") {
      return NextResponse.json({
        ok: true,
        stream: {
          type: "emby",
          itemId: "11",
        },
      });
    }

    /*
     * Normal fixture -> stream resolution.
     */
    const requestUrl = new URL(_request.url);

const streamsResponse = await fetch(
  `${requestUrl.origin}/api/emby/match-fixtures`,
  {
    cache: "no-store",
  }
);
    

    if (!streamsResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to resolve fixture stream.",
        },
        { status: 502 }
      );
    }

    const streamsData =
      (await streamsResponse.json()) as StreamsResponse;

    const stream =
      streamsData.streams?.[fixtureId];

    if (!stream || stream.type === "none") {
      return NextResponse.json({
        ok: true,
        stream: {
          type: "none",
        },
      });
    }

    /*
     * HLS
     */
    if (stream.type === "hls") {
      if (!stream.url) {
        return NextResponse.json({
          ok: true,
          stream: {
            type: "none",
          },
        });
      }

      return NextResponse.json({
        ok: true,
        stream: {
          type: "hls",
          url: stream.url,
        },
      });
    }

    /*
     * EMBY
     */
    if (stream.type === "emby") {
      const itemId = stream.itemId;

      if (!itemId) {
        return NextResponse.json({
          ok: true,
          stream: {
            type: "none",
          },
        });
      }

      /*
       * Browser-safe URL.
       *
       * The Emby API key NEVER reaches the browser.
       */
      const playbackUrl =
        `/api/emby/test-stream/${encodeURIComponent(
          String(itemId)
        )}`;

      return NextResponse.json({
        ok: true,
        stream: {
          type: "emby",
          itemId: String(itemId),
          url: playbackUrl,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      stream: {
        type: "none",
      },
    });
  } catch (error) {
    console.error(
      "Fixture playback error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to resolve playback.",
      },
      { status: 502 }
    );
  }
}