import { NextResponse } from "next/server";

export async function GET() {
  const serverUrl = process.env.EMBY_SERVER_URL;
  const apiKey = process.env.EMBY_API_KEY;

  if (!serverUrl || !apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Emby environment variables",
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${serverUrl}/System/Info?api_key=${encodeURIComponent(apiKey)}`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Emby returned ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      ok: true,
      serverName: data.ServerName,
      version: data.Version,
      id: data.Id,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Could not connect to Emby",
      },
      { status: 500 }
    );
  }
}