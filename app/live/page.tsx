import LiveMatches from "@/components/LiveMatches";

export default function LivePage() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-green-400">
            HDOFOOT
          </p>

          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
            Live Football
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Live scores and match updates from around the world.
          </p>
        </div>

        {/* LIVE MATCHES */}
        <LiveMatches />

      </div>
    </div>
  );
} 