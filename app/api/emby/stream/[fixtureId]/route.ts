import { NextResponse } from "next/server";

const API_FOOTBALL_URL =
  "https://v3.football.api-sports.io";

type Stream =
  | {
      type: "emby";
      itemId: string;
    }
  | {
      type: "hls";
      url: string;
    }
  | {
      type: "none";
    };

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function teamScore(
  team: string,
  itemName: string
): number {
  const teamNormalized =
    normalize(team);

  const itemNormalized =
    normalize(itemName);

  if (
    !teamNormalized ||
    !itemNormalized
  ) {
    return 0;
  }

  if (
    itemNormalized.includes(
      teamNormalized
    )
  ) {
    return 40;
  }

  const words = team
    .split(/\s+/)
    .map((word) => normalize(word))
    .filter(
      (word) => word.length >= 4
    );

  if (words.length === 0) {
    return 0;
  }

  const matchedWords =
    words.filter((word) =>
      itemNormalized.includes(word)
    );

  return Math.round(
    (matchedWords.length /
      words.length) *
      30
  );
}

function dateScore(
  fixtureDate: string,
  itemName: string
): number {
  const match = itemName.match(
    /\b(20\d{2})[-_./](\d{1,2})[-_./](\d{1,2})\b/
  );

  if (!match) {
    return 0;
  }

  const year = match[1];
  const month = match[2];
  const day = match[3];

  const fixtureTime =
    new Date(fixtureDate).getTime();

  const itemTime = new Date(
    `${year}-${month.padStart(
      2,
      "0"
    )}-${day.padStart(
      2,
      "0"
    )}T00:00:00Z`
  ).getTime();

  if (
    Number.isNaN(fixtureTime) ||
    Number.isNaN(itemTime)
  ) {
    return 0;
  }

  const difference =
    Math.abs(
      fixtureTime - itemTime
    ) /
    (1000 * 60 * 60 * 24);

  return difference <= 1
    ? 15
    : 0;
}

function footballNameScore(
  name: string
): number {
  const value = normalize(name);

  const footballWords = [
    "football",
    "soccer",
    "match",
    "premierleague",
    "championsleague",
    "europaleague",
    "worldcup",
    "cup",
  ];

  return footballWords.some(
    (word) =>
      value.includes(
        normalize(word)
      )
  )
    ? 5
    : 0;
}

export async function GET() {
  const serverUrl =
    process.env.EMBY_SERVER_URL?.replace(
      /\/$/,
      ""
    );

  const embyApiKey =
    process.env.EMBY_API_KEY;

  const footballApiKey =
    process.env.API_FOOTBALL_KEY;

  if (
    !serverUrl ||
    !embyApiKey ||
    !footballApiKey
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Missing EMBY_SERVER_URL, EMBY_API_KEY, or API_FOOTBALL_KEY",
      },
      {
        status: 500,
      }
    );
  }

  try {
    const date =
      new Date()
        .toISOString()
        .slice(0, 10);

    // ---------------------------------------------------------
    // API-FOOTBALL
    // ---------------------------------------------------------

    const fixturesUrl = new URL(
      `${API_FOOTBALL_URL}/fixtures`
    );

    fixturesUrl.searchParams.set(
      "date",
      date
    );

    const fixturesResponse =
      await fetch(
        fixturesUrl.toString(),
        {
          headers: {
            "x-apisports-key":
              footballApiKey,
          },
          cache: "no-store",
        }
      );

    if (!fixturesResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            `API-Football returned ${fixturesResponse.status}`,
        },
        {
          status: 502,
        }
      );
    }

    const fixturesData =
      await fixturesResponse.json();

    const fixtures =
      fixturesData.response ?? [];

    // ---------------------------------------------------------
    // EMBY
    // ---------------------------------------------------------

    const embyUrl = new URL(
      `${serverUrl}/Items`
    );

    embyUrl.searchParams.set(
      "Recursive",
      "true"
    );

    embyUrl.searchParams.set(
      "IncludeItemTypes",
      "Video,Movie,MusicVideo"
    );

    embyUrl.searchParams.set(
      "Fields",
      "Path,MediaSources"
    );

    embyUrl.searchParams.set(
      "Limit",
      "500"
    );

    const embyResponse =
      await fetch(
        embyUrl.toString(),
        {
          headers: {
            "X-Emby-Token":
              embyApiKey,
            Accept:
              "application/json",
          },
          cache: "no-store",
        }
      );

    if (!embyResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            `Emby returned ${embyResponse.status}`,
        },
        {
          status: 502,
        }
      );
    }

    const embyData =
      await embyResponse.json();

    const embyItems =
      embyData.Items ?? [];

    // ---------------------------------------------------------
    // FIXTURE -> STREAM MAP
    // ---------------------------------------------------------

    const streams: Record<
      string,
      Stream
    > = {};

    for (const fixture of fixtures) {
      const fixtureId =
        fixture.fixture?.id;

      if (!fixtureId) {
        continue;
      }

      const homeTeam =
        fixture.teams?.home?.name ??
        "";

      const awayTeam =
        fixture.teams?.away?.name ??
        "";

      const fixtureDate =
        fixture.fixture?.date ??
        "";

      const candidates = embyItems
        .map((item: any) => {
          const itemName =
            item.Name ?? "";

          const homeScore =
            teamScore(
              homeTeam,
              itemName
            );

          const awayScore =
            teamScore(
              awayTeam,
              itemName
            );

          const datePoints =
            dateScore(
              fixtureDate,
              itemName
            );

          const footballPoints =
            footballNameScore(
              itemName
            );

          const score =
            homeScore +
            awayScore +
            datePoints +
            footballPoints;

          return {
            item,
            score,
            homeScore,
            awayScore,
            datePoints,
            footballPoints,
          };
        })
        .filter(
          (candidate: any) =>
            candidate.score > 0
        )
        .sort(
          (a: any, b: any) =>
            b.score - a.score
        );

      const best =
        candidates[0];

      const second =
        candidates[1];

      const validEmbyMatch =
        !!best &&
        best.homeScore >= 20 &&
        best.awayScore >= 20 &&
        best.score >= 80 &&
        (!second ||
          best.score -
            second.score >=
            10);

      if (
        validEmbyMatch &&
        best.item?.Id
      ) {
        streams[
          String(fixtureId)
        ] = {
          type: "emby",
          itemId: String(
            best.item.Id
          ),
        };
      } else {
        streams[
          String(fixtureId)
        ] = {
          type: "none",
        };
      }
    }

    // ---------------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------------

    const streamValues =
      Object.values(streams);

    const embyMatches =
      streamValues.filter(
        (stream) =>
          stream.type === "emby"
      ).length;

    const hlsMatches =
      streamValues.filter(
        (stream) =>
          stream.type === "hls"
      ).length;

    const noStreamMatches =
      streamValues.filter(
        (stream) =>
          stream.type === "none"
      ).length;

    return NextResponse.json(
      {
        ok: true,

        date,

        totals: {
          fixtures:
            fixtures.length,
          embyItems:
            embyItems.length,
          embyMatches,
          hlsMatches,
          noStreamMatches,
        },

        streams,
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
      "Fixture stream mapping error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Failed to communicate with API-Football or Emby.",
      },
      {
        status: 502,
      }
    );
  }
}