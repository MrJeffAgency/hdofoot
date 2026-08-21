import { NextRequest } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;

  const serverUrl =
    process.env.EMBY_SERVER_URL?.replace(/\/$/, "");

  const apiKey = process.env.EMBY_API_KEY;

  if (!serverUrl || !apiKey) {
    return new Response(
      "Missing Emby configuration",
      { status: 500 }
    );
  }

  try {
    const embyUrl = new URL(
      `${serverUrl}/Videos/${encodeURIComponent(id)}/stream`
    );

    // Use the known Emby media source for item 11.
    if (id === "11") {
      embyUrl.searchParams.set(
        "MediaSourceId",
        "mediasource_11"
      );
    }

    embyUrl.searchParams.set("Static", "true");

    const range = request.headers.get("range");

    const headers: Record<string, string> = {
      "X-Emby-Token": apiKey,
      Accept: "*/*",
    };

    if (range) {
      headers.Range = range;
    }

    console.log(
      "Emby test stream:",
      `${serverUrl}/Videos/${id}/stream`
    );

    const response = await fetch(
      embyUrl.toString(),
      {
        headers,
        cache: "no-store",
      }
    );

    console.log(
      "Emby test stream response:",
      response.status,
      response.headers.get("content-type")
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Emby test stream error:",
        response.status,
        errorText.slice(0, 500)
      );

      return new Response(
        "Emby stream unavailable",
        {
          status: response.status,
        }
      );
    }

    const responseHeaders = new Headers();

    const contentType =
      response.headers.get("content-type");

    const contentLength =
      response.headers.get("content-length");

    const contentRange =
      response.headers.get("content-range");

    const acceptRanges =
      response.headers.get("accept-ranges");

    if (contentType) {
      responseHeaders.set(
        "Content-Type",
        contentType
      );
    }

    if (contentLength) {
      responseHeaders.set(
        "Content-Length",
        contentLength
      );
    }

    if (contentRange) {
      responseHeaders.set(
        "Content-Range",
        contentRange
      );
    }

    if (acceptRanges) {
      responseHeaders.set(
        "Accept-Ranges",
        acceptRanges
      );
    }

    responseHeaders.set(
      "Cache-Control",
      "no-store"
    );

    return new Response(
      response.body,
      {
        status: response.status,
        headers: responseHeaders,
      }
    );
  } catch (error) {
    console.error(
      "Emby test stream connection error:",
      error
    );

    return new Response(
      "Failed to connect to Emby",
      { status: 500 }
    );
  }
}