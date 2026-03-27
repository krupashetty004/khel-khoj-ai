"use client";

import Image from "next/image";
import React from "react";

// Exercise 1: PlayerCard Component with typed props
export interface PlayerCardProps {
  playerName: string;
  sport: string;
  imageUrl: string;
  team?: string;
  country?: string;
  position?: string;
  stats?: { label: string; value: string | number }[];
  onClick?: () => void;
}

// Legacy Player type for backward compatibility
export interface Player {
  id: string;
  name: string;
  sport: string;
  team?: string;
  country?: string;
  avatarUrl?: string;
  description?: string;
  stats?: { label: string; value: string | number }[];
}

export function PlayerCard({
  playerName,
  sport,
  imageUrl,
  team,
  country,
  position,
  stats,
  onClick,
}: PlayerCardProps) {
  const initials = playerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const sportColors: Record<string, { bg: string; text: string; ring: string }> = {
    Cricket: { bg: "bg-green-500/10", text: "text-green-400", ring: "ring-green-500/30" },
    Football: { bg: "bg-blue-500/10", text: "text-blue-400", ring: "ring-blue-500/30" },
    Basketball: { bg: "bg-orange-500/10", text: "text-orange-400", ring: "ring-orange-500/30" },
    Tennis: { bg: "bg-yellow-500/10", text: "text-yellow-400", ring: "ring-yellow-500/30" },
    Hockey: { bg: "bg-red-500/10", text: "text-red-400", ring: "ring-red-500/30" },
    Badminton: { bg: "bg-purple-500/10", text: "text-purple-400", ring: "ring-purple-500/30" },
    Athletics: { bg: "bg-cyan-500/10", text: "text-cyan-400", ring: "ring-cyan-500/30" },
    Swimming: { bg: "bg-sky-500/10", text: "text-sky-400", ring: "ring-sky-500/30" },
    default: { bg: "bg-emerald-500/10", text: "text-emerald-400", ring: "ring-emerald-500/30" },
  };

  const colors = sportColors[sport] || sportColors.default;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-1 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10"
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative flex flex-col rounded-xl bg-slate-900/80 p-5 backdrop-blur-xl">
        {/* Top section with image and basic info */}
        <div className="flex items-start gap-4">
          {/* Player Image/Avatar */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-2 ring-slate-700/50 transition-all duration-300 group-hover:ring-emerald-500/50 sm:h-24 sm:w-24">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={playerName}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500/30 to-cyan-500/30">
                <span className="text-xl font-bold text-white/80">{initials}</span>
              </div>
            )}
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-30" />
          </div>

          {/* Player Info */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-white transition-colors group-hover:text-emerald-400">
              {playerName}
            </h3>
            
            {/* Sport Badge */}
            <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${colors.bg} ${colors.text} ${colors.ring}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {sport}
            </span>

            {/* Team & Country */}
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
              {team && <span>{team}</span>}
              {team && country && <span className="text-slate-600">•</span>}
              {country && (
                <span className="flex items-center gap-1">
                  <span className="text-base">🌍</span>
                  {country}
                </span>
              )}
            </p>

            {position && (
              <p className="mt-1 text-xs text-slate-500">Position: {position}</p>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {stats && stats.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {stats.slice(0, 3).map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg bg-slate-800/50 px-3 py-2 text-center ring-1 ring-slate-700/50 transition-colors group-hover:bg-slate-800 group-hover:ring-emerald-500/30"
              >
                <dt className="text-[10px] uppercase tracking-wider text-slate-500">
                  {stat.label}
                </dt>
                <dd className="mt-0.5 text-sm font-bold text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </div>
        )}

        {/* Hover indicator */}
        <div className="mt-4 flex items-center justify-center text-xs text-slate-500 transition-colors group-hover:text-emerald-400">
          <span>View Profile</span>
          <svg className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

// Legacy wrapper for backward compatibility
export function LegacyPlayerCard({ player, onClick }: { player: Player; onClick?: (player: Player) => void }) {
  return (
    <PlayerCard
      playerName={player.name}
      sport={player.sport}
      imageUrl={player.avatarUrl || ""}
      team={player.team}
      country={player.country}
      stats={player.stats}
      onClick={() => onClick?.(player)}
    />
  );
}

export default PlayerCard;


