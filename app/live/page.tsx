import LiveMatches from "@/components/LiveMatches";
import liveChannels from "@/data/live.json";

interface LiveChannel {
  id: string;
  name: string;
  logo?: string;
  group?: string;
  stream: string;
}

export default function LivePage() {
  const channels = liveChannels as LiveChannel[];

  return (
    <main className="min-h-screen w-full bg-[#07090d] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">

        {/* HEADER */}

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-green-400">
            HDOFOOT
          </p>

          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
            Live
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Watch live streams from HDOFOOT.
          </p>
        </div>

        {/* LIVE STREAMS */}

        <LiveMatches channels={channels} />

      </div>
    </main>
  );
}