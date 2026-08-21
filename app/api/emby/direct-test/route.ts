import { NextResponse } from "next/server";

export async function GET() {
  const serverUrl = process.env.EMBY_SERVER_URL?.replace(/\/$/, "");
  const apiKey = process.env.EMBY_API_KEY;

  if (!serverUrl || !apiKey) {
    return NextResponse.json(
      { ok: false, error: "Missing Emby configuration" },
      { status: 500 }
    );
  }

  const url = new URL(`${serverUrl}/Videos/9128/stream`);

  url.searchParams.set("MediaSourceId", "mediasource_9128");
  url.searchParams.set("Static", "true");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "*/*",
        "X-Emby-Token": apiKey,
      },
      cache: "no-store",
    });

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
      contentRange: response.headers.get("content-range"),
      error: response.ok
        ? null
        : (await response.text()).slice(0, 1000),
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}