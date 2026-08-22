import { NextResponse } from "next/server";
import { getFixtures } from "@/lib/football";
import { matchFixtureToEmby } from "@/lib/emby-match";

const LIVE_STATUSES = new Set([
  "1H",
  "HT",
  "2H",
  "ET",
  "P",
  "LIVE",
]);

type EmbyItem = {
  Id: string;
  Name: string;
  Type?: string;
  MediaType?: string;
};

async function getEmbyItems(): Promise<EmbyItem[]> {
  const serverUrl =
    process.env.EMBY_SERVER_URL?.replace(/\/$/, "");

  const apiKey = process.env.EMBY_API_KEY;

  if (!serverUrl || !apiKey) {
    throw new Error(
      "Missing EMBY_SERVER_URL or EMBY_API_KEY"
    );
  }

  const url = new URL(`${serverUrl}/Items`);

  url.searchParams.set("Recursive", "true");
  url.searchParams.set("Limit", "500");
  url.searchParams.set(
    "IncludeItemTypes",
    "Movie,Video,MusicVideo"
  );
  url.searchParams.set(
    "Fields",
    "Path,MediaSources"
  );

  const response = await fetch(url.toString(), {
    headers: {
      "X-Emby-Token": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Emby items request failed: ${response.status} ${text.slice(
        0,
        300
      )}`
    );
  }

  const data = JSON.parse(text);

  return Array.isArray(data.Items)
    ? data.Items
    : [];
}

export async function GET() {
  try {
    const [fixtures, embyItems] =
      await Promise.all([
        getFixtures("today"),
        getEmbyItems(),
      ]);

    const liveFixtures = fixtures.filter(
      (fixture: any) =>
        LIVE_STATUSES.has(
          fixture.fixture?.status?.short
        )
    );

    const entries = await Promise.all(
      liveFixtures.map(async (fixture: any) => {
        const fixtureId = Number(
          fixture.fixture?.id
        );

        const match =
          matchFixtureToEmby(
            fixture,
            embyItems
          );

        if (
          match.matched &&
          match.itemId
        ) {
          return [
            String(fixtureId),
            {
              fixture,

              stream: {
                type: "emby" as const,
                available: true,
                itemId: match.itemId,

                /*
                 * This is YOUR server route.
                 * No Emby server URL or API key
                 * reaches the browser.
                 */
                url: `/api/emby/stream/${encodeURIComponent(
                  match.itemId
                )}`,

                match: {
                  itemName:
                    match.itemName,
                  score: match.score,
                },
              },
            },
          ] as const;
        }

        return [
          String(fixtureId),
          {
            fixture,

            stream: {
              type: "none" as const,
              available: false,

              match: {
                score: match.score,
              },
            },
          },
        ] as const;
      })
    );

    return NextResponse.json(
      {
        ok: true,
        count: entries.length,

        /*
         * Useful while testing automatic matching.
         */
        embyItemsChecked:
          embyItems.length,

        fixtures:
          Object.fromEntries(entries),
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Live stream mapping error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to map live streams.",
      },
      { status: 500 }
    );
  }
}