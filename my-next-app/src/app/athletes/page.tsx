import PlayerCard, { Player } from "@/components/PlayerCard";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

type AthleteApiResponse = {
  source: "database" | "fallback";
  athletes?: Array<{
    _id?: string;
    name: string;
    sport: string;
    bio?: string;
    imageUrl?: string;
    region?: string;
  }>;
  message?: string;
};

async function getAthletes(): Promise<{ players: Player[]; note: string }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/athletes`, { cache: "no-store" });
    if (!response.ok) {
      return {
        players: [],
        note: `Backend responded with status ${response.status}.`,
      };
    }

    const data: AthleteApiResponse = await response.json();
    const players: Player[] = (data.athletes ?? []).map((a) => ({
      id: a._id ?? crypto.randomUUID(),
      name: a.name,
      sport: a.sport,
      country: a.region,
      description: a.bio,
      avatarUrl: a.imageUrl,
    }));

    return {
      players,
      note:
        data.source === "fallback"
          ? data.message || "Showing fallback athletes (database is not connected)."
          : "Showing athletes from MongoDB.",
    };
  } catch {
    return {
      players: [],
      note: "Could not reach Node backend. Start backend at http://localhost:5000.",
    };
  }
}

export default async function AthletesPage() {
  const { players, note } = await getAthletes();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Athletes
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{note}</p>
        </div>
        <Link
          href="/analyze"
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Go to AI Analysis
        </Link>
      </header>

      {players.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-gray-600 dark:text-gray-300">
          No athletes available yet.
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((athlete) => (
            <PlayerCard key={athlete.id} player={athlete} />
          ))}
        </section>
      )}
    </main>
  );
}
