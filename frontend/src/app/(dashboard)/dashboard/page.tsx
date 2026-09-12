"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Character, DailyProgress } from "@/types/character";
import { Quest, QuestCompleteResponse, CharacterAttribute } from "@/types/quest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LevelUpModal } from "@/components/rpg/LevelUpModal";
import { CosmeticFrame } from "@/components/rpg/CosmeticFrame";
import { StreakCalendar } from "@/components/rpg/StreakCalendar";
import { RealmMap } from "@/components/rpg/RealmMap";
import { QuestCard } from "@/components/rpg/QuestCard";
import { ArenaBattle } from "@/components/rpg/ArenaBattle";
import {
  Sword,
  Trophy,
  CheckCircle2,
  Sparkles,
  Coins,
  ArrowRight,
  Flame,
  Shield,
  ShoppingBag,
  Backpack,
  BookOpen,
  X,
  Compass,
  Scroll,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [selectedZone, setSelectedZone] = useState<CharacterAttribute | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "DAILY" | "WEEKLY">("ALL");
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

  // Filter quests by selected zone and recurrence
  const filteredQuests = useMemo(() => {
    return quests.filter((q) => {
      if (selectedZone && q.primary_attribute !== selectedZone) {
        return false;
      }
      if (filterType === "DAILY" && q.recurrence !== "DAILY") return false;
      if (filterType === "WEEKLY" && q.recurrence !== "WEEKLY") return false;
      return true;
    });
  }, [quests, selectedZone, filterType]);

  if (isCharacterLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-96 bg-slate-900/80 rounded-3xl border border-slate-800" />
        <div className="h-32 bg-slate-900/80 rounded-2xl border border-slate-800" />
        <div className="h-96 bg-slate-900/80 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  // Calculate Streak Bonus percentage
  const streakMultiplierPercent = character?.current_streak
    ? Math.min(50, character.current_streak * 2)
    : 0;

  return (
    <div className="space-y-8">
      {/* 1. PRIMARY GAMEPLAY ARENA BATTLE (HERO VS ENEMY ENCOUNTER) */}
      <ArenaBattle
        character={character}
        quests={quests}
        dailyProgress={dailyProgress}
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

      {/* 2. HERO SANCTUM & STATUS PEDESTAL */}
      <section className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900/90 to-amber-950/20 p-5 sm:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Ambient Pedestal Light */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Hero Avatar & Identity */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <CosmeticFrame
                size="lg"
                username={character?.username || "Adventurer"}
                frameKey={character?.equipped_frame || "default_frame"}
                badgeKey={character?.equipped_badge || "default_badge"}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
                  {character?.username || "Adventurer"}
                </h1>
                <Badge
                  variant="outline"
                  className="bg-amber-500/20 text-amber-300 border-amber-500/50 font-mono font-bold text-xs shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                >
                  Rank {character?.current_level || 1}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-amber-400/90 font-display">
                <span>{character?.title || "Novice Adventurer"}</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-mono">
                  {character?.timezone || "UTC"} Leyline
                </span>
              </div>

              {/* Active Streak Multiplier Callout */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-950/40 border border-orange-500/30 text-orange-300 text-xs font-mono font-semibold">
                <Flame className="h-3.5 w-3.5 fill-orange-400/40 animate-pulse text-orange-400" />
                <span>
                  {character?.current_streak || 0}-Day Streak Multiplier:{" "}
                  <strong className="text-orange-200">+{streakMultiplierPercent}% XP</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Portals */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/quests">
              <Button
                variant="gold"
                size="sm"
                className="gap-2 font-display font-bold tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                <Scroll className="h-4 w-4" /> Inscribe Bounty
              </Button>
            </Link>
            <Link href="/character">
              <Button variant="secondary" size="sm" className="gap-1.5 font-medium border border-slate-700">
                <Shield className="h-4 w-4 text-amber-400" /> Hero Sheet
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" size="sm" className="gap-1.5 font-medium border-slate-700 hover:border-amber-500/40">
                <ShoppingBag className="h-4 w-4 text-amber-300" /> Guild Bazaar
              </Button>
            </Link>
          </div>
        </div>
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
              <span className="text-xs font-bold text-amber-200 block font-display tracking-wide uppercase">
                Bounty Conquered: &ldquo;{lastCompletion.quest_title}&rdquo;
              </span>
              <div className="flex items-center gap-3 text-xs font-mono font-bold mt-1 flex-wrap">
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
                  <span className="text-orange-300 flex items-center gap-1 font-sans bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
                    <Flame className="h-3.5 w-3.5 fill-orange-400/40" />
                    {lastCompletion.current_streak}d Streak!
                  </span>
                )}
                {lastCompletion.unlocked_achievements && lastCompletion.unlocked_achievements.length > 0 && (
                  <span className="text-yellow-200 flex items-center gap-1 font-sans font-bold bg-amber-500/25 px-2.5 py-0.5 rounded-lg border border-amber-400/50 shadow">
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

      {/* 5. ADVENTURER'S GUILD BOUNTY BOARD */}
      <section className="space-y-4" aria-label="Adventurer's Guild Bounty Board">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sword className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 font-display">
              Guild Bounty Board
            </h2>
            <span className="text-xs font-mono text-slate-400 ml-1">
              ({filteredQuests.length} {filteredQuests.length === 1 ? "bounty" : "bounties"})
            </span>
          </div>

          {/* Filter Tabs & Link to All */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                  filterType === "ALL"
                    ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType("DAILY")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                  filterType === "DAILY"
                    ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                Daily Mandates
              </button>
              <button
                type="button"
                onClick={() => setFilterType("WEEKLY")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                  filterType === "WEEKLY"
                    ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                Weekly Crusades
              </button>
            </div>

            <Link
              href="/quests"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono font-semibold pl-1"
            >
              <span>Full Archive</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Quests Grid */}
        {isQuestsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-xl bg-slate-900/80 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : filteredQuests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/60">
            <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-600 mb-3">
              <Scroll className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-200 font-display">
              No Active Bounties in this Territory
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-md font-sans">
              {selectedZone
                ? `You have conquered all current challenges in this realm zone or have not posted any bounties yet.`
                : `Your ledger is clear. Visit the Guild Quest Board to inscribe your next habit or milestone.`}
            </p>
            <div className="flex items-center gap-3 mt-5">
              {selectedZone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedZone(null)}
                  className="text-xs font-mono border-slate-700"
                >
                  Clear Realm Filter
                </Button>
              )}
              <Link href="/quests">
                <Button variant="gold" size="sm" className="text-xs font-display font-bold">
                  Inscribe New Bounty
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onComplete={(id) => completeMutation.mutate(id)}
                isCompleting={completingQuestId === quest.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* 6. STREAK CALENDAR & CADENCE TRACKER */}
      <StreakCalendar
        currentStreak={character?.current_streak ?? 0}
        longestStreak={character?.longest_streak ?? 0}
      />

      {/* 7. REALM PORTALS & FAST EXPEDITIONS */}
      <section className="space-y-4" aria-label="Realm Fast Portals">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-display flex items-center gap-2">
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
              <span className="font-bold text-sm text-slate-100 font-display block">Guild Bazaar</span>
              <span className="text-[11px] text-slate-400 font-mono">Unlock Relics & Themes</span>
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
              <span className="font-bold text-sm text-slate-100 font-display block">Relic Vault</span>
              <span className="text-[11px] text-slate-400 font-mono">Equip Frame & Badges</span>
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
              <span className="font-bold text-sm text-slate-100 font-display block">Hall of Trophies</span>
              <span className="text-[11px] text-slate-400 font-mono">Realm Milestones</span>
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
              <span className="font-bold text-sm text-slate-100 font-display block">Chronicles</span>
              <span className="text-[11px] text-slate-400 font-mono">Ledger of Deeds</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 8. LEVEL UP CELEBRATION MODAL */}
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
