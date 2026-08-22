import { NextRequest, NextResponse } from "next/server";

const ESPN_BASE =
  "https://site.api.espn.com/apis/site/v2/sports/soccer";

const SOCCER_LEAGUES = [
  "eng.1",
  "esp.1",
  "ita.1",
  "ger.1",
  "fra.1",
  "uefa.champions",
];

const LIVE_STATUSES = [
  "1H",
  "HT",
  "2H",
  "ET",
  "P",
  "LIVE",
];

function getDate(value: string | null) {
  if (value) {
    return value;
  }

  return new Date().toISOString().split("T")[0];
}

function getEspnDate(date: string) {
  return date.replaceAll("-", "");
}

function mapStatus(status: any) {
  const state = status?.type?.state;

  const description =
    status?.type?.description || "";

  const detail =
    status?.type?.detail || "";

  if (state === "in") {
    if (
      description
        .toLowerCase()
        .includes("half")
    ) {
      return "HT";
    }

    return "LIVE";
  }

  if (state === "post") {
    return "FT";
  }

  if (state === "pre") {
    return "NS";
  }

  if (
    description
      .toLowerCase()
      .includes("postpon")
  ) {
    return "PST";
  }

  if (
    detail
      .toLowerCase()
      .includes("cancel")
  ) {
    return "CANC";
  }

  return "NS";
}

function mapEvent(
  event: any,
  league: any
) {
  const competition =
    event?.competitions?.[0];

  const competitors =
    competition?.competitors || [];

  const home =
    competitors.find(
      (team: any) =>
        team.homeAway === "home"
    );

  const away =
    competitors.find(
      (team: any) =>
        team.homeAway === "away"
    );

  if (!home || !away) {
    return null;
  }

  const status =
    competition?.status;

  const homeScore =
    home.score !== undefined
      ? Number(home.score)
      : null;

  const awayScore =
    away.score !== undefined
      ? Number(away.score)
      : null;

  return {
    fixture: {
      id: Number(event.id),

      date:
        event.date ||
        competition.date ||
        new Date().toISOString(),

      status: {
        long:
          status?.type?.description ||
          "Scheduled",

        short:
          mapStatus(status),

        elapsed:
          status?.displayClock
            ? parseInt(
                status.displayClock,
                10
              ) || null
            : null,
      },
    },

    league: {
      id:
        Number(league?.id || 0),

      name:
        league?.name ||
        "Football",

      logo:
        league?.logos?.[0]?.href ||
        "",
    },

    teams: {
      home: {
        id:
          Number(
            home.team?.id || 0
          ),

        name:
          home.team?.displayName ||
          home.team?.name ||
          "Home",

        logo:
          home.team?.logo ||
          home.team?.logos?.[0]
            ?.href ||
          "",
      },

      away: {
        id:
          Number(
            away.team?.id || 0
          ),

        name:
          away.team?.displayName ||
          away.team?.name ||
          "Away",

        logo:
          away.team?.logo ||
          away.team?.logos?.[0]
            ?.href ||
          "",
      },
    },

    goals: {
      home:
        Number.isNaN(homeScore)
          ? null
          : homeScore,

      away:
        Number.isNaN(awayScore)
          ? null
          : awayScore,
    },

    venue:
      competition?.venue
        ? {
            name:
              competition.venue
                .fullName ||
              "",

            city:
              competition.venue
                .address?.city ||
              "",

            country:
              competition.venue
                .address?.country ||
              "",
          }
        : null,

    name:
      event.name ||
      `${home.team?.displayName} at ${away.team?.displayName}`,

    shortName:
      event.shortName || "",

    source: "ESPN",
  };
}

