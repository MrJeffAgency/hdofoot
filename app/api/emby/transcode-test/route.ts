import { NextResponse } from "next/server";

export async function GET() {
  const serverUrl = process.env.EMBY_SERVER_URL?.replace(/\/$/, "");
  const apiKey = process.env.EMBY_API_KEY;

  if (!serverUrl || !apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Emby configuration",
      },
      { status: 500 }
    );
  }

  const url = new URL(`${serverUrl}/Videos/9128/stream`);

  url.searchParams.set("MediaSourceId", "mediasource_9128");
  url.searchParams.set("VideoCodec", "h264");
  url.searchParams.set("AudioCodec", "aac");
  url.searchParams.set("Container", "mp4");
  url.searchParams.set("VideoBitrate", "5000000");
  url.searchParams.set("TranscodingMaxAudioChannels", "2");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "*/*",
        "X-Emby-Token": apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();

      return NextResponse.json(
        {
          ok: false,
          status: response.status,
          contentType: response.headers.get("content-type"),
          error: text.slice(0, 2000),
        },
        { status: response.status }
      );
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "video/mp4",
        ...(response.headers.get("content-length")
          ? {
              "Content-Length":
                response.headers.get("content-length")!,
            }
          : {}),
        ...(response.headers.get("content-range")
          ? {
              "Content-Range":
                response.headers.get("content-range")!,
            }
          : {}),
        ...(response.headers.get("accept-ranges")
          ? {
              "Accept-Ranges":
                response.headers.get("accept-ranges")!,
            }
          : {}),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}