import Link from "next/link";
import EmbyPlayer from "@/components/EmbyPlayer";
import { getFixtures } from "@/lib/football";
import { getMatchStream } from "@/lib/streams";

interface PageProps {
  params: Promise<{
    fixtureId: string;
  }>;
}

export default async function MatchPage({
  params,
}: PageProps) {
  const { fixtureId } = await params;

  const date = new Date()
    .toISOString()
    .slice(0, 10);

  const fixtures = await getFixtures(date);

  const fixture = fixtures.find(
    (item: any) =>
      String(item.fixture.id) === fixtureId
  );

  if (!fixture) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-8 text-center">
          <h1 className="text-xl font-bold">
            Match not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            We could not find this football match.
          </p>

          <Link
            href="/fixtures"
            className="mt-6 inline-flex rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-black"
          >
            Back to Fixtures
          </Link>
        </div>
      </main>
    );
  }

  /*
   * Existing stream system remains available
   * for HLS / iframe streams.
   */
  const stream = await getMatchStream(
    fixtureId
  );

  const status = fixture.fixture.status;

  const isLive = [
    "1H",
    "HT",
    "2H",
    "ET",
    "P",
    "LIVE",
  ].includes(status.short);

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8">

      {/* PLAYER */}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-black">

        {stream ? (
          <div className="aspect-video w-full bg-black">

            {stream.type === "iframe" ? (
              <iframe
                src={stream.url}
                title={`${fixture.teams.home.name} vs ${fixture.teams.away.name}`}
                className="h-full w-full border-0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                controls
                playsInline
                preload="metadata"
                className="h-full w-full bg-black"
                src={stream.url}
              />
            )}

          </div>
        ) : (
          /*
           * EmbyPlayer resolves:
           *
           * /api/emby/play/{fixtureId}
           *
           * If the API returns:
           *
           * {
           *   type: "emby",
           *   itemId: "11"
           * }
           *
           * EmbyPlayer automatically creates:
           *
           * /api/emby/test-stream/11
           *
           * The Emby API key never reaches the browser.
           */
          <EmbyPlayer
            fixtureId={fixtureId}
            title={`${fixture.teams.home.name} vs ${fixture.teams.away.name}`}
          />
        )}

      </section>

      {/* MATCH HEADER */}

      <section className="mt-6 rounded-2xl border border-white/10 bg-[#0d1118] p-5 md:p-8">

        <div className="mb-6 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <img
              src={fixture.league.logo}
              alt=""
              className="h-6 w-6 object-contain"
            />

            <span className="text-sm text-gray-400">
              {fixture.league.name}
            </span>

          </div>

          <span
            className={
              isLive
                ? "text-sm font-bold text-green-400"
                : "text-sm text-gray-500"
            }
          >
            {status.long}
          </span>

        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">

          {/* HOME */}

          <div className="text-center">

            <img
              src={fixture.teams.home.logo}
              alt={fixture.teams.home.name}
              className="mx-auto h-16 w-16 object-contain md:h-20 md:w-20"
            />

            <h2 className="mt-3 text-sm font-bold md:text-lg">
              {fixture.teams.home.name}
            </h2>

          </div>

          {/* SCORE */}

          <div className="text-center">

            <div className="text-3xl font-black md:text-5xl">
              {fixture.goals.home ?? 0}

              <span className="mx-2 text-gray-600">
                -
              </span>

              {fixture.goals.away ?? 0}
            </div>

            {isLive && (
              <p className="mt-2 text-xs font-bold text-green-400">
                {status.short === "HT"
                  ? "HALF TIME"
                  : `${status.elapsed ?? 0}'`}
              </p>
            )}

          </div>

          {/* AWAY */}

          <div className="text-center">

            <img
              src={fixture.teams.away.logo}
              alt={fixture.teams.away.name}
              className="mx-auto h-16 w-16 object-contain md:h-20 md:w-20"
            />

            <h2 className="mt-3 text-sm font-bold md:text-lg">
              {fixture.teams.away.name}
            </h2>

          </div>

        </div>

      </section>

    </main>
  );
}