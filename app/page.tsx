import Link from "next/link";
import Icon from "@/components/Icons";
import { getFixtures } from "@/lib/football";
import GoogleAd from "@/components/GoogleAd";
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

export default async function HomePage() {
  const today = new Date().toISOString().split("T")[0];

  const fixtures = await getFixtures(today);

  const liveFixtures = fixtures.filter((fixture: any) =>
    LIVE_STATUSES.includes(fixture.fixture.status.short)
  );

  const upcomingFixtures = fixtures
    .filter((fixture: any) =>
      UPCOMING_STATUSES.includes(fixture.fixture.status.short)
    )
    .slice(0, 6);

  const leagueCount = new Set(
    fixtures.map((fixture: any) => fixture.league?.id)
  ).size;

  return (
    <main className="min-h-screen w-full bg-[#07090d] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-5 md:px-6 lg:px-8">

        {/* HERO */}
        <section className="relative min-h-[430px] w-full overflow-hidden rounded-3xl border border-white/10">

          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/football-hero.jpg')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#05070a] via-[#05070a]/80 to-[#05070a]/30" />

          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07090d] to-transparent" />

          <div className="relative z-10 flex min-h-[430px] items-center p-6 sm:p-8 md:p-10 lg:p-14">
            <div className="w-full max-w-2xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-green-400 backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Live Football
              </div>

              <h1 className="text-4xl font-black leading-none tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Football.
                <br />
                <span className="text-green-400">
                  Live & Connected.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-6 text-gray-300 md:text-base">
                Follow live scores, fixtures, results, leagues and your
                favorite teams in one place.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                {/* ESPN LIVE MATCHES */}
                <Link
                  href="/live-matches"
                  className="tv-focus tv-nav-item rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-black shadow-lg shadow-green-500/20 transition hover:bg-green-400"
                >
                  Watch Live Matches
                </Link>

                {/* FIXTURES */}
                <Link
                  href="/fixtures"
                  className="tv-focus tv-nav-item rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  View Fixtures
                </Link>

              </div>

            </div>
          </div>
        </section>

        {/* TODAY'S FOOTBALL */}
        <section className="mt-10 w-full">

          <div className="mb-5 flex items-end justify-between gap-4">

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                HDOFOOT
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Today&apos;s Football
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Live statistics from today&apos;s football matches.
              </p>
            </div>

            <Link
              href="/fixtures"
              className="tv-focus tv-nav-item shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-green-400 hover:text-green-300"
            >
              See all →
            </Link>

          </div>

          {/* STATISTICS */}
          <div className="grid w-full gap-4 md:grid-cols-3">

            <InfoCard
              icon="liveDot"
              title="Live Matches"
              value={String(liveFixtures.length)}
              description={
                liveFixtures.length > 0
                  ? "Matches happening right now"
                  : "No live matches right now"
              }
            />

            <InfoCard
              icon="calendar"
              title="Today's Matches"
              value={String(fixtures.length)}
              description="Real fixtures from ESPN"
            />

            <InfoCard
              icon="trophy"
              title="Top Leagues"
              value={String(leagueCount)}
              description="Competitions playing today"
            />

          </div>
        </section>

        {/* ESPN LIVE NOW */}
        <section className="mt-10 w-full">

          <div className="mb-5 flex items-center justify-between gap-4">

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                HDOFOOT LIVE
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Live Now
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Follow real matches and open the Match Center for details.
              </p>
            </div>

            {/* ESPN LIVE MATCHES */}
            <Link
              href="/live-matches"
              className="tv-focus tv-nav-item shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-green-400 hover:text-green-300"
            >
              See all →
            </Link>

          </div>

          {liveFixtures.length > 0 ? (
            <div className="grid w-full gap-4 md:grid-cols-2">

              {liveFixtures.slice(0, 6).map((fixture: any) => (
                <MatchCard
                  key={fixture.fixture.id}
                  fixture={fixture}
                />
              ))}

            </div>
          ) : (
            <EmptyState
              title="No live matches right now"
              description="When a match goes live, it will appear here."
            />
          )}

        </section>

        {/* UPCOMING MATCHES */}
        <section className="mt-10 w-full">

          <div className="mb-5 flex items-center justify-between gap-4">

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                HDOFOOT FIXTURES
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Upcoming Matches
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Real upcoming football matches.
              </p>
            </div>

            <Link
              href="/fixtures"
              className="tv-focus tv-nav-item shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-green-400 hover:text-green-300"
            >
              See all →
            </Link>

          </div>

          {upcomingFixtures.length > 0 ? (
            <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">

              {upcomingFixtures.map((fixture: any) => (
                <MatchCard
                  key={fixture.fixture.id}
                  fixture={fixture}
                />
              ))}

            </div>
          ) : (
            <EmptyState
              title="No upcoming matches"
              description="There are no upcoming matches available for today."
            />
          )}

        </section>

      </div>
    </main>
  );
}

