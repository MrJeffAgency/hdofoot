import Link from "next/link";
import Icon from "@/components/Icons";
import { getFixtures } from "@/lib/football";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FixturesPage() {
  const today = new Date().toISOString().split("T")[0];

  const fixtures = await getFixtures(today);

  return (
    <main className="min-h-screen w-full bg-[#07090d] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 pb-28 sm:px-5 md:px-6 lg:px-8 lg:pb-10">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-green-400">
            HDOFOOT
          </p>

          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            Fixtures
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Today&apos;s upcoming and recent football matches.
          </p>
        </div>

        {/* FIXTURES */}
        {fixtures.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-green-400">
              <Icon name="football" size={22} />
            </div>

            <p className="mt-4 text-lg font-bold text-white">
              No fixtures available
            </p>

            <p className="mt-2 text-sm text-gray-500">
              There are no football matches scheduled for today.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {fixtures.map((fixture: any) => (
              <FixtureCard
                key={fixture.fixture.id}
                fixture={fixture}
              />
            ))}

          </div>
        )}

      </div>
    </main>
  );
}

function FixtureCard({
  fixture,
}: {
  fixture: any;
}) {
  const status = fixture.fixture.status;

  const isLive = [
    "1H",
    "HT",
    "2H",
    "ET",
    "P",
    "LIVE",
  ].includes(status.short);

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

  return (
    <Link
      href={`/match/${fixture.fixture.id}`}
      className="
        tv-focus
        tv-nav-item
        block
        rounded-2xl
        border
        border-white/10
        bg-[#0d1118]
        p-5
        transition
        hover:border-green-500/30
        hover:bg-[#10161f]
      "
    >

      {/* LEAGUE + STATUS */}

      <div className="mb-5 flex items-center justify-between gap-3">

        <div className="flex min-w-0 items-center gap-2">

          {leagueLogo ? (
            <img
              src={leagueLogo}
              alt=""
              className="h-6 w-6 shrink-0 object-contain"
            />
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-green-400">
              <Icon name="football" size={12} />
            </div>
          )}

          <span className="truncate text-xs text-gray-500">
            {leagueName}
          </span>

        </div>

        {isLive ? (
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-green-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            LIVE
          </span>
        ) : (
          <span className="shrink-0 text-xs font-semibold text-gray-500">
            {time}
          </span>
        )}

      </div>

      {/* TEAMS */}

      <div className="space-y-4">

        <Team
          name={
            fixture.teams?.home?.name ||
            "Home"
          }
          logo={
            fixture.teams?.home?.logo ||
            ""
          }
          score={
            fixture.goals?.home ?? null
          }
        />

        <div className="border-t border-white/5" />

        <Team
          name={
            fixture.teams?.away?.name ||
            "Away"
          }
          logo={
            fixture.teams?.away?.logo ||
            ""
          }
          score={
            fixture.goals?.away ?? null
          }
        />

      </div>

      {/* DATE */}

      <div className="mt-5 text-xs text-gray-600">
        {new Date(
          fixture.fixture.date
        ).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </div>

    </Link>
  );
}

function Team({
  name,
  logo,
  score,
}: {
  name: string;
  logo: string;
  score: number | null;
}) {
  return (
    <div className="flex items-center gap-3">

      {/* TEAM LOGO */}

      {logo ? (
        <img
          src={logo}
          alt={name}
          className="h-10 w-10 shrink-0 object-contain"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-green-400">
          <Icon name="football" size={18} />
        </div>
      )}

      {/* TEAM INFO */}

      <div className="min-w-0 flex-1">

        <p className="truncate text-sm font-semibold text-gray-200">
          {name}
        </p>

        {score !== null && (
          <p className="mt-1 text-lg font-black text-white">
            {score}
          </p>
        )}

      </div>

    </div>
  );
}