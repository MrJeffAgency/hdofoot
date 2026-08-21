import { NextResponse } from "next/server";

export async function GET() {
  const serverUrl = process.env.EMBY_SERVER_URL?.replace(/\/$/, "");
  const apiKey = process.env.EMBY_API_KEY;

  if (!serverUrl || !apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Emby server URL or API key",
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${serverUrl}/Users`, {
      headers: {
        "X-Emby-Token": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Emby users request failed: ${response.status}`,
          embyResponse: text.slice(0, 1000),
        },
        { status: response.status }
      );
    }

    const users = JSON.parse(text);

    return NextResponse.json({
      ok: true,
      users: users.map((user: any) => ({
        id: user.Id,
        name: user.Name,
      })),
    });
  } catch (error) {
    console.error("Emby users error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Could not communicate with Emby.",
      },
      { status: 500 }
    );
  }
}