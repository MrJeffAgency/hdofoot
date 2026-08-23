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

const THESPORTSDB_BASE =
  "https://www.thesportsdb.com/api/v1/json/3";

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
/* FETCH ONE ESPN LEAGUE */
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

  const controller =
    new AbortController();

  /*
   * Prevent one blocked ESPN request
   * from hanging the entire homepage.
   */
  const timeout =
    setTimeout(() => {
      controller.abort();
    }, 5000);

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

        signal:
          controller.signal,
      });

    console.log(
      `ESPN ${league} HTTP:`,
      response.status
    );

    /*
     * ESPN frequently returns 403 for some
     * soccer league endpoints.
     *
     * Treat 403 as an unavailable source,
     * not as an application error.
     */
    if (!response.ok) {
      if (response.status !== 403) {
        const text =
          await response.text();

        console.warn(
          `ESPN ${league} failed:`,
          response.status,
          text.slice(0, 300)
        );
      }

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
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      console.warn(
        `ESPN ${league} timed out after 5 seconds`
      );
    } else {
      console.warn(
        `ESPN ${league} exception:`,
        error
      );
    }

    return [];

  } finally {
    clearTimeout(timeout);
  }
}

/* ---------------------------------------------------------- */
/* THESPORTSDB STATUS */
/* ---------------------------------------------------------- */

function mapSportsDBStatus(event: any) {
  const status =
    String(event?.strStatus || "")
      .toLowerCase();

  const progress =
    String(event?.strProgress || "")
      .toLowerCase();

  if (
    status.includes("postponed") ||
    status.includes("cancelled")
  ) {
    return {
      long:
        event?.strStatus ||
        "Postponed",
      short: "PST",
      elapsed: null,
    };
  }

  if (
    status === "match finished" ||
    status === "finished" ||
    progress === "final"
  ) {
    return {
      long: "Match finished",
      short: "FT",
      elapsed: null,
    };
  }

  if (
    status.includes("half") ||
    progress.includes("half")
  ) {
    return {
      long: "Halftime",
      short: "HT",
      elapsed: null,
    };
  }

  if (
    status.includes("live") ||
    status.includes("in play") ||
    progress.includes("st") ||
    progress.includes("nd")
  ) {
    let elapsed: number | null =
      null;

    const match =
      progress.match(/^(\d+)/);

    if (match) {
      elapsed = Number(match[1]);
    }

    return {
      long:
        "Match in progress",
      short: "LIVE",
      elapsed,
    };
  }

  return {
    long: "Scheduled",
    short: "NS",
    elapsed: null,
  };
}

/* ---------------------------------------------------------- */
/* NORMALIZE THESPORTSDB EVENT */
/* ---------------------------------------------------------- */

function normalizeSportsDBEvent(
  event: any
) {
  if (
    !event?.idEvent ||
    !event?.strHomeTeam ||
    !event?.strAwayTeam
  ) {
    return null;
  }

  const date =
    event?.dateEvent || "";

  const time =
    event?.strTime ||
    "00:00:00";

  const eventDate =
    date
      ? `${date}T${time}`
      : new Date().toISOString();

  const homeScore =
    event?.intHomeScore !== null &&
    event?.intHomeScore !== undefined &&
    event?.intHomeScore !== ""
      ? Number(
          event.intHomeScore
        )
      : null;

  const awayScore =
    event?.intAwayScore !== null &&
    event?.intAwayScore !== undefined &&
    event?.intAwayScore !== ""
      ? Number(
          event.intAwayScore
        )
      : null;

  return {
    fixture: {
      /*
       * Prefix the ID so it cannot
       * accidentally collide with
       * an ESPN fixture ID.
       */
      id: Number(
        `9${String(
          event.idEvent
        )}`
      ),

      date: eventDate,

      status:
        mapSportsDBStatus(event),
    },

    league: {
      id:
        String(
          event?.idLeague ||
          "sportsdb"
        ),

      name:
        event?.strLeague ||
        "Football",

      logo:
        event?.strLeagueBadge ||
        "",
    },

    teams: {
      home: {
        id: Number(
          event?.idHomeTeam ||
          0
        ),

        name:
          event?.strHomeTeam ||
          "Home",

        logo:
          event?.strHomeTeamBadge ||
          "",

        winner:
          homeScore !== null &&
          awayScore !== null
            ? homeScore > awayScore
            : null,
      },

      away: {
        id: Number(
          event?.idAwayTeam ||
          0
        ),

        name:
          event?.strAwayTeam ||
          "Away",

        logo:
          event?.strAwayTeamBadge ||
          "",

        winner:
          homeScore !== null &&
          awayScore !== null
            ? awayScore > homeScore
            : null,
      },
    },

    goals: {
      home: homeScore,
      away: awayScore,
    },
  };
}

/* ---------------------------------------------------------- */
/* FETCH THESPORTSDB */
/* ---------------------------------------------------------- */

async function fetchSportsDBFixtures(
  date: string
) {
  const url =
    `${THESPORTSDB_BASE}/eventsday.php` +
    `?d=${encodeURIComponent(date)}` +
    `&s=Soccer`;

  console.log(
    "TheSportsDB fetching:",
    url
  );

  try {
    const response =
      await fetch(url, {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },

        cache: "no-store",
      });

    console.log(
      "TheSportsDB HTTP:",
      response.status
    );

    if (!response.ok) {
      const text =
        await response.text();

      console.warn(
        "TheSportsDB failed:",
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
      "TheSportsDB events:",
      events.length
    );

    const fixtures =
      events
        .filter(
          (event: any) =>
            String(
              event?.strSport || ""
            ).toLowerCase() ===
            "soccer"
        )
        .map(
          (event: any) =>
            normalizeSportsDBEvent(
              event
            )
        )
        .filter(Boolean);

    console.log(
      "TheSportsDB mapped:",
      fixtures.length
    );

    return fixtures;

  } catch (error) {
    console.warn(
      "TheSportsDB exception:",
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
   * ESPN remains the PRIMARY source.
   *
   * Requests stay sequential to reduce
   * rate limiting and 403 responses.
   */

  for (
    const league of ESPN_LEAGUES
  ) {
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
   * TheSportsDB is the FALLBACK.
   *
   * It is used when ESPN returns
   * absolutely no fixtures.
   */

  if (
    allFixtures.length === 0
  ) {
    console.log(
      "ESPN returned 0 fixtures. Trying TheSportsDB fallback..."
    );

    const sportsDBFixtures =
      await fetchSportsDBFixtures(
        date
      );

    allFixtures.push(
      ...sportsDBFixtures
    );
  }

  /*
   * Remove duplicate fixture IDs.
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

  console.log(
    `Total football fixtures: ${uniqueFixtures.length}`
  );

  return uniqueFixtures;
}
