"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Quest } from "@/types/quest";
import { DailyProgress } from "@/types/character";
import { getEnemyArchetypeInfo } from "@/components/rpg/EnemySprite";
import { audioManager } from "@/lib/audio-manager";
import {
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  Sword,
  Skull,
  Compass,
  MapPin,
  Flame,
  Coins,
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

  const handleNodeClick = (quest: Quest) => {
    audioManager.playHitSound();
    onSelectQuest(quest);
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl border-2 border-amber-900/50 bg-gradient-to-b from-slate-950 via-slate-950/90 to-black p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex flex-col gap-4 select-none",
        className
      )}
    >
      {/* Background Cartography Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.05),transparent_60%)] pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/40 pb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-md">
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black font-cinzel text-amber-200 tracking-wide">
              Today&apos;s Expedition Roadmap
            </h3>
            <p className="text-xs text-slate-400 font-rajdhani">
              Chronological campaign route through the encounters of Aethelgard
            </p>
          </div>
        </div>

        {dailyProgress && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-amber-900/50 text-xs font-rajdhani shadow-inner">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/50" />
            <span className="text-slate-400">Day Resolve:</span>
            <span className="font-black text-amber-300">{dailyProgress.daily_xp_earned} XP</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{dailyProgress.daily_xp_goal} XP Goal</span>
          </div>
        )}
      </div>

      {/* Empty State */}
      {roadmapNodes.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Compass className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
          <h4 className="text-sm font-bold font-cinzel text-slate-300">No Bounties on the Expedition Path</h4>
          <p className="text-xs text-slate-500 font-rajdhani mt-1 max-w-sm">
            Contract quests from the Bounty Board to chart today&apos;s heroic march through the realm.
          </p>
        </div>
      )}

      {/* Visual Roadmap Progression Route */}
      {roadmapNodes.length > 0 && (
        <div className="relative py-2 flex flex-col">
          {/* Central Connecting Cobblestone Trail */}
          <div className="absolute left-6 sm:left-8 top-8 bottom-12 w-1.5 bg-gradient-to-b from-amber-600/50 via-amber-500/30 to-slate-800 rounded-full border-l border-amber-400/30" />

          {/* Chronological Checkpoint Nodes */}
          <div className="flex flex-col gap-3 relative z-10">
            {roadmapNodes.map((quest, index) => {
              const isCompleted = quest.is_completed_for_period;
              const isCurrent = index === currentActiveIndex;
              const isFocused = activeQuestId === quest.id;
              const enemy = getEnemyArchetypeInfo(quest.primary_attribute, quest.difficulty);

              return (
                <motion.div
                  key={quest.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleNodeClick(quest)}
                  className={cn(
                    "group relative flex items-start gap-4 p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none",
                    isFocused
                      ? "bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-slate-950 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)]"
                      : isCurrent
                      ? "bg-gradient-to-r from-slate-900 via-slate-950 to-slate-950 border-amber-500/70 hover:border-amber-400 shadow-lg"
                      : isCompleted
                      ? "bg-slate-950/60 border-emerald-900/40 opacity-75 hover:opacity-100"
                      : "bg-slate-950/50 border-slate-800/60 opacity-60 hover:opacity-90"
                  )}
                >
                  {/* Hero Token Waypoint Marker (Only on current active quest) */}
                  {isCurrent && (
                    <div className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-slate-950 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.9)] animate-ping" />
                      <div className="absolute w-4 h-4 rounded-full bg-yellow-400 border border-black flex items-center justify-center">
                        <MapPin className="w-2.5 h-2.5 text-black fill-black" />
                      </div>
                    </div>
                  )}

                  {/* Node Crest Icon */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-200",
                        isCompleted
                          ? "bg-emerald-950/90 border-emerald-500 text-emerald-400 shadow-md"
                          : isCurrent
                          ? "bg-gradient-to-br from-amber-600 to-amber-950 border-amber-300 text-yellow-200 shadow-[0_0_18px_rgba(245,158,11,0.5)] animate-pulse"
                          : "bg-slate-900 border-slate-700 text-slate-500"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : isCurrent ? (
                        <Sword className="w-6 h-6 text-yellow-200" />
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
                            "px-2 py-0.5 rounded text-[11px] font-black font-rajdhani flex items-center gap-1",
                            isCurrent
                              ? "bg-amber-950/90 text-amber-300 border border-amber-500/60"
                              : "bg-black/60 text-slate-400 border border-slate-800"
                          )}
                        >
                          <Clock className="w-3 h-3" />
                          {quest.due_time || `Checkpoint ${index + 1}`}
                        </span>

                        {/* Attribute Domain Tag */}
                        <span className="text-[10px] uppercase font-bold font-cinzel text-slate-400">
                          {quest.primary_attribute}
                        </span>
                      </div>

                      {/* State Badge */}
                      <span
                        className={cn(
                          "text-[10px] font-black font-cinzel uppercase tracking-wider px-2 py-0.5 rounded",
                          isCompleted
                            ? "text-emerald-400 bg-emerald-950/70 border border-emerald-500/40"
                            : isCurrent
                            ? "text-amber-300 bg-amber-950/80 border border-amber-400/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                            : "text-slate-500 bg-slate-900"
                        )}
                      >
                        {isCompleted ? "Defeated" : isCurrent ? "Active Encounter" : "Upcoming"}
                      </span>
                    </div>

                    {/* Quest Title & Adversary */}
                    <h4
                      className={cn(
                        "text-sm font-black font-cinzel truncate",
                        isCompleted ? "line-through text-slate-500" : "text-amber-100"
                      )}
                    >
                      {quest.title}
                    </h4>

                    <div className="flex flex-wrap items-center justify-between text-xs font-rajdhani text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span className="font-cinzel text-[10px] text-slate-500">Adversary:</span>
                        <span className="text-rose-400 font-bold">{enemy.name}</span>
                      </span>

                      <div className="flex items-center gap-3 font-black text-amber-400">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> +{quest.base_xp} XP
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Coins className="w-3.5 h-3.5 text-yellow-400" /> +{quest.base_gold} G
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
