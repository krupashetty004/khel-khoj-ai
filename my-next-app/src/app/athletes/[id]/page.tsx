"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAthleteById, Athlete } from "@/data/athletes";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// MongoDB Athlete type (different from local fictional athletes)
interface MongoAthlete {
  _id: string;
  name: string;
  sport: string;
  bio?: string;
  imageUrl?: string;
  region?: string;
}

function ProgressBar({ value, color = "emerald" }: { value: number; color?: string }) {
  const colorClasses: Record<string, string> = {
    emerald: "from-emerald-500 to-cyan-500",
    cyan: "from-cyan-500 to-blue-500",
    purple: "from-purple-500 to-pink-500",
    yellow: "from-yellow-500 to-orange-500",
  };

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${colorClasses[color] || colorClasses.emerald} transition-all duration-500`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function StatCard({ label, value, subtext }: { label: string; value: number; subtext?: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {subtext && <span className="mb-1 text-sm text-slate-500">{subtext}</span>}
      </div>
      <ProgressBar value={value} />
    </div>
  );
}

function AttributeRow({ name, value }: { name: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 85) return "text-emerald-400";
    if (v >= 75) return "text-cyan-400";
    if (v >= 65) return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
      <span className="text-sm text-slate-300">{name}</span>
      <div className="flex items-center gap-3">
        <div className="w-24">
          <ProgressBar value={value} />
        </div>
        <span className={`text-sm font-semibold ${getColor(value)}`}>{value}</span>
      </div>
    </div>
  );
}

function PotentialBadge({ potential }: { potential: Athlete["scoutingReport"]["potential"] }) {
  const styles = {
    Elite: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
    High: "bg-cyan-500/10 text-cyan-400 ring-cyan-500/30",
    Moderate: "bg-yellow-500/10 text-yellow-400 ring-yellow-500/30",
    Developing: "bg-orange-500/10 text-orange-400 ring-orange-500/30",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[potential]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {potential} Potential
    </span>
  );
}

export default function AthleteProfilePage() {
  const params = useParams();
  const athleteId = params.id as string;
  
  // Try local fictional athlete first
  const localAthlete = getAthleteById(athleteId);
  
  // State for MongoDB athlete
  const [mongoAthlete, setMongoAthlete] = useState<MongoAthlete | null>(null);
  const [loading, setLoading] = useState(!localAthlete);
  const [error, setError] = useState<string | null>(null);

  // Fetch from backend if not a local athlete
  useEffect(() => {
    if (localAthlete) return; // Skip if local athlete found
    
    const fetchAthlete = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/athletes/${athleteId}`);
        if (!response.ok) {
          throw new Error("Athlete not found");
        }
        const data = await response.json();
        if (data.success && data.data) {
          setMongoAthlete(data.data);
        } else {
          throw new Error("Invalid response");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load athlete");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAthlete();
  }, [athleteId, localAthlete]);

  // Loading state
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500" />
          <p className="mt-4 text-slate-400">Loading athlete profile...</p>
        </div>
      </main>
    );
  }

  // Not found state
  if (!localAthlete && !mongoAthlete) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Athlete Not Found</h1>
          <p className="mt-2 text-slate-400">{error || "The athlete you're looking for doesn't exist."}</p>
          <Link
            href="/athletes"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-400"
          >
            Back to Athletes
          </Link>
        </div>
      </main>
    );
  }

  // Use local athlete if available, otherwise use MongoDB athlete
  const athlete = localAthlete;
  const isMongoAthlete = !localAthlete && mongoAthlete;
  
  // For MongoDB athletes, show a simpler profile
  if (isMongoAthlete && mongoAthlete) {
    const initials = mongoAthlete.name.split(" ").map((n) => n[0]).join("").toUpperCase();
    
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Background effects */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/athletes"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Athletes
          </Link>

          {/* Profile Header */}
          <header className="mb-10 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 ring-4 ring-slate-700/50">
                {mongoAthlete.imageUrl ? (
                  <img src={mongoAthlete.imageUrl} alt={mongoAthlete.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-4xl font-bold text-white/80">{initials}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white sm:text-4xl">{mongoAthlete.name}</h1>
                    {mongoAthlete.region && (
                      <p className="mt-1 text-lg text-slate-400">{mongoAthlete.region}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-slate-700">
                    {mongoAthlete.sport}
                  </span>
                </div>

                {mongoAthlete.bio && (
                  <p className="mt-4 text-sm leading-relaxed text-slate-400">{mongoAthlete.bio}</p>
                )}
              </div>
            </div>
          </header>

          {/* Coming Soon Section */}
          <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 backdrop-blur sm:p-8 text-center">
            <div className="rounded-lg bg-emerald-500/10 p-3 inline-block mb-4">
              <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Athlete Registered</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              This athlete has been registered in the system. Upload a training video to generate an AI-powered scouting report.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Video for Analysis
            </Link>
          </section>
        </div>
      </main>
    );
  }

  // Full profile for local fictional athletes
  if (!athlete) return null;
  
  const { scoutingReport } = athlete;
  const initials = athlete.playerName.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/athletes"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Athletes
        </Link>

        {/* Profile Header */}
        <header className="mb-10 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 ring-4 ring-slate-700/50">
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-4xl font-bold text-white/80">{initials}</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white sm:text-4xl">{athlete.playerName}</h1>
                  <p className="mt-1 text-lg text-slate-400">{athlete.position} • {athlete.team}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-slate-700">
                    {athlete.sport}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-slate-700">
                    🌍 {athlete.country}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div>
                  <span className="text-slate-500">Age</span>
                  <p className="font-semibold text-white">{athlete.age} years</p>
                </div>
                <div>
                  <span className="text-slate-500">Height</span>
                  <p className="font-semibold text-white">{athlete.height}</p>
                </div>
                <div>
                  <span className="text-slate-500">Weight</span>
                  <p className="font-semibold text-white">{athlete.weight}</p>
                </div>
                <div>
                  <span className="text-slate-500">Experience</span>
                  <p className="font-semibold text-white">{athlete.experience}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-400">{athlete.bio}</p>
            </div>
          </div>
        </header>

        {/* Quick Stats */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-white">Career Statistics</h2>
          <div className="grid grid-cols-3 gap-4">
            {athlete.stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center">
                <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Scouting Report */}
        <section className="mb-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 backdrop-blur sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">AI Scouting Report</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-slate-500">Overall Rating</p>
                <p className="text-4xl font-bold text-emerald-400">{scoutingReport.overall}</p>
              </div>
              <PotentialBadge potential={scoutingReport.potential} />
            </div>
          </div>

          {/* Narrative */}
          <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <p className="text-sm leading-relaxed text-slate-300">{scoutingReport.narrative}</p>
          </div>

          {/* Physical Attributes */}
          <h3 className="mb-4 text-lg font-semibold text-white">Physical Attributes</h3>
          <div className="mb-8 grid gap-4 sm:grid-cols-5">
            <StatCard label="Speed" value={scoutingReport.physicalAttributes.speed} />
            <StatCard label="Agility" value={scoutingReport.physicalAttributes.agility} />
            <StatCard label="Endurance" value={scoutingReport.physicalAttributes.endurance} />
            <StatCard label="Strength" value={scoutingReport.physicalAttributes.strength} />
            <StatCard label="Flexibility" value={scoutingReport.physicalAttributes.flexibility} />
          </div>

          {/* Technical Skills & Mental Attributes */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Technical Skills</h3>
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                {scoutingReport.technicalSkills.map((skill) => (
                  <AttributeRow key={skill.name} name={skill.name} value={skill.rating} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Mental Attributes</h3>
              <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <AttributeRow name="Focus" value={scoutingReport.mentalAttributes.focus} />
                <AttributeRow name="Composure" value={scoutingReport.mentalAttributes.composure} />
                <AttributeRow name="Leadership" value={scoutingReport.mentalAttributes.leadership} />
                <AttributeRow name="Work Ethic" value={scoutingReport.mentalAttributes.workEthic} />
              </div>
            </div>
          </div>
        </section>

        {/* Strengths & Areas to Improve */}
        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-emerald-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Strengths
            </h3>
            <ul className="space-y-3">
              {scoutingReport.strengths.map((strength) => (
                <li key={strength} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {strength}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-yellow-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Areas to Improve
            </h3>
            <ul className="space-y-3">
              {scoutingReport.areasToImprove.map((area) => (
                <li key={area} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
                  {area}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Recommendations */}
        <section className="mb-10 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-cyan-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Development Recommendations
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {scoutingReport.recommendations.map((rec, i) => (
              <div key={rec} className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-400">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-300">{rec}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-purple-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Key Achievements
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {athlete.achievements.map((achievement) => (
              <div key={achievement} className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <span className="text-lg">🏆</span>
                <p className="text-sm text-slate-300">{achievement}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
