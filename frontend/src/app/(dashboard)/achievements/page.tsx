"use client";

/* eslint-disable @next/next/no-img-element */
import { GAME_ASSETS } from "@/lib/game-assets";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Achievement } from "@/types/achievement";
import { AchievementBadge } from "@/components/rpg/AchievementBadge";
import {
  Trophy,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["ALL", "Quests", "Progression", "Streaks"];

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNLOCKED" | "LOCKED">("ALL");

  const { data: achievements = [], isLoading, error } = useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: () => apiClient<Achievement[]>("/achievements"),
  });

  const unlockedCount = achievements.filter((a) => a.is_unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Filtered achievements
  const filteredAchievements = achievements.filter((ach) => {
    if (selectedCategory !== "ALL" && ach.category !== selectedCategory) {
      return false;
    }
    if (statusFilter === "UNLOCKED" && !ach.is_unlocked) return false;
    if (statusFilter === "LOCKED" && ach.is_unlocked) return false;
    return true;
  });

  return (
    <div className="relative min-h-[calc(100vh-5rem)] rounded-3xl overflow-hidden border border-amber-500/40 p-4 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.85)]">
      {/* Real Fantasy Trophy Hall of Champions Background */}
      <img
        src={GAME_ASSETS.backgrounds.achievements}
        alt="Hall of Trophies"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0 brightness-[0.85] contrast-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/60 pointer-events-none z-0" />

      <div className="relative z-10 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5 font-display">
            <Trophy className="h-6 w-6 text-amber-400" /> Hall of Trophies
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative realm achievements unlocked by conquering quests, levels, and streaks.
          </p>
        </div>

        {/* Total Progress Banner */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-md self-start sm:self-auto">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Trophies Unlocked:</span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {unlockedCount} / {totalCount}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Achievements unlocked: ${progressPercent} percent`}
              className="h-1.5 w-36 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mt-1"
            >
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap",
                  isSelected
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                )}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            );
          })}
        </div>

        {/* Status Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={cn(
              "px-2.5 py-1 rounded text-[11px] font-medium transition-colors",
              statusFilter === "ALL"
                ? "bg-amber-500/15 text-amber-300 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("UNLOCKED")}
            className={cn(
              "px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1",
              statusFilter === "UNLOCKED"
                ? "bg-emerald-500/15 text-emerald-300 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <CheckCircle2 className="h-3 w-3" /> Unlocked ({unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("LOCKED")}
            className={cn(
              "px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1",
              statusFilter === "LOCKED"
                ? "bg-slate-800 text-slate-200 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Lock className="h-3 w-3" /> Locked ({totalCount - unlockedCount})
          </button>
        </div>
      </div>

      {/* Achievement Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center border border-dashed border-rose-500/30 rounded-xl bg-rose-500/5">
          <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-rose-300">Unable to load trophies</p>
          <p className="text-xs text-slate-400 mt-1">Please try refreshing the page.</p>
        </div>
      ) : filteredAchievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
          <Trophy className="h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">
            {achievements.length === 0
              ? "Your legend begins with your first quest"
              : "No trophies match the active filter"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {achievements.length === 0
              ? "Complete real-world tasks on your Quest Board to forge your first monumental achievements."
              : "Try switching category or unlock status filters above."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
