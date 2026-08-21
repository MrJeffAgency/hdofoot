import { NextRequest } from "next/server";

const EMBY_SERVER_URL = process.env.EMBY_SERVER_URL;
const EMBY_API_KEY = process.env.EMBY_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!EMBY_SERVER_URL || !EMBY_API_KEY) {
      return new Response("Emby environment variables are not configured.", {
        status: 500,
      });
    }

    const { id } = await params;

    const range = request.headers.get("range");

    const url = new URL(`${EMBY_SERVER_URL}/Videos/${id}/stream`);

    url.searchParams.set("Static", "true");
    url.searchParams.set("api_key", EMBY_API_KEY);

    const headers: HeadersInit = {
      Accept: "*/*",
    };

    if (range) {
      headers.Range = range;
    }

    const response = await fetch(url.toString(), {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      return new Response(
        `Emby video stream failed: ${response.status}`,
        {
          status: response.status,
        }
      );
    }

    const responseHeaders = new Headers();

    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");
    const acceptRanges = response.headers.get("accept-ranges");

    if (contentType) {
      responseHeaders.set("Content-Type", contentType);
    }

    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    if (acceptRanges) {
      responseHeaders.set("Accept-Ranges", acceptRanges);
    } else {
      responseHeaders.set("Accept-Ranges", "bytes");
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Emby video proxy error:", error);

    return new Response("Unable to stream video from Emby.", {
      status: 500,
    });
  }
}