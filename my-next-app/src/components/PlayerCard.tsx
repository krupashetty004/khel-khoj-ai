"use client";

import Image from "next/image";
import React from "react";

export type Player = {
  id: string;
  name: string;
  sport: string;
  team?: string;
  country?: string;
  avatarUrl?: string;
  description?: string;
  stats?: Array<{ label: string; value: string | number }>;
};

type PlayerCardProps = {
  player: Player;
  onClick?: (player: Player) => void;
};

export function PlayerCard({ player, onClick }: PlayerCardProps) {
  const handleClick = () => {
    if (onClick) onClick(player);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group w-full text-left rounded-xl border border-gray-200 bg-white/70 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60"
    >
      <div className="flex items-start gap-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-gray-200 dark:ring-gray-800 sm:h-28 sm:w-28">
          {player.avatarUrl ? (
            <Image
              src={player.avatarUrl}
              alt={player.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-300">
              <span className="text-xl font-semibold">
                {player.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
              {player.name}
            </h3>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200 group-hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/50">
              {player.sport}
            </span>
          </div>

          <p className="mt-0.5 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
            {[player.team, player.country].filter(Boolean).join(" • ") || "—"}
          </p>

          {player.description && (
            <p className="mt-3 line-clamp-3 text-sm text-gray-700 dark:text-gray-200">
              {player.description}
            </p>
          )}

          {player.stats && player.stats.length > 0 && (
            <dl className="mt-3 grid grid-cols-3 gap-2">
              {player.stats.slice(0, 3).map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg bg-gray-50 px-2.5 py-2 text-center text-xs ring-1 ring-gray-200 dark:bg-gray-800/60 dark:ring-gray-700"
                >
                  <dt className="text-gray-500 dark:text-gray-400">{stat.label}</dt>
                  <dd className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </button>
  );
}

export default PlayerCard;


