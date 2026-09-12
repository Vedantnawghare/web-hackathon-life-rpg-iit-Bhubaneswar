"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Character, DailyProgress } from "@/types/character";
import { Quest, QuestCompleteResponse, CharacterAttribute } from "@/types/quest";
import { LevelUpModal } from "@/components/rpg/LevelUpModal";
import { StreakCalendar } from "@/components/rpg/StreakCalendar";
import { RealmMap } from "@/components/rpg/RealmMap";
import { ArenaBattle } from "@/components/rpg/ArenaBattle";
import { DailyRoadmap } from "@/components/rpg/DailyRoadmap";
import {
  Trophy,
  CheckCircle2,
  Sparkles,
  Coins,
  Flame,
  ShoppingBag,
  Backpack,
  BookOpen,
  X,
  Compass,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [selectedZone, setSelectedZone] = useState<CharacterAttribute | null>(null);
  const [focusedQuestId, setFocusedQuestId] = useState<string | null>(null);
  const [completingQuestId, setCompletingQuestId] = useState<string | null>(null);
  const [lastCompletion, setLastCompletion] = useState<QuestCompleteResponse | null>(null);
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

  // Complete mutation on dashboard
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

  if (isCharacterLoading || isQuestsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-96 bg-slate-900/80 rounded-3xl border border-slate-800" />
        <div className="h-64 bg-slate-900/80 rounded-2xl border border-slate-800" />
        <div className="h-96 bg-slate-900/80 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      {/* 1. PRIMARY GAMEPLAY ARENA BATTLE (HERO VS ENEMY ENCOUNTER) */}
      <section aria-label="Battle Arena Command Center">
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

      {/* 2. TODAY'S ADVENTURE / DAILY ROADMAP */}
      <section aria-label="Today's Adventure Roadmap">
        <DailyRoadmap
          quests={quests}
          dailyProgress={dailyProgress}
          activeQuestId={focusedQuestId}
          onSelectQuest={(quest) => {
            setFocusedQuestId(quest.id);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </section>

      {/* 3. VICTORY CELEBRATION TOAST */}
      {lastCompletion && (
        <div
          role="status"
          aria-live="polite"
          className="relative flex items-center justify-between p-4 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/40 shadow-[0_0_25px_rgba(245,158,11,0.2)] animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow">
              <CheckCircle2 className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-200 block font-cinzel tracking-wide uppercase">
                Bounty Conquered: &ldquo;{lastCompletion.quest_title}&rdquo;
              </span>
              <div className="flex items-center gap-3 text-xs font-rajdhani font-bold mt-1 flex-wrap">
                <span className="text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> +{lastCompletion.earned_xp} XP
                  {lastCompletion.xp_multiplier > 1.0 && (
                    <span className="text-[10px] text-amber-400/90 font-normal">
                      ({lastCompletion.xp_multiplier}x)
                    </span>
                  )}
                </span>
                <span className="text-yellow-300 flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                  <Coins className="h-3.5 w-3.5 text-yellow-400" /> +{lastCompletion.earned_gold} G
                </span>
                <span className="text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  +{lastCompletion.attribute_gain} {lastCompletion.attribute_increased}
                </span>
                {lastCompletion.streak_extended && (
                  <span className="text-orange-300 flex items-center gap-1 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
                    <Flame className="h-3.5 w-3.5 fill-orange-400/40" />
                    {lastCompletion.current_streak}d Streak!
                  </span>
                )}
                {lastCompletion.unlocked_achievements && lastCompletion.unlocked_achievements.length > 0 && (
                  <span className="text-yellow-200 flex items-center gap-1 font-bold bg-amber-500/25 px-2.5 py-0.5 rounded-lg border border-amber-400/50 shadow">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    Trophy Unlocked: {lastCompletion.unlocked_achievements[0].title}!
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLastCompletion(null)}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-md hover:bg-slate-800/80 transition-colors"
            aria-label="Dismiss completion notice"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* 4. THE REALM OF ASCENSION (Interactive World Map) */}
      <section aria-label="The Realm of Ascension">
        <RealmMap
          attributes={{
            strength: character?.strength ?? 10,
            intellect: character?.intellect ?? 10,
            discipline: character?.discipline ?? 10,
            vitality: character?.vitality ?? 10,
            creativity: character?.creativity ?? 10,
          }}
          quests={quests}
          selectedZone={selectedZone}
          onSelectZone={setSelectedZone}
        />
      </section>

      {/* 5. STREAK CALENDAR & CADENCE TRACKER */}
      <StreakCalendar
        currentStreak={character?.current_streak ?? 0}
        longestStreak={character?.longest_streak ?? 0}
      />

      {/* 6. REALM PORTALS & FAST TRAVEL */}
      <section className="space-y-4" aria-label="Realm Fast Portals">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-cinzel flex items-center gap-2">
          <Compass className="h-4 w-4 text-amber-400" /> Realm Portals & Sanctuaries
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/shop"
            className="group relative p-4 rounded-xl border border-amber-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all flex items-center gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 group-hover:scale-110 transition-transform">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-100 font-cinzel block">Guild Bazaar</span>
              <span className="text-[11px] text-slate-400 font-rajdhani">Fitting Room & Relics</span>
            </div>
          </Link>

          <Link
            href="/inventory"
            className="group relative p-4 rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 hover:border-sky-500/40 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] transition-all flex items-center gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 group-hover:scale-110 transition-transform">
              <Backpack className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-100 font-cinzel block">Relic Vault</span>
              <span className="text-[11px] text-slate-400 font-rajdhani">Equipped Loadout</span>
            </div>
          </Link>

          <Link
            href="/achievements"
            className="group relative p-4 rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all flex items-center gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 group-hover:scale-110 transition-transform">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-100 font-cinzel block">Hall of Legends</span>
              <span className="text-[11px] text-slate-400 font-rajdhani">Realm Milestones</span>
            </div>
          </Link>

          <Link
            href="/history"
            className="group relative p-4 rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all flex items-center gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-100 font-cinzel block">Chronicles</span>
              <span className="text-[11px] text-slate-400 font-rajdhani">Adventure Log</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 7. LEVEL UP CELEBRATION MODAL */}
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
