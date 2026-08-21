import { NextResponse } from "next/server";

const EMBY_SERVER_URL = process.env.EMBY_SERVER_URL;
const EMBY_API_KEY = process.env.EMBY_API_KEY;

export async function GET() {
  try {
    if (!EMBY_SERVER_URL || !EMBY_API_KEY) {
      return NextResponse.json(
        {
          items: [],
          total: 0,
          embyTotal: 0,
          error: "Emby environment variables are not configured.",
        },
        { status: 500 }
      );
    }

    const url = new URL(`${EMBY_SERVER_URL}/Items`);

    url.searchParams.set("Recursive", "true");
    url.searchParams.set(
      "IncludeItemTypes",
      "Movie,Video,MusicVideo"
    );
    url.searchParams.set(
      "Fields",
      "Name,Type,Path,Overview,ProductionYear,ImageTags"
    );
    url.searchParams.set("Limit", "100");

    const response = await fetch(url.toString(), {
      headers: {
        "X-Emby-Token": EMBY_API_KEY,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();

      console.error(
        "Emby videos list failed:",
        response.status,
        text
      );

      return NextResponse.json(
        {
          items: [],
          total: 0,
          embyTotal: 0,
          error: `Emby returned ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const items = Array.isArray(data.Items)
      ? data.Items.map((item: any) => ({
          id: String(item.Id),
          name: item.Name ?? "",
          type: item.Type ?? "",
          overview: item.Overview ?? "",
          year: item.ProductionYear ?? null,
          path: item.Path ?? "",
          image: item.ImageTags?.Primary
            ? `${EMBY_SERVER_URL}/Items/${item.Id}/Images/Primary?tag=${encodeURIComponent(
                item.ImageTags.Primary
              )}`
            : null,
        }))
      : [];

    return NextResponse.json({
      items,
      total: items.length,
      embyTotal: data.TotalRecordCount ?? items.length,
    });
  } catch (error) {
    console.error("Emby videos API error:", error);

    return NextResponse.json(
      {
        items: [],
        total: 0,
        embyTotal: 0,
        error: "Unable to load videos from Emby.",
      },
      { status: 500 }
    );
  }
}