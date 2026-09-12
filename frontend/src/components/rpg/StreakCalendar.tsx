"use client";

import { Flame, Trophy, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  currentStreak?: number;
  longestStreak?: number;
  className?: string;
}

const MILESTONES = [
  { days: 7, title: "7-Day Will", bonus: "14% Boost" },
  { days: 14, title: "14-Day Resolve", bonus: "28% Boost" },
  { days: 30, title: "30-Day Immortal", bonus: "30% Cap" },
];

export function StreakCalendar({
  currentStreak = 0,
  longestStreak = 0,
  className,
}: StreakCalendarProps) {
  // Current XP multiplier bonus
  const multiplierBonusPercent = Math.min(30, currentStreak * 2);

  // 7-day compact rolling tracker representation
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const activeDaysCount = Math.min(7, currentStreak);

  return (
    <div className={cn("rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-5", className)}>
      {/* Top Banner: Current Streak & Longest Streak */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-orange-600/30 via-amber-500/20 to-orange-500/10 border border-orange-500/30 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            <Flame className="h-6 w-6 fill-orange-400/40 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-mono text-slate-100">
                {currentStreak}
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-orange-400">
                Days Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Active Streak Multiplier:{" "}
              <span className="text-amber-400 font-mono font-semibold">
                +{multiplierBonusPercent}% XP
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <Trophy className="h-4 w-4 text-amber-400" />
          <span className="text-slate-400">Personal Record:</span>
          <span className="font-mono font-bold text-amber-300">
            {longestStreak} {longestStreak === 1 ? "day" : "days"}
          </span>
        </div>
      </div>

      {/* 7-Day Compact Rolling Visual Bar */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Current Cycle Cadence
        </span>
        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((day, idx) => {
            const isActive = idx < activeDaysCount;
            return (
              <div
                key={idx}
                className={cn(
                  "h-10 rounded-lg border flex flex-col items-center justify-center transition-all",
                  isActive
                    ? "bg-orange-500/15 border-orange-500/40 text-orange-300 shadow-sm"
                    : "bg-slate-950/60 border-slate-800 text-slate-600"
                )}
              >
                <span className="text-[10px] font-bold">{day}</span>
                {isActive && <CheckCircle2 className="h-3 w-3 text-orange-400 mt-0.5" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak Milestones Progression */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Ascension Milestones
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {MILESTONES.map((m) => {
            const achieved = currentStreak >= m.days || longestStreak >= m.days;
            const progress = Math.min(100, Math.round((currentStreak / m.days) * 100));

            return (
              <div
                key={m.days}
                className={cn(
                  "p-3 rounded-lg border text-xs transition-colors",
                  achieved
                    ? "bg-amber-500/10 border-amber-500/30 text-slate-200"
                    : "bg-slate-950/40 border-slate-800/80 text-slate-400"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold">{m.title}</span>
                  {achieved ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-semibold">
                      <Sparkles className="h-3 w-3 text-amber-400" /> Done
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">{progress}%</span>
                  )}
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      achieved ? "bg-amber-400" : "bg-orange-500/60"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Reward: {m.bonus}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
