import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Video {
  id: string;
  name: string;
  overview?: string;
  year?: number | null;
  image?: string;
  path?: string;
}

export default async function VideoWatchPage({
  params,
}: PageProps) {
  const { id } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/emby/videos`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return (
      <main className="min-h-screen bg-[#07090d] p-6 text-white">
        <h1 className="text-2xl font-bold">
          Unable to load videos
        </h1>

        <Link
          href="/videos"
          className="tv-focus mt-5 inline-flex rounded-xl bg-green-500 px-5 py-3 font-bold text-black"
        >
          ← Back to Videos
        </Link>
      </main>
    );
  }

  const data = await response.json();

  const videos: Video[] = Array.isArray(data.items)
    ? data.items
    : [];

  const video = videos.find(
    (item) => String(item.id) === String(id)
  );

  if (!video) {
    return (
      <main className="min-h-screen bg-[#07090d] p-6 text-white">
        <h1 className="text-2xl font-bold">
          Video not found
        </h1>

        <p className="mt-2 text-gray-400">
          Emby could not find video ID {id}.
        </p>

        <Link
          href="/videos"
          className="
            tv-focus
            mt-5
            inline-flex
            min-h-[48px]
            items-center
            rounded-xl
            bg-green-500
            px-5
            py-3
            font-bold
            text-black
          "
        >
          ← Back to Videos
        </Link>
      </main>
    );
  }

  const streamUrl = `/api/emby/video/${encodeURIComponent(
    id
  )}`;

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-5 md:px-6 lg:px-8">

        {/* Header */}

        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-green-400">
              HDOFOOT
            </p>

            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              {video.name}
            </h1>

            {video.year && (
              <p className="mt-1 text-sm text-gray-500">
                {video.year}
              </p>
            )}
          </div>

          <Link
            href="/videos"
            className="
              tv-focus
              shrink-0
              inline-flex
              min-h-[44px]
              items-center
              rounded-xl
              border
              border-white/10
              bg-[#0d1118]
              px-4
              text-sm
              font-semibold
              text-gray-300
            "
          >
            ← Back
          </Link>
        </div>

        {/* Player */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-black
            shadow-2xl
          "
        >
          <video
            className="aspect-video h-auto w-full bg-black"
            controls
            autoPlay
            playsInline
            preload="metadata"
            src={streamUrl}
          />
        </div>

        {/* Description */}

        {video.overview && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-[#0d1118] p-5">
            <h2 className="text-lg font-bold">
              About this video
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              {video.overview}
            </p>
          </section>
        )}

      </div>
    </main>
  );
}