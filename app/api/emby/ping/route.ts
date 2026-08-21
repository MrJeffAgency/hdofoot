import { NextResponse } from "next/server";

export async function GET() {
  const serverUrl = process.env.EMBY_SERVER_URL?.replace(/\/$/, "");
  const apiKey = process.env.EMBY_API_KEY;

  if (!serverUrl || !apiKey) {
    return NextResponse.json({
      ok: false,
      error: "Missing Emby configuration",
    });
  }

  try {
    const response = await fetch(`${serverUrl}/System/Info`, {
      headers: {
        Accept: "application/json",
        "X-Emby-Token": apiKey,
      },
      cache: "no-store",
    });

    const text = await response.text();

    return NextResponse.json({
      ok: response.ok,
      serverUrl,
      status: response.status,
      contentType: response.headers.get("content-type"),
      response: text.slice(0, 500),
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      serverUrl,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}