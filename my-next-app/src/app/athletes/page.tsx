"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlayerCard, LegacyPlayerCard, Player } from "@/components/PlayerCard";
import { fictionalAthletes } from "@/data/athletes";
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

export default function AthletesPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [note, setNote] = useState("Loading athletes...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAthletes() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/athletes`, { cache: "no-store" });
        if (!response.ok) {
          setNote(`Backend responded with status ${response.status}.`);
          setLoading(false);
          return;
        }

        const payload = await response.json();
        const data: AthleteApiResponse = payload.data || payload;
        const fetchedPlayers: Player[] = (data.athletes ?? []).map((a) => ({
          id: a._id ?? crypto.randomUUID(),
          name: a.name,
          sport: a.sport,
          country: a.region,
          description: a.bio,
          avatarUrl: a.imageUrl,
        }));

        setPlayers(fetchedPlayers);
        setNote(
          data.source === "fallback"
            ? data.message || "Showing fallback athletes (database is not connected)."
            : "Showing athletes from MongoDB."
        );
      } catch {
        setNote("Could not reach Node backend. Start backend at http://localhost:5000.");
      } finally {
        setLoading(false);
      }
    }
    fetchAthletes();
  }, []);

  const handleAthleteClick = (athleteId: string) => {
    router.push(`/athletes/${athleteId}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/"
                className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-400"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Athletes
                </span>{" "}
                Directory
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-slate-400">
                Discover talented athletes from across India. Browse profiles, view stats, and connect with rising stars.
              </p>
            </div>
            <Link
              href="/analyze"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Khel-Khoj-AI
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Status note */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-800/50 px-4 py-2 text-sm text-slate-400 ring-1 ring-slate-700/50">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {note}
          </div>
        </header>

        {/* Exercise 2: Fictional Athletes Section */}
        <section className="mb-16">
          <div className="mb-8 flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Featured Athletes</h2>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/30">
              {fictionalAthletes.length} athletes
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fictionalAthletes.map((athlete) => (
              <PlayerCard
                key={athlete.id}
                playerName={athlete.playerName}
                sport={athlete.sport}
                imageUrl={athlete.imageUrl}
                team={athlete.team}
                country={athlete.country}
                position={athlete.position}
                stats={athlete.stats}
                onClick={() => handleAthleteClick(athlete.id)}
              />
            ))}
          </div>
        </section>

        {/* Database Athletes Section */}
        {players.length > 0 && (
          <section>
            <div className="mb-8 flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Database Athletes</h2>
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 ring-1 ring-cyan-500/30">
                {players.length} athletes
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {players.map((athlete) => (
                <LegacyPlayerCard 
                  key={athlete.id} 
                  player={athlete} 
                  onClick={() => handleAthleteClick(athlete.id)}
                />
              ))}
            </div>
          </section>
        )}

        {players.length === 0 && (
          <section className="mt-8">
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">No Athletes in Database</h3>
              <p className="mt-2 text-sm text-slate-400">
                Connect to MongoDB to see athletes from the database. The fictional athletes above are shown as examples.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
