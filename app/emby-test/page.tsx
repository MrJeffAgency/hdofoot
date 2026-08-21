import EmbyTestPlayer from "@/components/EmbyTestPlayer";

export default function EmbyTestPage() {
  return (
    <main className="min-h-screen bg-[#07090d] px-4 py-6 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-5 text-2xl font-black">
          Emby Test Player
        </h1>

        <EmbyTestPlayer />
      </div>
    </main>
  );
}