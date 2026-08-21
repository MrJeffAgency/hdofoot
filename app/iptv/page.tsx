import Link from "next/link";
import { getIPTVChannels } from "@/lib/iptv";

export default function IPTVPage() {
  const channels = getIPTVChannels();

  const groups = Array.from(
    new Set(
      channels.flatMap(
        (channel) => channel.groups
      )
    )
  );

  return (
    <main className="min-h-screen bg-[#07090d] px-4 pb-24 pt-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold md:text-4xl">
            IPTV
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Live TV channels
          </p>
        </div>

        {channels.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-8 text-center text-gray-400">
            No IPTV channels found.
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => {
              const groupChannels =
                channels.filter(
                  (channel) =>
                    channel.groups.includes(group)
                );

              return (
                <section key={group}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                      {group}
                    </h2>

                    <span className="text-sm text-gray-500">
                      {groupChannels.length} channels
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {groupChannels.map((channel) => (
                      <Link
                        key={channel.id}
                        href={`/iptv/${encodeURIComponent(
                          channel.id
                        )}`}
                        className="
                          tv-focus
                          tv-nav-item
                          group
                          rounded-2xl
                          border
                          border-white/10
                          bg-[#0d1118]
                          p-4
                          transition
                          hover:border-green-500/50
                          hover:bg-[#121821]
                        "
                      >
                        <div className="flex h-24 items-center justify-center rounded-xl bg-[#07090d] p-3">
                          {channel.logo ? (
                            <img
                              src={channel.logo}
                              alt={channel.name}
                              loading="lazy"
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-3xl">
                              📺
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 line-clamp-2 text-sm font-semibold">
                          {channel.name}
                        </h3>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}