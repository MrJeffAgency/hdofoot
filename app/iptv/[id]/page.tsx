import Link from "next/link";
import { notFound } from "next/navigation";
import { getIPTVChannels } from "@/lib/iptv";
import IPTVPlayer from "@/components/IPTVPlayer";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function IPTVChannelPage({
  params,
}: PageProps) {
  const { id } = await params;

  const decodedId = decodeURIComponent(id);

  const channels = getIPTVChannels();

  const channel = channels.find(
    (item) => item.id === decodedId
  );

  if (!channel) {
    notFound();
  }

  /*
   * ---------------------------------------------------------
   * RECOMMENDED IPTV CHANNELS
   * ---------------------------------------------------------
   *
   * Prefer channels from the same group as the
   * currently playing channel.
   */
  const recommendedChannels = channels
    .filter((item) => {
      if (item.id === channel.id) {
        return false;
      }

      return item.groups.some((group) =>
        channel.groups.includes(group)
      );
    })
    .slice(0, 12);

  return (
    <main
      className="
        min-h-screen
        bg-[#07090d]
        px-4
        pb-28
        pt-6
        text-white
        md:px-8
      "
    >
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <Link
          href="/iptv"
          className="
            tv-focus
            tv-nav-item
            mb-5
            inline-flex
            min-h-[48px]
            items-center
            rounded-xl
            px-4
            text-sm
            font-semibold
            text-gray-300
            hover:bg-white/5
            hover:text-white
          "
        >
          ← Back to IPTV
        </Link>

        {/* Player */}
        <IPTVPlayer
          url={channel.url}
          title={channel.name}
        />

        {/* Channel information */}
        <div
          className="
            mt-5
            rounded-2xl
            border
            border-white/10
            bg-[#0d1118]
            p-5
          "
        >
          <div className="flex items-center gap-4">

            {channel.logo && (
              <div
                className="
                  flex
                  h-16
                  w-20
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#07090d]
                  p-2
                "
              >
                <img
                  src={channel.logo}
                  alt=""
                  className="
                    max-h-full
                    max-w-full
                    object-contain
                  "
                />
              </div>
            )}

            <div>
              <h1 className="text-xl font-bold">
                {channel.name}
              </h1>

              <div className="mt-1 flex flex-wrap gap-2">
                {channel.groups.map(
                  (group) => (
                    <span
                      key={group}
                      className="
                        rounded-full
                        bg-white/5
                        px-2.5
                        py-1
                        text-xs
                        text-gray-400
                      "
                    >
                      {group}
                    </span>
                  )
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Recommended */}
        {recommendedChannels.length > 0 && (
          <section className="mt-10">

            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Recommended Channels
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  More live channels you may like
                </p>
              </div>

              <Link
                href="/iptv"
                className="
                  tv-focus
                  tv-nav-item
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-green-400
                  hover:bg-white/5
                "
              >
                View all
              </Link>
            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                md:grid-cols-4
                lg:grid-cols-5
                xl:grid-cols-6
              "
            >
              {recommendedChannels.map(
                (recommended) => (
                  <Link
                    key={recommended.id}
                    href={`/iptv/${encodeURIComponent(
                      recommended.id
                    )}`}
                    className="
                      tv-focus
                      tv-nav-item
                      group
                      rounded-2xl
                      border
                      border-white/10
                      bg-[#0d1118]
                      p-3
                      transition
                      hover:border-green-500/50
                      hover:bg-[#121821]
                    "
                  >
                    <div
                      className="
                        flex
                        h-24
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#07090d]
                        p-3
                      "
                    >
                      {recommended.logo ? (
                        <img
                          src={recommended.logo}
                          alt={recommended.name}
                          loading="lazy"
                          className="
                            max-h-full
                            max-w-full
                            object-contain
                          "
                        />
                      ) : (
                        <span className="text-3xl">
                          📺
                        </span>
                      )}
                    </div>

                    <h3
                      className="
                        mt-3
                        line-clamp-2
                        text-sm
                        font-semibold
                        text-gray-200
                        group-hover:text-white
                      "
                    >
                      {recommended.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {recommended.groups
                        .slice(0, 2)
                        .map((group) => (
                          <span
                            key={group}
                            className="
                              rounded-full
                              bg-white/5
                              px-2
                              py-0.5
                              text-[10px]
                              text-gray-500
                            "
                          >
                            {group}
                          </span>
                        ))}
                    </div>
                  </Link>
                )
              )}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}