async function fetchLeagueFixtures(
  league: string,
  date: string
) {
  const url =
    `${ESPN_BASE}/${league}/scoreboard` +
    `?dates=${getEspnDate(date)}`;

  console.log(
    `ESPN fetching ${league}:`,
    url
  );

  try {
    const response =
      await fetch(url, {
        method: "GET",

        headers: {
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36",

          Accept:
            "application/json, text/plain, */*",

          "Accept-Language":
            "en-US,en;q=0.9",

          Referer:
            "https://www.espn.com/",

          Origin:
            "https://www.espn.com",
        },

        cache: "no-store",
      });

    console.log(
      `ESPN ${league} HTTP:`,
      response.status
    );

    if (!response.ok) {
      const text =
        await response.text();

      console.error(
        `ESPN ${league} failed:`,
        response.status,
        text.slice(0, 500)
      );

      return [];
    }

    const data =
      await response.json();

    const events =
      Array.isArray(data?.events)
        ? data.events
        : [];

    console.log(
      `ESPN ${league} events:`,
      events.length
    );

    const leagueInfo =
      data?.leagues?.[0] || {
        id: league,
        name: league,
        logos: [],
      };

    const fixtures =
      events
        .map((event: any) =>
          mapEvent(
            event,
            leagueInfo
          )
        )
        .filter(Boolean);

    console.log(
      `ESPN ${league} mapped:`,
      fixtures.length
    );

    return fixtures;
  } catch (error) {
    console.error(
      `ESPN ${league} exception:`,
      error
    );

    return [];
  }
}

async function findFixtureById(
  fixtureId: string
) {
  console.log(
    "Searching ESPN fixture:",
    fixtureId
  );

  /*
   * Search today's scoreboard first.
   * This avoids unnecessary requests.
   */
  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const datesToCheck = [
    today,
  ];

  /*
   * Also check tomorrow because
   * upcoming matches may be there.
   */
  const tomorrow =
    new Date(
      Date.now() +
        24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];

  datesToCheck.push(tomorrow);

  for (const date of datesToCheck) {
    for (const league of SOCCER_LEAGUES) {
      const fixtures =
        await fetchLeagueFixtures(
          league,
          date
        );

      const found =
        fixtures.find(
          (fixture: any) =>
            String(
              fixture.fixture.id
            ) ===
            String(fixtureId)
        );

      if (found) {
        return found;
      }
    }
  }

  return null;
}

export async function GET(
  request: NextRequest
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const endpoint =
      searchParams.get(
        "endpoint"
      ) || "fixtures";

    /*
     * =====================================================
     * FIXTURES
     * =====================================================
     */
    if (
      endpoint === "fixtures"
    ) {
      const id =
        searchParams.get("id");

      /*
       * -----------------------------------------------------
       * SINGLE FIXTURE
       * -----------------------------------------------------
       */
      if (id) {
        const fixture =
          await findFixtureById(id);

        return NextResponse.json({
          response:
            fixture
              ? [fixture]
              : [],

          results:
            fixture ? 1 : 0,

          source: "ESPN",
        });
      }

      /*
       * -----------------------------------------------------
       * FIXTURES FOR DATE
       * -----------------------------------------------------
       */
      const date =
        getDate(
          searchParams.get(
            "date"
          )
        );

      console.log("");
      console.log(
        "================================"
      );
      console.log(
        "ESPN fixtures date:",
        date
      );
      console.log(
        "ESPN date:",
        getEspnDate(date)
      );
      console.log(
        "================================"
      );

      /*
       * Fetch all supported leagues.
       */
      const results =
        await Promise.all(
          SOCCER_LEAGUES.map(
            (league) =>
              fetchLeagueFixtures(
                league,
                date
              )
          )
        );

      const fixtures =
        results.flat();

      console.log(
        "ESPN TOTAL FIXTURES:",
        fixtures.length
      );

      /*
       * -----------------------------------------------------
       * REMOVE DUPLICATES
       * -----------------------------------------------------
       */
      const uniqueFixtures =
        Array.from(
          new Map(
            fixtures.map(
              (fixture: any) => [
                fixture.fixture.id,
                fixture,
              ]
            )
          ).values()
        );

      console.log(
        "ESPN UNIQUE FIXTURES:",
        uniqueFixtures.length
      );

      /*
       * -----------------------------------------------------
       * SORT BY KICKOFF TIME
       * -----------------------------------------------------
       */
      uniqueFixtures.sort(
        (
          a: any,
          b: any
        ) =>
          new Date(
            a.fixture.date
          ).getTime() -
          new Date(
            b.fixture.date
          ).getTime()
      );

      return NextResponse.json(
        {
          response:
            uniqueFixtures,

          results:
            uniqueFixtures.length,

          source: "ESPN",
        },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=30, stale-while-revalidate=60",
          },
        }
      );
    }

    /*
     * =====================================================
     * UNSUPPORTED ENDPOINT
     * =====================================================
     */
    return NextResponse.json(
      {
        error:
          "Unsupported football endpoint",

        source: "ESPN",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "Football API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to fetch football data",

        source: "ESPN",
      },
      {
        status: 500,
      }
    );
  }
}