/* ---------------------------------------------------------- */
/* INFO CARD */
/* ---------------------------------------------------------- */

function InfoCard({
  icon,
  title,
  value,
  description,
}: {
  icon: "liveDot" | "calendar" | "trophy";
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="group w-full rounded-2xl border border-white/10 bg-[#0d1118] p-5 transition hover:border-green-500/30 hover:bg-[#10161f]">

      <div className="flex items-center gap-3">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-green-400">
          <Icon name={icon} size={21} />
        </div>

        <p className="text-sm font-semibold text-gray-300">
          {title}
        </p>

      </div>

      <p className="mt-5 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>

    </div>
  );
}

/* ---------------------------------------------------------- */
/* MATCH CARD */
/* ---------------------------------------------------------- */

function MatchCard({
  fixture,
}: {
  fixture: any;
}) {
  const status = fixture.fixture.status;

  const isLive = LIVE_STATUSES.includes(status.short);

  const time = new Date(
    fixture.fixture.date
  ).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const leagueName =
    fixture.league?.name || "Football";

  const leagueLogo =
    fixture.league?.logo || "";

  const homeScore =
    fixture.goals?.home;

  const awayScore =
    fixture.goals?.away;

  return (
    <Link
      href={`/match/${fixture.fixture.id}`}
      className="tv-focus tv-nav-item block w-full rounded-2xl border border-white/10 bg-[#0d1118] p-5 transition hover:border-green-500/30 hover:bg-[#10161f]"
    >

      {/* TOP */}
      <div className="mb-4 flex items-center justify-between gap-3">

        <div className="flex min-w-0 items-center gap-2">

          {leagueLogo ? (
            <img
              src={leagueLogo}
              alt=""
              className="h-5 w-5 shrink-0 object-contain"
            />
          ) : (
            <div className="h-5 w-5 shrink-0 rounded-full bg-white/5" />
          )}

          <span className="truncate text-xs text-gray-500">
            {leagueName}
          </span>

        </div>

        {isLive ? (
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-green-400">

            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

            LIVE
            {status.elapsed
              ? ` ${status.elapsed}'`
              : ""}

          </span>
        ) : (
          <span className="shrink-0 text-xs text-gray-500">
            {time}
          </span>
        )}

      </div>

      {/* TEAMS */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">

        <Team
          name={fixture.teams.home.name}
          logo={fixture.teams.home.logo}
          score={homeScore}
          align="left"
        />

        <div className="text-center">

          <span className="text-xs font-bold text-gray-600">
            VS
          </span>

          <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-700">
            Match Center
          </p>

        </div>

        <Team
          name={fixture.teams.away.name}
          logo={fixture.teams.away.logo}
          score={awayScore}
          align="right"
        />

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
  score: number | null;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 sm:gap-3 ${
        align === "right"
          ? "flex-row-reverse text-right"
          : ""
      }`}
    >

      {logo ? (
        <img
          src={logo}
          alt={name}
          className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
        />
      ) : (
        <div className="h-9 w-9 shrink-0 rounded-full bg-white/5 sm:h-10 sm:w-10" />
      )}

      <div className="min-w-0">

        <p className="truncate text-sm font-semibold text-gray-200">
          {name}
        </p>

        {score !== null &&
          score !== undefined && (
            <p className="mt-1 text-xl font-black sm:text-2xl">
              {score}
            </p>
          )}

      </div>

    </div>
  );
}

/* ---------------------------------------------------------- */
/* EMPTY STATE */
/* ---------------------------------------------------------- */

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1118] px-6 py-10 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-green-400">
        <Icon name="football" size={22} />
      </div>

      <h3 className="mt-4 text-lg font-black">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        {description}
      </p>

    </div>
  );
}