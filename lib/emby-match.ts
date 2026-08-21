type EmbyItem = {
  Id: string;
  Name: string;
  Type?: string;
  MediaType?: string;
  RunTimeTicks?: number;
};

type Fixture = {
  fixture?: {
    id?: number;
    date?: string;
  };
  teams?: {
    home?: {
      name?: string;
    };
    away?: {
      name?: string;
    };
  };
};

type MatchResult = {
  matched: boolean;
  itemId?: string;
  itemName?: string;
  score: number;
};

function normalize(value: string = "") {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(fc|cf|sc|afc|club|football|soccer)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length >= 3);
}

function tokenMatch(teamName: string, videoName: string) {
  const teamTokens = tokens(teamName);
  const videoTokens = tokens(videoName);

  if (!teamTokens.length || !videoTokens.length) {
    return 0;
  }

  let matched = 0;

  for (const token of teamTokens) {
    if (
      videoTokens.some(
        (videoToken) =>
          videoToken === token ||
          videoToken.includes(token) ||
          token.includes(videoToken)
      )
    ) {
      matched++;
    }
  }

  return matched / teamTokens.length;
}

function extractDates(text: string): string[] {
  const value = text.toLowerCase();

  const dates: string[] = [];

  // YYYY-MM-DD
  const iso = value.match(/\b20\d{2}[-/.]\d{1,2}[-/.]\d{1,2}\b/g);
  if (iso) {
    dates.push(...iso);
  }

  // DD-MM-YYYY / DD-MM-YY
  const european = value.match(
    /\b\d{1,2}[-/.]\d{1,2}[-/.](?:20)?\d{2}\b/g
  );

  if (european) {
    dates.push(...european);
  }

  // DD Month YYYY
  const textual = value.match(
    /\b\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+20\d{2}\b/g
  );

  if (textual) {
    dates.push(...textual);
  }

  return dates;
}

function dateMatches(fixtureDate: string | undefined, itemName: string) {
  if (!fixtureDate) {
    return false;
  }

  const itemDates = extractDates(itemName);

  if (!itemDates.length) {
    return false;
  }

  const date = new Date(fixtureDate);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  const iso = `${year}-${month}-${day}`;
  const european = `${day}-${month}-${year}`;

  return itemDates.some((itemDate) => {
    const normalized = itemDate
      .replace(/\//g, "-")
      .replace(/\./g, "-");

    return (
      normalized.includes(iso) ||
      normalized.includes(european) ||
      normalized.includes(`${day}-${month}-${year.slice(2)}`)
    );
  });
}

export function matchFixtureToEmby(
  fixture: Fixture,
  items: EmbyItem[]
): MatchResult {
  const home = fixture.teams?.home?.name || "";
  const away = fixture.teams?.away?.name || "";
  const fixtureDate = fixture.fixture?.date;

  if (!home || !away) {
    return {
      matched: false,
      score: 0,
    };
  }

  let best: {
    item: EmbyItem;
    score: number;
  } | null = null;

  for (const item of items) {
    if (!item.Id || !item.Name) {
      continue;
    }

    const homeScore = tokenMatch(home, item.Name);
    const awayScore = tokenMatch(away, item.Name);

    /*
     * Both teams need to appear.
     *
     * This prevents a random video containing only one
     * team's name from being selected.
     */
    if (homeScore < 0.5 || awayScore < 0.5) {
      continue;
    }

    let score = ((homeScore + awayScore) / 2) * 100;

    /*
     * Date is an additional signal, not a requirement.
     *
     * Emby often doesn't put the match date in the filename,
     * so requiring it would incorrectly reject valid matches.
     */
    if (dateMatches(fixtureDate, item.Name)) {
      score += 20;
    }

    if (!best || score > best.score) {
      best = {
        item,
        score,
      };
    }
  }

  /*
   * Require a strong match.
   */
  if (!best || best.score < 70) {
    return {
      matched: false,
      score: best?.score ?? 0,
    };
  }

  return {
    matched: true,
    itemId: best.item.Id,
    itemName: best.item.Name,
    score: Math.round(best.score),
  };
}