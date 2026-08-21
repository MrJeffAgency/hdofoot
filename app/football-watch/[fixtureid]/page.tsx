import Link from "next/link";
import { getFixtures } from "@/lib/football";

interface PageProps {
  params: Promise<{
    fixtureId: string;
  }>;
}

interface Stream {
  type: "emby" | "hls" | "none";
  itemId?: string;
  url?: string;
}

async function getStream(
  fixtureId: string
): Promise<Stream> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/emby/play/${encodeURIComponent(
      fixtureId
    )}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return { type: "none" };
  }

  const data = await response.json();

  return data.stream ?? { type: "none" };
}

export default async function WatchPage({
  params,
}: PageProps) {
  const { fixtureId } = await params;

  const fixtures = await getFixtures(
    new Date().toISOString().slice(0, 10)
  );

  const fixture = fixtures.find(
    (item: any) =>
      String(item.fixture?.id) === fixtureId
  );

  if (!fixture) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-8 text-center">
          <h1 className="text-xl font-black">
            Match not found
          </h1>

          <Link
            href="/fixtures"
            className="mt-6 inline-flex rounded-xl bg-green-500 px-5 py-3 font-bold text-black"
          >
            Back to Fixtures
          </Link>
        </div>
      </main>
    );
  }

  const stream = await getStream(fixtureId);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8">

      <Link
        href={`/match/${fixtureId}`}
        className="mb-5 inline-flex text-sm font-medium text-green-400"
      >
        ← Back to match
      </Link>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-black">

        {stream.type === "none" && (
          <div className="flex aspect-video items-center justify-center p-6 text-center">
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-3xl">
                ⚽
              </div>

              <h1 className="mt-5 text-xl font-black">
                No stream
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                No authorized stream is available for this match.
              </p>
            </div>
          </div>
        )}

        {stream.type === "emby" && (
          <div className="flex aspect-video items-center justify-center bg-black">
            <video
              controls
              playsInline
              className="h-full w-full"
              src={`/api/emby/stream/${fixtureId}`}
            />
          </div>
        )}

        {stream.type === "hls" && stream.url && (
          <div className="flex aspect-video items-center justify-center bg-black">
            <video
              controls
              playsInline
              className="h-full w-full"
              src={stream.url}
            />
          </div>
        )}

      </section>

      <section className="mt-5 rounded-2xl border border-white/10 bg-[#0d1118] p-5">

        <p className="text-xs font-bold uppercase tracking-widest text-green-400">
          {fixture.league?.name}
        </p>

        <h1 className="mt-2 text-xl font-black">
          {fixture.teams?.home?.name}
          {" vs "}
          {fixture.teams?.away?.name}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {fixture.fixture?.status?.long}
        </p>

      </section>

    </main>
  );
}