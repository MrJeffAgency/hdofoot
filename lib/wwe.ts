const API_KEY = process.env.THESPORTSDB_API_KEY || "123";

const BASE_URL =
  `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

const WWE_LEAGUE_ID = "4444";

const WWE_FALLBACK_IMAGE =
  "https://r2.thesportsdb.com/images/media/league/badge/ywtxyv1453504109.png";

export interface WWEEvent {
  idEvent: string;
  strEvent: string | null;
  strLeague: string | null;
  strSport: string | null;
  dateEvent: string | null;
  strTime: string | null;
  strVenue: string | null;
  strCity: string | null;
  strCountry: string | null;
  strThumb: string | null;
  strPoster: string | null;
  strFanart?: string | null;
  strBanner?: string | null;
  strDescriptionEN: string | null;
  strStatus: string | null;
  strHomeTeam: string | null;
  strAwayTeam: string | null;
  intHomeScore: string | null;
  intAwayScore: string | null;
}

interface EventsResponse {
  events?: WWEEvent[] | null;
}

async function sportsDB<T>(
  endpoint: string,
  revalidate = 600
): Promise<T> {
  const response = await fetch(
    `${BASE_URL}/${endpoint}`,
    {
      next: {
        revalidate,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `TheSportsDB error: ${response.status}`
    );
  }

  return response.json();
}

function addFallbackImage(event: WWEEvent): WWEEvent {
  return {
    ...event,

    strThumb:
      event.strThumb ||
      event.strPoster ||
      event.strFanart ||
      event.strBanner ||
      WWE_FALLBACK_IMAGE,

    strPoster:
      event.strPoster ||
      event.strThumb ||
      event.strFanart ||
      event.strBanner ||
      WWE_FALLBACK_IMAGE,
  };
}

/**
 * Get upcoming WWE events from TheSportsDB.
 */
export async function getWWEEvents(): Promise<WWEEvent[]> {
  try {
    const data = await sportsDB<EventsResponse>(
      `eventsnextleague.php?id=${WWE_LEAGUE_ID}`
    );

    return (data.events ?? []).map(addFallbackImage);
  } catch (error) {
    console.error("getWWEEvents:", error);
    return [];
  }
}

/**
 * Get one WWE event.
 */
export async function getWWEEvent(
  id: string
): Promise<WWEEvent | null> {
  try {
    const data = await sportsDB<EventsResponse>(
      `lookupevent.php?id=${encodeURIComponent(id)}`
    );

    const event = data.events?.[0];

    return event ? addFallbackImage(event) : null;
  } catch (error) {
    console.error("getWWEEvent:", error);
    return null;
  }
}