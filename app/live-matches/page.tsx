import Link from "next/link";
import Icon from "@/components/Icons";
import { getFixtures } from "@/lib/football";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const LIVE_STATUSES = [
  "1H",
  "HT",
  "2H",
  "ET",
  "P",
  "LIVE",
];

const UPCOMING_STATUSES = [
  "NS",
  "TBD",
];

export default async function LiveMatchesPage() {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const fixtures = await getFixtures(today);

  const liveFixtures = fixtures.filter(
    (fixture: any) =>
      LIVE_STATUSES.includes(
        fixture.fixture.status.short
      )
  );

  return (
    <main className="min-h-screen w-full bg-[#07090d] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 pb-28 sm:px-5 md:px-6 lg:px-8 lg:pb-10">

        {/* HEADER */}

        <div className="mb-8">

          <Link
            href="/"
            className="
              tv-focus
              tv-nav-item
              mb-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-2.5
              text-sm
              font-semibold
              text-gray-300
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <span>←</span>
            Home
          </Link>

          <p className="text-xs font-bold uppercase tracking-widest text-green-400">
            HDOFOOT LIVE
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Live Matches
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Follow football matches that are happening
            right now.
          </p>

        </div>

        {/* LIVE STATUS */}

        <div className="mb-6 flex items-center gap-3">

          <span
            className={`h-2.5 w-2.5 rounded-full ${
              liveFixtures.length > 0
                ? "animate-pulse bg-green-400"
                : "bg-gray-600"
            }`}
          />

          <span
            className={`text-sm font-bold ${
              liveFixtures.length > 0
                ? "text-green-400"
                : "text-gray-500"
            }`}
          >
            {liveFixtures.length > 0
              ? `${liveFixtures.length} LIVE ${
                  liveFixtures.length === 1
                    ? "MATCH"
                    : "MATCHES"
                }`
              : "NO LIVE MATCHES"}
          </span>

        </div>

        {/* LIVE MATCHES */}

        {liveFixtures.length > 0 ? (
          <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">

            {liveFixtures.map(
              (fixture: any) => (
                <LiveMatchCard
                  key={fixture.fixture.id}
                  fixture={fixture}
                />
              )
            )}

          </div>
        ) : (
          <EmptyLiveState />
        )}

      </div>
    </main>
  );
}

/* ---------------------------------------------------------- */
/* LIVE MATCH CARD */
/* ---------------------------------------------------------- */

function LiveMatchCard({
  fixture,
}: {
  fixture: any;
}) {
  const status =
    fixture.fixture.status;

  const homeScore =
    fixture.goals?.home ?? 0;

  const awayScore =
    fixture.goals?.away ?? 0;

  return (
    <Link
      href={`/match/${fixture.fixture.id}`}
      className="
        tv-focus
        tv-nav-item
        block
        rounded-2xl
        border
        border-green-500/20
        bg-[#0d1118]
        p-5
        transition
        hover:border-green-500/40
        hover:bg-[#10161f]
      "
    >

      {/* LEAGUE */}

      <div className="mb-5 flex items-center justify-between gap-3">

        <div className="flex min-w-0 items-center gap-2">

          {fixture.league?.logo ? (
            <img
              src={fixture.league.logo}
              alt=""
              className="h-6 w-6 shrink-0 object-contain"
            />
          ) : (
            <div className="h-6 w-6 shrink-0 rounded-full bg-white/5" />
          )}

          <span className="truncate text-xs font-semibold text-gray-500">
            {fixture.league?.name ||
              "Football"}
          </span>

        </div>

        {/* LIVE */}

        <span className="flex shrink-0 items-center gap-1.5 text-xs font-black text-green-400">

          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

          LIVE
        </span>

      </div>

      {/* TEAMS */}

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">

        {/* HOME */}

        <Team
          name={
            fixture.teams?.home?.name ||
            "Home"
          }
          logo={
            fixture.teams?.home?.logo ||
            ""
          }
          score={homeScore}
          align="left"
        />

        {/* SCORE */}

        <div className="min-w-[80px] text-center">

          <div className="flex items-center justify-center gap-2">

            <span className="text-3xl font-black">
              {homeScore}
            </span>

            <span className="text-lg font-bold text-gray-600">
              -
            </span>

            <span className="text-3xl font-black">
              {awayScore}
            </span>

          </div>

          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-green-400">
            {status.elapsed
              ? `${status.elapsed}'`
              : status.short}
          </p>

        </div>

        {/* AWAY */}

        <Team
          name={
            fixture.teams?.away?.name ||
            "Away"
          }
          logo={
            fixture.teams?.away?.logo ||
            ""
          }
          score={awayScore}
          align="right"
        />

      </div>

      {/* MATCH CENTER */}

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">

        <span className="text-xs text-gray-600">
          {fixture.venue?.name ||
            "Live football"}
        </span>

        <span className="text-xs font-bold text-green-400">
          Match Center →
        </span>

      </div>

    </Link>
  );
}

/* ---------------------------------------------------------- */
/* TEAM */
/* ---------------------------------------------------------- */

function Team({
  name,
  logo,
  score,
  align,
}: {
  name: string;
  logo: string;
  score: number;
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
        className={`flex items-center gap-2 ${
          align === "right"
            ? "flex-row-reverse"
            : ""
        }`}
      >

        {logo ? (
          <img
            src={logo}
            alt={name}
            className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-green-400 sm:h-12 sm:w-12">
            <Icon
              name="football"
              size={18}
            />
          </div>
        )}

        <p className="min-w-0 truncate text-sm font-bold text-gray-200">
          {name}
        </p>

      </div>

    </div>
  );
}

/* ---------------------------------------------------------- */
/* EMPTY STATE */
/* ---------------------------------------------------------- */

function EmptyLiveState() {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0d1118] px-6 py-16 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-gray-500">
        <Icon
          name="football"
          size={28}
        />
      </div>

      <h2 className="mt-5 text-2xl font-black">
        No live matches right now
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        There are currently no football matches
        being played. Check again when matches
        go live.
      </p>

      <Link
        href="/fixtures"
        className="
          tv-focus
          tv-nav-item
          mt-6
          inline-flex
          rounded-xl
          border
          border-white/10
          bg-white/5
          px-5
          py-3
          text-sm
          font-bold
          text-gray-300
          transition
          hover:bg-white/10
          hover:text-white
        "
      >
        View Upcoming Fixtures
      </Link>

    </div>
  );
}