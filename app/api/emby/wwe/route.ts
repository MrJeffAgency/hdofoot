import { NextResponse } from "next/server";

const EMBY_SERVER_URL = process.env.EMBY_SERVER_URL;
const EMBY_API_KEY = process.env.EMBY_API_KEY;

export async function GET() {
  if (!EMBY_SERVER_URL || !EMBY_API_KEY) {
    return NextResponse.json(
      {
        error: "Emby environment variables are not configured.",
      },
      { status: 500 }
    );
  }

  try {
    const url = new URL(
      `${EMBY_SERVER_URL}/Items`
    );

    url.searchParams.set("ParentId", "8");
    url.searchParams.set("Recursive", "true");
    url.searchParams.set("Fields", "Name,Type,Path,ParentId");

    const response = await fetch(url.toString(), {
      headers: {
        "X-Emby-Token": EMBY_API_KEY,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Unable to query Emby.",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      total: data.TotalRecordCount ?? 0,
      items: (data.Items ?? []).map((item: any) => ({
        id: item.Id,
        name: item.Name,
        type: item.Type,
        parentId: item.ParentId,
        path: item.Path ?? null,
      })),
    });
  } catch (error) {
    console.error("Emby diagnostic error:", error);

    return NextResponse.json(
      {
        error: "Unable to connect to Emby.",
      },
      { status: 500 }
    );
  }
}