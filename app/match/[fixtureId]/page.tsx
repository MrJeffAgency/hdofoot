import Link from "next/link";
import Icon from "@/components/Icons";

interface PageProps {
  params: Promise<{
    fixtureId: string;
  }>;
}

interface FixtureData {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };

  league: {
    id: number;
    name: string;
    logo?: string;
  };

  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };

  goals: {
    home: number | null;
    away: number | null;
  };

  venue?: {
    name?: string;
    city?: string;
    country?: string;
  } | null;

  name?: string;
  shortName?: string;
  source?: string;
}

const LIVE_STATUSES = [
  "1H",
  "HT",
  "2H",
  "ET",
  "P",
  "LIVE",
  "BT",
];

const FINISHED_STATUSES = [
  "FT",
  "AET",
  "PEN",
];

export default async function MatchPage({
  params,
}: PageProps) {
  const { fixtureId } = await params;

  let fixture: FixtureData | null = null;
  let error: string | null = null;

  try {
    /*
     * Use the same-origin API route.
     *
     * This avoids depending on NEXT_PUBLIC_SITE_URL,
     * VERCEL_URL, or localhost from the server component.
     */
    const response = await fetch(
      `http://127.0.0.1:3000/api/football?endpoint=fixtures&id=${encodeURIComponent(
        fixtureId
      )}`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
          "Failed to load match information."
      );
    }

    if (
      !Array.isArray(data?.response) ||
      data.response.length === 0
    ) {
      throw new Error("Match not found.");
    }

    fixture = data.response[0] as FixtureData;
  } catch (err) {
    console.error("Match page error:", err);

    error =
      err instanceof Error
        ? err.message
        : "Unable to load match information.";
  }

  if (error || !fixture) {
    return (
      <main className="min-h-screen w-full bg-[#07090d] text-white">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-[1200px] items-center justify-center px-4 py-10">
          <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-[#0d1118] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <Icon name="football" size={24} />
            </div>

            <p className="mt-5 text-xl font-black">
              Match unavailable
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error ||
                "We couldn't find this football match."}
            </p>

            <Link
              href="/"
              className="tv-focus tv-nav-item mt-6 inline-flex rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-green-400"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const {
    fixture: match,
    league,
    teams,
    goals,
    venue,
  } = fixture;

  const isLive = LIVE_STATUSES.includes(
    match.status.short
  );

  const isFinished = FINISHED_STATUSES.includes(
    match.status.short
  );

  const isUpcoming =
    match.status.short === "NS" ||
    match.status.short === "TBD";

  const kickoff = new Date(match.date);

  const kickoffDate =
    kickoff.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const kickoffTime =
    kickoff.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const statusText = getStatusText(
    match.status.short
  );

  return (
    <main className="min-h-screen w-full bg-[#07090d] text-white">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">

        {/* BACK */}

        <div className="mb-6">
          <Link
            href="/"
            className="tv-focus tv-nav-item inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            <span>←</span>
            Home
          </Link>
        </div>

        {/* PAGE HEADER */}

        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-green-400">
            HDOFOOT
          </p>

          <h1 className="mt-2 text-2xl font-black sm:text-3xl">
            Match Center
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Follow this match with HDOFOOT.
          </p>
        </div>

        {/* MATCH CARD */}

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1118]">

          {/* LEAGUE HEADER */}

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">

            <div className="flex min-w-0 items-center gap-3">

              {league.logo && (
                <img
                  src={league.logo}
                  alt=""
                  className="h-8 w-8 shrink-0 object-contain"
                />
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {league.name}
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  {fixture.source || "ESPN"}
                </p>
              </div>

            </div>

            <MatchStatus
              isLive={isLive}
              isFinished={isFinished}
              isUpcoming={isUpcoming}
              status={statusText}
              elapsed={match.status.elapsed}
            />

          </div>

          {/* TEAMS */}

          <div className="px-5 py-10 sm:px-8 sm:py-14">

            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-8">

              <TeamBlock
                name={teams.home.name}
                logo={teams.home.logo}
                align="left"
              />

              <div className="min-w-[90px] text-center sm:min-w-[150px]">

                {isUpcoming ? (
                  <>
                    <p className="text-3xl font-black sm:text-4xl">
                      {kickoffTime}
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                      {kickoffDate}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-3 sm:gap-5">

                      <span className="text-4xl font-black sm:text-6xl">
                        {goals.home ?? 0}
                      </span>

                      <span className="text-xl font-bold text-gray-600">
                        -
                      </span>

                      <span className="text-4xl font-black sm:text-6xl">
                        {goals.away ?? 0}
                      </span>

                    </div>

                    <p
                      className={`mt-3 text-xs font-bold ${
                        isLive
                          ? "text-green-400"
                          : "text-gray-500"
                      }`}
                    >
                      {isLive
                        ? match.status.elapsed !== null
                          ? `${statusText} • ${match.status.elapsed}'`
                          : statusText
                        : isFinished
                          ? "FULL TIME"
                          : statusText}
                    </p>
                  </>
                )}

              </div>

              <TeamBlock
                name={teams.away.name}
                logo={teams.away.logo}
                align="right"
              />

            </div>

          </div>

          {/* MATCH INFORMATION */}

          <div className="grid border-t border-white/10 sm:grid-cols-3">

            <MetaItem
              label="Date"
              value={kickoffDate}
            />

            <MetaItem
              label="Kickoff"
              value={kickoffTime}
            />

            <MetaItem
              label="Status"
              value={match.status.long}
            />

          </div>

        </section>

        {/* OFFICIAL WATCH */}

        <section className="mt-6 rounded-3xl border border-green-500/20 bg-green-500/5 p-6 sm:p-7">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
              <Icon
                name="liveDot"
                size={22}
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                Official viewing
              </p>

              <h2 className="mt-1 text-xl font-black">
                Watch this match officially
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                HDOFOOT provides the match
                information and fixture details.
                Watch the actual match through
                an official broadcaster or
                streaming service available in
                your country.
              </p>
            </div>

          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">

            <p className="text-sm font-semibold text-gray-300">
              Official broadcaster
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Broadcast availability depends on
              your country, competition and
              subscription.
            </p>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-4">

              <p className="text-sm font-semibold text-gray-300">
                No verified broadcaster link yet
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                When we have a verified official
                broadcaster URL for this match,
                it can be displayed here.
              </p>

            </div>

          </div>

        </section>

        {/* VENUE */}

        {venue?.name && (
          <section className="mt-6 rounded-3xl border border-white/10 bg-[#0d1118] p-6 sm:p-7">

            <p className="text-xs font-bold uppercase tracking-widest text-green-400">
              Venue
            </p>

            <h2 className="mt-2 text-xl font-black">
              {venue.name}
            </h2>

            {(venue.city || venue.country) && (
              <p className="mt-1 text-sm text-gray-500">
                {[venue.city, venue.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}

          </section>
        )}

        {/* MATCH ID */}

        <div className="mt-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-700">
            HDOFOOT Match ID
          </p>

          <p className="mt-1 text-xs text-gray-700">
            {match.id}
          </p>
        </div>

      </div>
    </main>
  );
}

/* ---------------------------------------------------------- */
/* TEAM */
/* ---------------------------------------------------------- */

function TeamBlock({
  name,
  logo,
  align,
}: {
  name: string;
  logo: string;
  align: "left" | "right";
}) {
  return (
    <div
      className={`min-w-0 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      <div
        className={`flex items-center gap-3 ${
          align === "right"
            ? "flex-row-reverse"
            : ""
        }`}
      >

        <img
          src={logo}
          alt={name}
          className="h-14 w-14 shrink-0 object-contain sm:h-24 sm:w-24"
        />

        <p className="min-w-0 truncate text-sm font-black leading-tight text-gray-200 sm:text-lg">
          {name}
        </p>

      </div>
    </div>
  );
}

/* ---------------------------------------------------------- */
/* STATUS */
/* ---------------------------------------------------------- */

function MatchStatus({
  isLive,
  isFinished,
  isUpcoming,
  status,
  elapsed,
}: {
  isLive: boolean;
  isFinished: boolean;
  isUpcoming: boolean;
  status: string;
  elapsed: number | null;
}) {
  if (isLive) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-400">

        <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

        {elapsed !== null
          ? `${status} • ${elapsed}'`
          : status}

      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-400">
        {status}
      </div>
    );
  }

  if (isUpcoming) {
    return (
      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-400">
        UPCOMING
      </div>
    );
  }

  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-400">
      {status}
    </div>
  );
}

/* ---------------------------------------------------------- */
/* META */
/* ---------------------------------------------------------- */

function MetaItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-white/10 px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">

      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-300">
        {value}
      </p>

    </div>
  );
}

/* ---------------------------------------------------------- */
/* STATUS TEXT */
/* ---------------------------------------------------------- */

function getStatusText(status: string) {
  switch (status) {
    case "NS":
      return "Not Started";

    case "TBD":
      return "To Be Determined";

    case "1H":
      return "First Half";

    case "HT":
      return "Half Time";

    case "2H":
      return "Second Half";

    case "ET":
      return "Extra Time";

    case "BT":
      return "Break Time";

    case "P":
      return "Penalty Shootout";

    case "LIVE":
      return "Live";

    case "FT":
      return "Full Time";

    case "AET":
      return "After Extra Time";

    case "PEN":
      return "After Penalties";

    case "PST":
      return "Postponed";

    case "CANC":
      return "Cancelled";

    case "ABD":
      return "Abandoned";

    default:
      return status;
  }
} 