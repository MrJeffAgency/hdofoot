const ESPN_LEAGUES = [
  "eng.1",              // Premier League
  "esp.1",              // La Liga
  "ita.1",              // Serie A
  "ger.1",              // Bundesliga
  "fra.1",              // Ligue 1
  "ned.1",              // Eredivisie
  "por.1",              // Primeira Liga
  "bel.1",              // Belgian Pro League
  "sco.1",              // Scottish Premiership
  "tur.1",              // Turkish Super Lig
  "uefa.champions",     // Champions League
  "uefa.europa",        // Europa League
  "uefa.europa.conf",   // Conference League
];

const ESPN_BASE =
  "https://site.api.espn.com/apis/site/v2/sports/soccer";

/* ---------------------------------------------------------- */
/* STATUS */
/* ---------------------------------------------------------- */

function mapStatus(event: any) {
  const status = event?.status;

  if (!status) {
    return {
      long: "Scheduled",
      short: "NS",
      elapsed: null,
    };
  }

  const typeName =
    status.type?.name || "";

  const state =
    status.type?.state || "";

  /*
   * ESPN uses:
   * state = pre  -> upcoming
   * state = in   -> live
   * state = post -> finished
   */

  if (state === "in") {
    if (
      typeName.includes("HALFTIME") ||
      typeName.includes("HALF")
    ) {
      return {
        long: "Halftime",
        short: "HT",
        elapsed: null,
      };
    }

    /*
     * ESPN displayClock can sometimes be:
     * "45:00"
     * "12:34"
     *
     * We do not want to turn that into a
     * misleading football minute.
     */

    let elapsed: number | null = null;

    if (
      typeof status.displayClock === "string"
    ) {
      const match =
        status.displayClock.match(/^(\d+)/);

      if (match) {
        elapsed = Number(match[1]);
      }
    }

    return {
      long: "Match in progress",
      short: "LIVE",
      elapsed,
    };
  }

  if (state === "post") {
    return {
      long: "Match finished",
      short: "FT",
      elapsed: null,
    };
  }

  return {
    long: "Scheduled",
    short: "NS",
    elapsed: null,
  };
}

/* ---------------------------------------------------------- */
/* NORMALIZE ESPN EVENT */
/* ---------------------------------------------------------- */

function normalizeEvent(
  event: any,
  leagueCode: string
) {
  const competition =
    event?.competitions?.[0];

  if (!competition) {
    return null;
  }

  const competitors =
    Array.isArray(
      competition.competitors
    )
      ? competition.competitors
      : [];

  const home =
    competitors.find(
      (team: any) =>
        team?.homeAway === "home"
    ) || competitors[0];

  const away =
    competitors.find(
      (team: any) =>
        team?.homeAway === "away"
    ) || competitors[1];

  if (!home || !away) {
    return null;
  }

  const homeScore =
    home?.score !== undefined &&
    home?.score !== null
      ? Number(home.score)
      : null;

  const awayScore =
    away?.score !== undefined &&
    away?.score !== null
      ? Number(away.score)
      : null;

  const leagueName =
    event?.league?.name ||
    event?.season?.name ||
    leagueCode;

  const leagueLogo =
    event?.league?.logo ||
    competition?.league?.logo ||
    "";

  return {
    fixture: {
      id: Number(event.id),
      date: event.date,
      status: mapStatus(event),
    },

    league: {
      id: leagueCode,
      name: leagueName,
      logo: leagueLogo,
    },

    teams: {
      home: {
        id: Number(
          home?.team?.id || 0
        ),
        name:
          home?.team?.displayName ||
          home?.team?.name ||
          "Home",
        logo:
          home?.team?.logo ||
          "",
        winner:
          home?.winner ?? null,
      },

      away: {
        id: Number(
          away?.team?.id || 0
        ),
        name:
          away?.team?.displayName ||
          away?.team?.name ||
          "Away",
        logo:
          away?.team?.logo ||
          "",
        winner:
          away?.winner ?? null,
      },
    },

    goals: {
      home: homeScore,
      away: awayScore,
    },
  };
}

/* ---------------------------------------------------------- */
/* FETCH ONE LEAGUE */
/* ---------------------------------------------------------- */

async function fetchLeagueFixtures(
  league: string,
  date: string
) {
  const espnDate =
    date.replace(/-/g, "");

  const url =
    `${ESPN_BASE}/${league}/scoreboard` +
    `?dates=${espnDate}`;

  console.log(
    `ESPN fetching ${league}:`,
    url
  );

  try {
    const response = await fetch(
      url,
      {
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

        /*
         * We want fresh football data.
         */
        cache: "no-store",
      }
    );

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
        text.slice(0, 300)
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

    const fixtures =
      events
        .map((event: any) =>
          normalizeEvent(
            event,
            league
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

/* ---------------------------------------------------------- */
/* GET ALL FIXTURES */
/* ---------------------------------------------------------- */

export async function getFixtures(
  date: string
) {
  const allFixtures: any[] = [];

  /*
   * IMPORTANT:
   *
   * Do not use Promise.all() here.
   *
   * ESPN can return 403 when many league
   * scoreboard requests hit the endpoint
   * simultaneously.
   *
   * Sequential requests are slower but much
   * more reliable for this server-side route.
   */

  for (const league of ESPN_LEAGUES) {
    const fixtures =
      await fetchLeagueFixtures(
        league,
        date
      );

    allFixtures.push(
      ...fixtures
    );
  }

  /*
   * Remove accidental duplicate fixture IDs.
   */

  const uniqueFixtures =
    Array.from(
      new Map(
        allFixtures.map(
          (fixture: any) => [
            fixture.fixture.id,
            fixture,
          ]
        )
      ).values()
    );

  /*
   * Sort chronologically.
   */

  uniqueFixtures.sort(
    (a: any, b: any) =>
      new Date(
        a.fixture.date
      ).getTime() -
      new Date(
        b.fixture.date
      ).getTime()
  );

  console.log(
    `ESPN total fixtures: ${uniqueFixtures.length}`
  );

  return uniqueFixtures;
}