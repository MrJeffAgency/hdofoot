import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const itemId =
    request.nextUrl.searchParams.get("id");

  const serverUrl =
    process.env.EMBY_SERVER_URL?.replace(/\/$/, "");

  const apiKey =
    process.env.EMBY_API_KEY;

  if (!serverUrl || !apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Emby configuration",
      },
      { status: 500 }
    );
  }

  if (!itemId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing item ID",
      },
      { status: 400 }
    );
  }

  try {
    const url = new URL(
      `${serverUrl}/Items`
    );

    url.searchParams.set(
      "Ids",
      itemId
    );

    url.searchParams.set(
      "Recursive",
      "true"
    );

    url.searchParams.set(
      "Fields",
      "Path,MediaSources"
    );

    const response = await fetch(
      url.toString(),
      {
        headers: {
          "X-Emby-Token": apiKey,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          itemId,
          status: response.status,
          response: data,
        },
        {
          status: response.status,
        }
      );
    }

    const item =
      data.Items?.[0];

    if (!item) {
      return NextResponse.json({
        ok: false,
        itemId,
        status: 404,
        error:
          "Emby returned no item for this ID",
      });
    }

    return NextResponse.json({
      ok: true,
      item: {
        id: item.Id,
        name: item.Name,
        type: item.Type,
        path: item.Path ?? null,
        mediaSources:
          item.MediaSources ?? [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        itemId,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}
