import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      fixtureId: string;
    }>;
  }
) {
  const { fixtureId } = await context.params;

  const serverUrl = process.env.EMBY_SERVER_URL?.replace(/\/$/, "");
  const embyApiKey = process.env.EMBY_API_KEY;

  if (!serverUrl || !embyApiKey) {
    return new Response("Playback server is not configured.", {
      status: 500,
    });
  }

  try {
    // Get the normalized stream map internally.
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const response = await fetch(
      `${origin}/api/emby/match-fixtures`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return new Response("Unable to resolve stream.", {
        status: 502,
      });
    }

    const data = await response.json();

    const stream = data.streams?.[fixtureId];

    if (!stream || stream.type !== "emby" || !stream.itemId) {
      return new Response("No stream", {
        status: 404,
      });
    }

    const headers: Record<string, string> = {
      "X-Emby-Token": embyApiKey,
      Accept: "*/*",
    };

    const range = request.headers.get("range");

    if (range) {
      headers.Range = range;
    }

    const embyResponse = await fetch(
      `${serverUrl}/Videos/${encodeURIComponent(
        stream.itemId
      )}/stream?Static=true`,
      {
        headers,
        cache: "no-store",
      }
    );

    if (!embyResponse.ok) {
      return new Response(
        await embyResponse.text(),
        {
          status: embyResponse.status,
        }
      );
    }

    const responseHeaders = new Headers();

    const copyHeaders = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "cache-control",
      "etag",
      "last-modified",
    ];

    for (const header of copyHeaders) {
      const value = embyResponse.headers.get(header);

      if (value) {
        responseHeaders.set(header, value);
      }
    }

    responseHeaders.set(
      "Access-Control-Allow-Origin",
      "*"
    );

    return new Response(embyResponse.body, {
      status: embyResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(
      "Emby proxy error:",
      error
    );

    return new Response(
      "Playback proxy failed.",
      {
        status: 502,
      }
    );
  }
}