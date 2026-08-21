"use client";

import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/Icons";

interface Fixture {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    name: string;
    logo: string;
  };
  teams: {
    home: {
      name: string;
      logo: string;
    };
    away: {
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

const LIVE_STATUSES = ["1H", "HT", "2H", "ET", "P", "LIVE"];

export default function LiveMatches() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  const loadMatches = useCallback(async () => {
    try {
      setError(null);
      setRateLimited(false);

      const today = new Date().toISOString().split("T")[0];

      const response = await fetch(
        `/api/football?endpoint=fixtures&date=${today}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      /*
       * API-Football daily request limit.
       *
       * Our API route returns HTTP 429 and
       * rateLimited: true when the provider quota
       * has been exhausted.
       */
      if (response.status === 429 || data?.rateLimited === true) {
        setFixtures([]);
        setRateLimited(true);
        setError(null);
        return;
      }

      /*
       * Other API errors.
       */
      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to fetch live matches"
        );
      }

      /*
       * Make sure the API returned a valid response array.
       */
      if (!Array.isArray(data?.response)) {
        throw new Error("Invalid football API response");
      }

      const liveMatches = data.response.filter(
        (fixture: Fixture) =>
          LIVE_STATUSES.includes(
            fixture.fixture.status.short
          )
      );

      setFixtures(liveMatches);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("LiveMatches error:", err);

      setFixtures([]);
      setRateLimited(false);
      setError("Unable to update live matches.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();

    /*
     * Refresh every 30 seconds.
     */
    const interval = setInterval(() => {
      loadMatches();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadMatches]);

  /*
   * Initial loading state.
   */
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-400">
          <Icon name="football" size={22} />
        </div>

        <p className="mt-4 font-semibold">
          Loading live matches...
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Checking live football data.
        </p>
      </div>
    );
  }

  /*
   * API-Football daily quota reached.
   */
  if (rateLimited) {
    return (
      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-8 text-center">

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400">
          <Icon name="football" size={22} />
        </div>

        <p className="mt-4 font-semibold text-white">
          Live football data temporarily unavailable
        </p>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
          The daily football API request limit has been
          reached. Live scores will return when the API
          quota resets.
        </p>

        <button
          type="button"
          onClick={loadMatches}
          className="
            tv-focus
            mt-5
            rounded-xl
            border
            border-yellow-500/20
            bg-white/5
            px-5
            py-3
            text-sm
            font-semibold
            text-gray-300
            transition
            hover:bg-white/10
            focus:outline-none
          "
        >
          Try again
        </button>

      </div>
    );
  }

  /*
   * Other API/network error.
   */
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <Icon name="football" size={22} />
        </div>

        <p className="mt-4 font-semibold">
          Unable to load live matches
        </p>

        <p className="mt-2 text-sm text-gray-500">
          {error}
        </p>

        <button
          type="button"
          onClick={loadMatches}
          className="
            tv-focus
            mt-5
            rounded-xl
            bg-green-500
            px-5
            py-3
            text-sm
            font-bold
            text-black
            transition
            hover:bg-green-400
            focus:outline-none
          "
        >
          Try again
        </button>

      </div>
    );
  }

  /*
   * API is working, but there are genuinely
   * no live matches right now.
   */
  if (fixtures.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d1118] p-8 text-center">

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-400">
          <Icon name="football" size={22} />
        </div>

        <p className="mt-4 font-semibold">
          No live matches right now
        </p>

        <p className="mt-1 text-sm text-gray-500">
          We&apos;ll automatically check again.
        </p>

        {lastUpdated && (
          <p className="mt-3 text-xs text-gray-600">
            Last checked{" "}
            {lastUpdated.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        )}

      </div>
    );
  }

  /*
   * Live matches.
   */
  return (
    <div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400" />

          <span className="text-sm font-semibold text-green-400">
            LIVE NOW
          </span>

          <span className="text-xs text-gray-500">
            {fixtures.length}{" "}
            {fixtures.length === 1
              ? "match"
              : "matches"}
          </span>
        </div>

        {lastUpdated && (
          <span className="text-xs text-gray-600">
            Updated{" "}
            {lastUpdated.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        )}

      </div>

      <div className="grid gap-4 md:grid-cols-2">

        {fixtures.map((fixture) => (
          <LiveMatchCard
            key={fixture.fixture.id}
            fixture={fixture}
          />
        ))}

      </div>

    </div>
  );
}

function LiveMatchCard({
  fixture,
}: {
  fixture: Fixture;
}) {
  const status = fixture.fixture.status;

  return (
    <div
      className="
        tv-focus
        tv-nav-item
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

      <div className="mb-5 flex items-center justify-between gap-3">

        <div className="flex min-w-0 items-center gap-2">

          <img
            src={fixture.league.logo}
            alt=""
            className="h-5 w-5 shrink-0 object-contain"
          />

          <span className="truncate text-xs text-gray-500">
            {fixture.league.name}
          </span>

        </div>

        <div className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-green-400">

          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

          {status.short === "HT"
            ? "HALF TIME"
            : `${status.elapsed ?? 0}'`}

        </div>

      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4">

        <Team
          name={fixture.teams.home.name}
          logo={fixture.teams.home.logo}
          score={fixture.goals.home}
          align="left"
        />

        <div className="text-center text-xs font-bold text-gray-600">
          VS
        </div>

        <Team
          name={fixture.teams.away.name}
          logo={fixture.teams.away.logo}
          score={fixture.goals.away}
          align="right"
        />

      </div>

    </div>
  );
}

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
      className={`flex min-w-0 items-center gap-3 ${
        align === "right"
          ? "flex-row-reverse text-right"
          : ""
      }`}
    >

      <img
        src={logo}
        alt={name}
        className="h-10 w-10 shrink-0 object-contain"
      />

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-200">
          {name}
        </p>

        <p className="mt-1 text-2xl font-black">
          {score ?? 0}
        </p>
      </div>

    </div>
  );
}