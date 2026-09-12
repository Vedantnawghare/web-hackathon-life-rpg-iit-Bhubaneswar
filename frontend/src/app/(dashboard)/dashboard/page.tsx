"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Character, DailyProgress } from "@/types/character";
import { Quest, QuestCompleteResponse } from "@/types/quest";
import { LevelUpModal } from "@/components/rpg/LevelUpModal";
import { ArenaBattle } from "@/components/rpg/ArenaBattle";
import { QuestCreateModal } from "@/components/rpg/QuestCreateModal";
import { GAME_ASSETS } from "@/lib/game-assets";
import { getHeroArchetype } from "@/lib/hero-data";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Circle,
  Sparkles,
  Flame,
  ArrowRight,
  Plus,
  Swords,
  Brain,
  Shield,
  Heart,
  Palette,
  ChevronRight,
  Check,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [isCreateQuestOpen, setIsCreateQuestOpen] = useState(false);
  const [focusedQuestId, setFocusedQuestId] = useState<string | null>(null);
  const [completingQuestId, setCompletingQuestId] = useState<string | null>(null);
  const [, setLastCompletion] = useState<QuestCompleteResponse | null>(null);
  const [levelUpState, setLevelUpState] = useState<{
    isOpen: boolean;
    oldLevel: number;
    newLevel: number;
    levelsGained: number;
  }>({
    isOpen: false,
    oldLevel: 1,
    newLevel: 1,
    levelsGained: 1,
  });

  const { data: character, isLoading: isCharacterLoading } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
  });

  const { data: dailyProgress } = useQuery<DailyProgress>({
    queryKey: ["character", "daily-progress"],
    queryFn: () => apiClient<DailyProgress>("/characters/me/daily-progress"),
  });

  const { data: quests = [], isLoading: isQuestsLoading } = useQuery<Quest[]>({
    queryKey: ["quests"],
    queryFn: () => apiClient<Quest[]>("/quests?status=ACTIVE"),
  });

  // Complete quest mutation with instant feedback & arena sync
  const completeMutation = useMutation({
    mutationFn: (questId: string) =>
      apiClient<QuestCompleteResponse>(`/quests/${questId}/complete`, {
        method: "POST",
      }),
    onMutate: (questId) => {
      setCompletingQuestId(questId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["character", "me"] });
      queryClient.invalidateQueries({ queryKey: ["character", "daily-progress"] });
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.invalidateQueries({ queryKey: ["quest-history"] });

      setLastCompletion(data);

      if (data.has_leveled_up) {
        setLevelUpState({
          isOpen: true,
          oldLevel: data.old_level,
          newLevel: data.new_level,
          levelsGained: data.levels_gained,
        });
      }
    },
    onSettled: () => {
      setCompletingQuestId(null);
    },
  });

  const heroArchetype = useMemo(() => {
    return getHeroArchetype(character?.hero_class || "vanguard_male");
  }, [character?.hero_class]);

  // Quests summary
  const totalQuestsCount = quests.length;
  const completedQuestsCount = useMemo(() => {
    return quests.filter((q) => q.is_completed_for_period).length;
  }, [quests]);

  // Attribute percentages normalized to 100 max cap for display
  const attrPercentages = useMemo(() => {
    const calc = (val: number = 10) => Math.min(100, Math.max(15, Math.round((val / 30) * 100)));
    return {
      intellect: calc(character?.intellect),
      strength: calc(character?.strength),
      discipline: calc(character?.discipline),
      vitality: calc(character?.vitality),
      creativity: calc(character?.creativity),
    };
  }, [character]);

  const currentStreak = character?.current_streak ?? 0;
  const streakDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0=Mon, 6=Sun

  // Category Icon Resolver
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("coding") || cat.includes("intellect") || cat.includes("study") || cat.includes("learn")) {
      return <Brain className="w-4 h-4 text-cyan-400" />;
    }
    if (cat.includes("fit") || cat.includes("workout") || cat.includes("strength") || cat.includes("exercise")) {
      return <Swords className="w-4 h-4 text-rose-400" />;
    }
    if (cat.includes("habit") || cat.includes("discipline") || cat.includes("meditat")) {
      return <Shield className="w-4 h-4 text-emerald-400" />;
    }
    if (cat.includes("water") || cat.includes("vital") || cat.includes("health") || cat.includes("sleep")) {
      return <Heart className="w-4 h-4 text-amber-400" />;
    }
    return <Palette className="w-4 h-4 text-purple-400" />;
  };

  // Region Name Resolver
  const getRegionName = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("coding") || cat.includes("intellect") || cat.includes("study") || cat.includes("learn")) {
      return "Mindpeak Spire";
    }
    if (cat.includes("fit") || cat.includes("workout") || cat.includes("strength") || cat.includes("exercise")) {
      return "The Iron Grounds";
    }
    if (cat.includes("habit") || cat.includes("discipline") || cat.includes("meditat")) {
      return "Sanctum of Discipline";
    }
    if (cat.includes("water") || cat.includes("vital") || cat.includes("health") || cat.includes("sleep")) {
      return "Springs of Vitalis";
    }
    return "The Arcanum";
  };

  if (isCharacterLoading || isQuestsLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-96 bg-slate-900/80 rounded-3xl border border-slate-800" />
        <div className="h-64 bg-slate-900/80 rounded-2xl border border-slate-800" />
        <div className="h-96 bg-slate-900/80 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  const currentLevel = character?.current_level ?? 1;
  const currentXp = character?.xp_into_current_level ?? 0;
  const nextLevelXp = character?.xp_required_for_next_level ?? 100;
  const xpPercent = Math.min(100, Math.max(0, Math.round((currentXp / (nextLevelXp || 1)) * 100)));

  return (
    <div className="space-y-10 select-none pb-12">
      {/* ========================================================================= */}
      {/* 1. CINEMATIC HERO SECTION (INSPIRED BY REFERENCE COMPOSITION)             */}
      {/* ========================================================================= */}
      <section
        aria-label="Fantasy RPG Hero Portal"
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-400/50 shadow-[0_0_50px_rgba(0,0,0,0.85)] bg-slate-950 p-4 sm:p-8 lg:p-10"
      >
        {/* Real High-Resolution Fantasy Background Artwork */}
        <img
          src={GAME_ASSETS.backgrounds.home}
          alt="Fantasy Kingdom Realm"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0 brightness-[1.05] contrast-[1.05] saturate-115"
        />

        {/* Cinematic atmospheric gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060a1f]/80 via-[#080d28]/50 to-[#070b22]/75 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-black/40 pointer-events-none z-0" />

        {/* Hero Section Grid: Left Copy & CTA | Right Character & Today's Quests Panels */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Game Status, Headline, Description, and CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6 lg:pr-4">
            <div className="space-y-4">
              {/* World Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#0b112c]/90 border border-amber-400/60 text-amber-300 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                <span>AUTHORITATIVE RPG ENGINE &bull; DAY {currentStreak + 1}</span>
              </div>

              {/* Large Dramatic Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-cinzel tracking-tight text-white leading-tight drop-shadow-md">
                FORGE YOUR DAILY HABITS <br />
                INTO A{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.8)]">
                  LEGENDARY REALM
                </span>
              </h1>

              {/* Short Evocative Subtext */}
              <p className="text-sm sm:text-base font-rajdhani font-semibold text-slate-200 max-w-xl leading-relaxed">
                Conquer quests. Earn XP. Build your character.
                <br className="hidden sm:inline" />
                Turn your daily habits into an unstoppable legendary life.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-3.5">
                <Button
                  onClick={() => setIsCreateQuestOpen(true)}
                  className="h-11 px-6 font-rajdhani font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.6)] flex items-center gap-2 transition-all hover:scale-105"
                >
                  <span>CREATE QUEST</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </Button>

                <a
                  href="#colosseum-arena"
                  className="h-11 px-5 font-rajdhani font-bold text-sm uppercase tracking-wider rounded-xl border border-amber-400/50 bg-[#0d143b]/80 hover:bg-[#141f54]/90 text-amber-200 shadow-md backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Swords className="w-4 h-4 text-amber-400" />
                  <span>ENTER THE REALM</span>
                </a>
              </div>

              {/* Decorative Journey Begins Prompt */}
              <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-amber-400/80 uppercase font-semibold pt-1">
                <span>&rarr;</span>
                <span>YOUR JOURNEY BEGINS HERE</span>
                <span>&larr;</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Multi-card HUD - YOUR CHARACTER + TODAY'S QUESTS */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {/* 1. YOUR CHARACTER HUD CARD (REAL DATA) */}
            <div className="rounded-2xl border border-amber-400/40 bg-[#090e24]/85 backdrop-blur-md p-4 sm:p-5 flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.7)]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    {/* Hero Avatar Badge */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                      style={{ background: `linear-gradient(135deg, ${heroArchetype.primaryColor}40, #0a0f2b)` }}
                    >
                      <Shield className="w-5 h-5" style={{ color: heroArchetype.primaryColor }} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                        YOUR CHARACTER
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-rajdhani font-bold text-slate-100">
                        <span className="text-amber-300">LVL {currentLevel}</span>
                        <span>&bull;</span>
                        <span className="text-slate-300 truncate max-w-[110px]">
                          {character?.username || "Hero"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level XP Gauge */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span className="text-slate-400">Progression</span>
                    <span className="text-amber-300 font-bold">
                      {currentXp} / {nextLevelXp} XP
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full border border-amber-500/30 overflow-hidden p-0.5 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                </div>

                {/* 5 Core Attributes Bars with Real Percentages */}
                <div className="mt-4 space-y-2 text-xs font-rajdhani font-semibold">
                  {/* Intellect */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-cyan-300 flex items-center gap-1">
                        <Brain className="w-3 h-3" /> INTELLECT
                      </span>
                      <span className="text-slate-300 font-mono">{attrPercentages.intellect}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${attrPercentages.intellect}%` }} />
                    </div>
                  </div>

                  {/* Strength */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-rose-300 flex items-center gap-1">
                        <Swords className="w-3 h-3" /> STRENGTH
                      </span>
                      <span className="text-slate-300 font-mono">{attrPercentages.strength}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${attrPercentages.strength}%` }} />
                    </div>
                  </div>

                  {/* Discipline */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-emerald-300 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> DISCIPLINE
                      </span>
                      <span className="text-slate-300 font-mono">{attrPercentages.discipline}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${attrPercentages.discipline}%` }} />
                    </div>
                  </div>

                  {/* Vitality */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-amber-300 flex items-center gap-1">
                        <Heart className="w-3 h-3" /> VITALITY
                      </span>
                      <span className="text-slate-300 font-mono">{attrPercentages.vitality}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${attrPercentages.vitality}%` }} />
                    </div>
                  </div>

                  {/* Creativity */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-purple-300 flex items-center gap-1">
                        <Palette className="w-3 h-3" /> CREATIVITY
                      </span>
                      <span className="text-slate-300 font-mono">{attrPercentages.creativity}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: `${attrPercentages.creativity}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Streak Tag */}
              <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-rajdhani font-bold">
                <span className="text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{currentStreak} DAY STREAK</span>
                </span>
                <span className="text-slate-400 text-[10px] font-mono">{heroArchetype.name}</span>
              </div>
            </div>

            {/* 2. TODAY'S QUESTS PANEL (REAL DATA, INTERACTIVE COMPLETION) */}
            <div className="rounded-2xl border border-amber-400/40 bg-[#090e24]/85 backdrop-blur-md p-4 sm:p-5 flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.7)]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <span className="text-xs font-cinzel font-black text-amber-200 tracking-wide uppercase flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    TODAY&apos;S QUESTS
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-mono font-bold text-amber-300">
                    {completedQuestsCount}/{totalQuestsCount}
                  </span>
                </div>

                {/* Quests List */}
                <div className="mt-3 space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                  {quests.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-rajdhani">
                      No active quests today.
                      <Button
                        variant="ghost"
                        onClick={() => setIsCreateQuestOpen(true)}
                        className="text-amber-300 text-xs font-bold block mx-auto mt-1 hover:text-amber-200 hover:bg-amber-400/10"
                      >
                        + Create Your First Quest
                      </Button>
                    </div>
                  ) : (
                    quests.slice(0, 5).map((q) => {
                      const isCompleted = q.is_completed_for_period;
                      const isMutating = completingQuestId === q.id;

                      return (
                        <div
                          key={q.id}
                          onClick={() => setFocusedQuestId(q.id)}
                          className={`group p-2 rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                            focusedQuestId === q.id
                              ? "border-amber-400/80 bg-amber-950/20"
                              : isCompleted
                              ? "bg-emerald-950/20 border-emerald-500/30 text-slate-300"
                              : "bg-slate-900/60 border-slate-800 hover:border-amber-400/40 text-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 shrink-0">
                              {getCategoryIcon(q.category)}
                            </div>
                            <div className="min-w-0">
                              <span
                                className={`text-xs font-rajdhani font-bold block truncate max-w-[130px] sm:max-w-[140px] ${
                                  isCompleted ? "line-through text-slate-400" : "text-slate-100"
                                }`}
                              >
                                {q.title}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 block truncate">
                                {getRegionName(q.category)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                              +{q.base_xp} XP
                            </span>

                            <button
                              type="button"
                              disabled={isCompleted || isMutating}
                              onClick={() => completeMutation.mutate(q.id)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                isCompleted
                                  ? "bg-emerald-500/20 border border-emerald-400 text-emerald-300"
                                  : "border border-slate-600 hover:border-amber-400 hover:bg-amber-400/20 text-slate-400"
                              }`}
                              title={isCompleted ? "Completed" : "Complete Quest"}
                            >
                              {isCompleted ? (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <Circle className="w-3 h-3 text-slate-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* View All Quests Link */}
              <Link
                href="/quests"
                className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-rajdhani font-bold text-amber-300 hover:text-amber-200 flex items-center justify-end gap-1 transition-colors"
              >
                <span>View All Quests</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE 5 ZONES OF ASCENSION (LARGE VISUAL REGION CARDS)                    */}
      {/* ========================================================================= */}
      <section aria-label="The 5 Zones of Ascension" className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
            THE 5 ZONES OF ASCENSION
          </h2>
          <p className="text-xs sm:text-sm font-rajdhani font-semibold text-slate-300">
            Explore the realms. Master your skills. Level up your life.
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {/* 1. Mindpeak Spire - INTELLECT */}
          <Link
            href="/character#attributes"
            aria-label="Mindpeak Spire - View Intellect attributes and progression in Hero Sanctum"
            className="group relative rounded-2xl overflow-hidden border border-cyan-400/40 bg-[#0a1128] hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.99]"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={GAME_ASSETS.zones.mindpeak}
                alt="Mindpeak Spire"
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1128] via-transparent to-black/30" />
              <div className="absolute top-3 left-3 p-2 rounded-xl bg-cyan-950/80 border border-cyan-400/60 shadow-md">
                <Brain className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-400">
                  <span>INTELLECT</span>
                  <span>{attrPercentages.intellect}%</span>
                </div>
                <h3 className="font-cinzel font-black text-base text-slate-100 group-hover:text-cyan-200 transition-colors">
                  Mindpeak Spire
                </h3>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-sky-300 rounded-full" style={{ width: `${attrPercentages.intellect}%` }} />
                </div>
                <p className="text-[11px] font-rajdhani text-slate-300 pt-1 leading-relaxed">
                  Coding, reading, technical skill mastery, and deep intellectual study.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono font-bold text-cyan-300">
                <span>XP +120 AVAILABLE</span>
                <span className="group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1 font-bold" aria-hidden="true">&rarr;</span>
              </div>
            </div>
          </Link>

          {/* 2. The Iron Grounds - STRENGTH */}
          <Link
            href="/character#attributes"
            aria-label="The Iron Grounds - View Strength attributes and progression in Hero Sanctum"
            className="group relative rounded-2xl overflow-hidden border border-rose-500/40 bg-[#160a0d] hover:border-rose-400 hover:shadow-[0_0_30px_rgba(244,63,94,0.4)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.99]"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={GAME_ASSETS.zones.ironCrags}
                alt="The Iron Grounds"
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#160a0d] via-transparent to-black/30" />
              <div className="absolute top-3 left-3 p-2 rounded-xl bg-rose-950/80 border border-rose-400/60 shadow-md">
                <Swords className="w-4 h-4 text-rose-300" />
              </div>
            </div>
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-rose-400">
                  <span>STRENGTH</span>
                  <span>{attrPercentages.strength}%</span>
                </div>
                <h3 className="font-cinzel font-black text-base text-slate-100 group-hover:text-rose-200 transition-colors">
                  The Iron Grounds
                </h3>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full" style={{ width: `${attrPercentages.strength}%` }} />
                </div>
                <p className="text-[11px] font-rajdhani text-slate-300 pt-1 leading-relaxed">
                  Physical training, calisthenics, athletic conditioning, and raw stamina.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono font-bold text-rose-300">
                <span>XP +100 AVAILABLE</span>
                <span className="group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1 font-bold" aria-hidden="true">&rarr;</span>
              </div>
            </div>
          </Link>

          {/* 3. Sanctum of Discipline - DISCIPLINE */}
          <Link
            href="/quests"
            aria-label="Sanctum of Discipline - View daily quests and streak progression"
            className="group relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-[#071710] hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.99]"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={GAME_ASSETS.zones.discipline}
                alt="Sanctum of Discipline"
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071710] via-transparent to-black/30" />
              <div className="absolute top-3 left-3 p-2 rounded-xl bg-emerald-950/80 border border-emerald-400/60 shadow-md">
                <Shield className="w-4 h-4 text-emerald-300" />
              </div>
            </div>
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-emerald-400">
                  <span>DISCIPLINE</span>
                  <span>{attrPercentages.discipline}%</span>
                </div>
                <h3 className="font-cinzel font-black text-base text-slate-100 group-hover:text-emerald-200 transition-colors">
                  Sanctum Discipline
                </h3>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full" style={{ width: `${attrPercentages.discipline}%` }} />
                </div>
                <p className="text-[11px] font-rajdhani text-slate-300 pt-1 leading-relaxed">
                  Daily streak maintenance, timely execution, and iron habit consistency.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono font-bold text-emerald-300">
                <span>XP +150 AVAILABLE</span>
                <span className="group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1 font-bold" aria-hidden="true">&rarr;</span>
              </div>
            </div>
          </Link>

          {/* 4. Springs of Vitalis - VITALITY */}
          <Link
            href="/character#attributes"
            aria-label="Springs of Vitalis - View Vitality attributes and progression in Hero Sanctum"
            className="group relative rounded-2xl overflow-hidden border border-amber-500/40 bg-[#171106] hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.99]"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={GAME_ASSETS.zones.vitalis}
                alt="Springs of Vitalis"
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171106] via-transparent to-black/30" />
              <div className="absolute top-3 left-3 p-2 rounded-xl bg-amber-950/80 border border-amber-400/60 shadow-md">
                <Heart className="w-4 h-4 text-amber-300" />
              </div>
            </div>
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-400">
                  <span>VITALITY</span>
                  <span>{attrPercentages.vitality}%</span>
                </div>
                <h3 className="font-cinzel font-black text-base text-slate-100 group-hover:text-amber-200 transition-colors">
                  Springs of Vitalis
                </h3>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full" style={{ width: `${attrPercentages.vitality}%` }} />
                </div>
                <p className="text-[11px] font-rajdhani text-slate-300 pt-1 leading-relaxed">
                  Restorative sleep, hydration, nutrition, and whole-body vitality.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono font-bold text-amber-300">
                <span>XP +110 AVAILABLE</span>
                <span className="group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1 font-bold" aria-hidden="true">&rarr;</span>
              </div>
            </div>
          </Link>

          {/* 5. The Arcanum - CREATIVITY */}
          <Link
            href="/character#attributes"
            aria-label="The Arcanum - View Creativity attributes and progression in Hero Sanctum"
            className="group relative rounded-2xl overflow-hidden border border-purple-500/40 bg-[#140a1c] hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.99]"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={GAME_ASSETS.zones.arcanum}
                alt="The Arcanum"
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140a1c] via-transparent to-black/30" />
              <div className="absolute top-3 left-3 p-2 rounded-xl bg-purple-950/80 border border-purple-400/60 shadow-md">
                <Palette className="w-4 h-4 text-purple-300" />
              </div>
            </div>
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-purple-400">
                  <span>CREATIVITY</span>
                  <span>{attrPercentages.creativity}%</span>
                </div>
                <h3 className="font-cinzel font-black text-base text-slate-100 group-hover:text-purple-200 transition-colors">
                  The Arcanum
                </h3>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-300 rounded-full" style={{ width: `${attrPercentages.creativity}%` }} />
                </div>
                <p className="text-[11px] font-rajdhani text-slate-300 pt-1 leading-relaxed">
                  Writing, music, visual design, architecture, and lateral creative breakthroughs.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono font-bold text-purple-300">
                <span>XP +90 AVAILABLE</span>
                <span className="group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1 font-bold" aria-hidden="true">&rarr;</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. STREAK & PROGRESSION SIDE-BY-SIDE PANELS (MATCHING REFERENCE LAYOUT)   */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* YOUR STREAK PANEL */}
        <div className="rounded-2xl border border-amber-500/40 bg-[#090e24]/90 backdrop-blur-md p-4 sm:p-6 shadow-[0_0_30px_rgba(0,0,0,0.7)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" /> YOUR STREAK
            </span>
            <span className="text-[11px] font-mono text-amber-400/90 font-bold uppercase">
              Cadence Active
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-5xl font-black font-cinzel text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              {String(currentStreak).padStart(2, "0")}
            </span>
            <span className="text-base sm:text-lg font-rajdhani font-bold text-slate-300 uppercase tracking-widest">
              DAYS IN A ROW
            </span>
          </div>

          {/* Mon-Sun Day Nodes */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-2">
            {streakDays.map((day, idx) => {
              const isActive = idx <= currentDayIndex && currentStreak > 0;
              return (
                <div key={day} className="flex flex-col items-center gap-1 sm:gap-1.5">
                  <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase">{day}</span>
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border transition-all ${
                      isActive
                        ? "bg-amber-400/25 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                        : "bg-slate-950/60 border-slate-700 text-slate-600"
                    }`}
                  >
                    {isActive ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" /> : <Circle className="w-2 h-2 sm:w-2.5 sm:h-2.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* XP Multiplier Banner */}
          <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-center text-xs font-rajdhani font-black text-amber-300 uppercase tracking-wider shadow-sm">
            &rarr; +30% ACTIVE XP REWARD MULTIPLIER &larr;
          </div>
        </div>

        {/* YOUR PROGRESSION PANEL */}
        <div className="rounded-2xl border border-amber-500/40 bg-[#090e24]/90 backdrop-blur-md p-6 shadow-[0_0_30px_rgba(0,0,0,0.7)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> YOUR PROGRESSION
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Next Tier: LVL {currentLevel + 1}
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-cinzel text-slate-100">
                Level {currentLevel}
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {currentXp} / {nextLevelXp} XP
              </span>
            </div>

            <div className="h-3 w-full bg-slate-950 rounded-full border border-amber-500/30 overflow-hidden p-0.5 shadow-inner mt-2">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <p className="text-xs font-rajdhani italic text-slate-300">
              &ldquo;Small steps every day lead to great achievements.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PRIMARY GAMEPLAY ARENA BATTLE (HERO VS ENEMY ENCOUNTER)                */}
      {/* ========================================================================= */}
      <section id="colosseum-arena" aria-label="Battle Arena Command Center" className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300">
              <Swords className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-black font-cinzel text-slate-100 uppercase tracking-wide">
                Colosseum of Reckoning
              </h2>
              <p className="text-xs font-rajdhani font-semibold text-slate-400">
                Strike tasks to inflict dynamic damage on today&apos;s 3D Raid Boss.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setIsCreateQuestOpen(true)}
            className="h-8 text-xs font-rajdhani font-bold bg-amber-500/20 border border-amber-400/50 text-amber-200 hover:bg-amber-400/30"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Task
          </Button>
        </div>

        <ArenaBattle
          character={character}
          quests={quests}
          dailyProgress={dailyProgress}
          focusedQuestId={focusedQuestId}
          onCompleteQuest={(questId) => completeMutation.mutateAsync(questId)}
          isCompleting={completingQuestId !== null}
          onLevelUp={(lvl) =>
            setLevelUpState({
              isOpen: true,
              oldLevel: lvl.oldLevel,
              newLevel: lvl.newLevel,
              levelsGained: lvl.levelsGained,
            })
          }
        />
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW IT WORKS (ELEGANT 4-STEP PROCESS CYCLE)                            */}
      {/* ========================================================================= */}
      <section aria-label="How It Works" className="rounded-2xl border border-slate-800 bg-[#070b1e]/90 p-6 shadow-xl">
        <div className="text-center space-y-1 mb-6">
          <h3 className="text-sm font-black font-cinzel text-amber-300 uppercase tracking-widest flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            HOW IT WORKS
          </h3>
          <p className="text-xs font-rajdhani font-semibold text-slate-400">
            A simple cycle. A powerful transformation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-mono font-black text-sm shrink-0">
              1
            </div>
            <div>
              <span className="text-xs font-black font-cinzel text-slate-100 block">COMPLETE</span>
              <span className="text-[11px] font-rajdhani text-slate-400">Quests & Habits</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-mono font-black text-sm shrink-0">
              2
            </div>
            <div>
              <span className="text-xs font-black font-cinzel text-slate-100 block">EARN</span>
              <span className="text-[11px] font-rajdhani text-slate-400">XP & Party Gold</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-mono font-black text-sm shrink-0">
              3
            </div>
            <div>
              <span className="text-xs font-black font-cinzel text-slate-100 block">LEVEL UP</span>
              <span className="text-[11px] font-rajdhani text-slate-400">Unlock New Zones</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-mono font-black text-sm shrink-0">
              4
            </div>
            <div>
              <span className="text-xs font-black font-cinzel text-slate-100 block">GAIN</span>
              <span className="text-[11px] font-rajdhani text-slate-400">Skills & Relics</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MODALS & TOAST NOTIFICATIONS                                           */}
      {/* ========================================================================= */}
      {/* Quest Creation Modal */}
      <QuestCreateModal
        isOpen={isCreateQuestOpen}
        onClose={() => setIsCreateQuestOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["quests"] });
          queryClient.invalidateQueries({ queryKey: ["character", "daily-progress"] });
        }}
      />

      {/* Level Up Celebration Modal */}
      <LevelUpModal
        isOpen={levelUpState.isOpen}
        onClose={() => setLevelUpState((prev) => ({ ...prev, isOpen: false }))}
        oldLevel={levelUpState.oldLevel}
        newLevel={levelUpState.newLevel}
        levelsGained={levelUpState.levelsGained}
        characterName={character?.username || "Adventurer"}
      />
    </div>
  );
}
