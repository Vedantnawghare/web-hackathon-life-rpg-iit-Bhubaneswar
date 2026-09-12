"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Quest } from "@/types/quest";
import { DailyProgress } from "@/types/character";
import { getEnemyArchetypeInfo } from "@/components/rpg/EnemySprite";
import {
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  Sword,
  Skull,
  Trophy,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyRoadmapProps {
  quests: Quest[];
  dailyProgress?: DailyProgress;
  activeQuestId?: string | null;
  onSelectQuest: (quest: Quest) => void;
  className?: string;
}

export function DailyRoadmap({
  quests = [],
  dailyProgress,
  activeQuestId,
  onSelectQuest,
  className,
}: DailyRoadmapProps) {
  // Sort quests chronologically by due_time, or fallback to created_at
  const roadmapNodes = useMemo(() => {
    const list = [...quests];
    list.sort((a, b) => {
      if (a.due_time && b.due_time) {
        return a.due_time.localeCompare(b.due_time);
      }
      if (a.due_time) return -1;
      if (b.due_time) return 1;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    return list;
  }, [quests]);

  // Determine current active node (first incomplete quest)
  const currentActiveIndex = useMemo(() => {
    return roadmapNodes.findIndex((q) => !q.is_completed_for_period);
  }, [roadmapNodes]);

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl border-2 border-amber-900/40 bg-gradient-to-b from-slate-950 via-slate-900 to-black p-4 sm:p-6 shadow-xl flex flex-col gap-4 select-none",
        className
      )}
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/30 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold font-cinzel text-amber-300 tracking-wide">
              Today&apos;s Adventure Roadmap
            </h3>
            <p className="text-xs text-slate-400 font-rajdhani">
              Chronological quest path through the Realm of Ascension
            </p>
          </div>
        </div>

        {dailyProgress && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-rajdhani">
            <span className="text-slate-400">Progress:</span>
            <span className="font-bold text-amber-400">{dailyProgress.daily_xp_earned} XP</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{dailyProgress.daily_xp_goal} XP Goal</span>
          </div>
        )}
      </div>

      {/* Empty State */}
      {roadmapNodes.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Compass className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
          <h4 className="text-sm font-bold font-cinzel text-slate-300">No Bounties on the Roadmap</h4>
          <p className="text-xs text-slate-500 font-rajdhani mt-1 max-w-sm">
            Create daily or timed quests from the Bounty Board to chart your hero&apos;s journey for today.
          </p>
        </div>
      )}

      {/* Visual Roadmap Progression Route */}
      {roadmapNodes.length > 0 && (
        <div className="relative py-4 flex flex-col">
          {/* Central Connecting Road Trail Line */}
          <div className="absolute left-6 sm:left-8 top-8 bottom-12 w-1 bg-gradient-to-b from-amber-600/40 via-amber-500/20 to-slate-800 rounded-full" />

          {/* Chronological Checkpoint Nodes */}
          <div className="flex flex-col gap-4 relative z-10">
            {roadmapNodes.map((quest, index) => {
              const isCompleted = quest.is_completed_for_period;
              const isCurrent = index === currentActiveIndex;
              const isFocused = activeQuestId === quest.id;
              const enemy = getEnemyArchetypeInfo(quest.primary_attribute, quest.difficulty);

              return (
                <motion.div
                  key={quest.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => onSelectQuest(quest)}
                  className={cn(
                    "group relative flex items-start gap-4 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer",
                    isFocused
                      ? "bg-amber-950/40 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                      : isCurrent
                      ? "bg-slate-900/90 border-amber-600/50 hover:border-amber-400/70 shadow-md"
                      : isCompleted
                      ? "bg-slate-950/60 border-emerald-800/40 opacity-80"
                      : "bg-slate-950/50 border-slate-800/60 opacity-60 hover:opacity-90"
                  )}
                >
                  {/* Node Crest Icon */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-200",
                        isCompleted
                          ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-md"
                          : isCurrent
                          ? "bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse"
                          : "bg-slate-900 border-slate-700 text-slate-500"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : isCurrent ? (
                        <Sword className="w-6 h-6 text-amber-300" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-500" />
                      )}
                    </div>

                    {/* Defeated Skull badge on completed */}
                    {isCompleted && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-emerald-500 flex items-center justify-center">
                        <Skull className="w-3 h-3 text-emerald-400" />
                      </div>
                    )}
                  </div>

                  {/* Node Content */}
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        {/* Time Stamp */}
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[11px] font-bold font-rajdhani flex items-center gap-1",
                            isCurrent
                              ? "bg-amber-950/90 text-amber-300 border border-amber-500/50"
                              : "bg-black/60 text-slate-400 border border-slate-800"
                          )}
                        >
                          <Clock className="w-3 h-3" />
                          {quest.due_time || `Checkpoint ${index + 1}`}
                        </span>

                        {/* Domain Tag */}
                        <span className="text-[10px] uppercase font-bold font-rajdhani text-slate-400">
                          {quest.category}
                        </span>
                      </div>

                      {/* State Badge */}
                      <span
                        className={cn(
                          "text-[10px] font-bold font-rajdhani uppercase tracking-wider px-2 py-0.5 rounded",
                          isCompleted
                            ? "text-emerald-400 bg-emerald-950/60 border border-emerald-500/30"
                            : isCurrent
                            ? "text-amber-400 bg-amber-950/60 border border-amber-500/40"
                            : "text-slate-500 bg-slate-900"
                        )}
                      >
                        {isCompleted ? "Defeated" : isCurrent ? "Active Encounter" : "Upcoming"}
                      </span>
                    </div>

                    {/* Quest Title & Enemy info */}
                    <h4
                      className={cn(
                        "text-sm font-bold font-cinzel truncate",
                        isCompleted ? "line-through text-slate-400" : "text-slate-100"
                      )}
                    >
                      {quest.title}
                    </h4>

                    <div className="flex flex-wrap items-center justify-between text-xs font-rajdhani text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <span>Adversary:</span>
                        <span className="text-amber-400/90 font-semibold">{enemy.name}</span>
                      </span>

                      <div className="flex items-center gap-2 font-bold text-amber-400">
                        <span className="flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" /> +{quest.base_xp} XP
                        </span>
                        <span>•</span>
                        <span>+{quest.base_gold} G</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Terminal Milestone: Daily Boss / Completion */}
            <div
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300",
                dailyProgress?.is_goal_reached
                  ? "bg-gradient-to-r from-amber-950/70 via-slate-900 to-emerald-950/70 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]"
                  : "bg-slate-950/40 border-dashed border-slate-800 opacity-60"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center border-2",
                  dailyProgress?.is_goal_reached
                    ? "bg-amber-500 border-amber-300 text-slate-950 shadow-lg animate-bounce"
                    : "bg-slate-900 border-slate-700 text-slate-600"
                )}
              >
                <Trophy className="w-6 h-6" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold font-cinzel text-amber-300">
                    Daily Boss & Adventure Climax
                  </h4>
                  {dailyProgress?.is_goal_reached && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                      Conquered!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-rajdhani">
                  {dailyProgress?.is_goal_reached
                    ? "All daily mandates vanquished! Daily XP resolve fully unlocked."
                    : `Reach 100% of Today's XP Goal (${dailyProgress?.daily_xp_goal || 500} XP) to conquer the Daily Boss.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

