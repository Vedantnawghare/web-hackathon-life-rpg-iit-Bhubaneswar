"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { Quest, QuestCompleteResponse } from "@/types/quest";
import { Character } from "@/types/character";
import { QuestCard } from "@/components/rpg/QuestCard";
import { QuestCreateModal } from "@/components/rpg/QuestCreateModal";
import { LevelUpModal } from "@/components/rpg/LevelUpModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sword,
  Plus,
  Search,
  Sparkles,
  Coins,
  Repeat,
  Calendar,
  AlertCircle,
  X,
  Flame,
  CheckCircle2,
  Trophy,
  Scroll,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuestsPage() {
  const queryClient = useQueryClient();

  // Modal & notification states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
  const [lastCompletion, setLastCompletion] = useState<QuestCompleteResponse | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filters
  const [recurrenceFilter, setRecurrenceFilter] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [completingQuestId, setCompletingQuestId] = useState<string | null>(null);
  const [archivingQuestId, setArchivingQuestId] = useState<string | null>(null);

  // Character query for name in celebration
  const { data: character } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
  });

  // Fetch active quests
  const { data: quests = [], isLoading, error } = useQuery<Quest[]>({
    queryKey: ["quests"],
    queryFn: () => apiClient<Quest[]>("/quests?status=ACTIVE"),
  });

  // Complete Quest Mutation
  const completeMutation = useMutation({
    mutationFn: (questId: string) =>
      apiClient<QuestCompleteResponse>(`/quests/${questId}/complete`, {
        method: "POST",
      }),
    onMutate: (questId) => {
      setCompletingQuestId(questId);
      setActionError(null);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["character", "me"] });
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
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError("Failed to clear quest. Please try again.");
      }
    },
    onSettled: () => {
      setCompletingQuestId(null);
    },
  });

  // Archive Quest Mutation
  const archiveMutation = useMutation({
    mutationFn: (questId: string) =>
      apiClient<void>(`/quests/${questId}`, {
        method: "DELETE",
      }),
    onMutate: (questId) => {
      setArchivingQuestId(questId);
      setActionError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError("Failed to archive quest.");
      }
    },
    onSettled: () => {
      setArchivingQuestId(null);
    },
  });

  // Categories extracted from active quests
  const availableCategories = Array.from(
    new Set(quests.map((q) => q.category))
  ).sort();

  // Filtered Quests
  const filteredQuests = quests.filter((q) => {
    // Recurrence filter
    if (recurrenceFilter !== "ALL") {
      if (recurrenceFilter === "NONE" && q.recurrence !== "NONE") return false;
      if (recurrenceFilter === "DAILY" && q.recurrence !== "DAILY") return false;
      if (recurrenceFilter === "WEEKLY" && q.recurrence !== "WEEKLY") return false;
    }

    // Difficulty filter
    if (difficultyFilter !== "ALL" && q.difficulty !== difficultyFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== "ALL" && q.category !== categoryFilter) {
      return false;
    }

    // Search query: matches title, description, category, or attribute
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase().trim();
      const match =
        q.title.toLowerCase().includes(qLower) ||
        (q.description && q.description.toLowerCase().includes(qLower)) ||
        q.category.toLowerCase().includes(qLower) ||
        q.primary_attribute.toLowerCase().includes(qLower);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Adventurer's Guild Notice Board */}
      <section className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/20 p-5 sm:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(245,158,11,0.06),transparent_50%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scroll className="h-6 w-6 text-amber-400" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
                Adventurer&apos;s Guild Bounty Board
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Sanctioned contracts posted across the realm. Conquer your real-world deeds to forge legendary standing.
            </p>
          </div>

          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 font-display font-bold tracking-wide shadow-[0_0_15px_rgba(245,158,11,0.2)] self-start sm:self-auto shrink-0"
          >
            <Plus className="h-4 w-4" /> Inscribe New Bounty
          </Button>
        </div>
      </section>

      {/* Floating Victory Toast / Banner */}
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

      {/* Action Error Alert */}
      {actionError && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="p-1 text-slate-400 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter & Cadence Toolbar */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
          {/* Cadence Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mr-1 font-bold">
              Cadence:
            </span>
            {[
              { id: "ALL", label: "All Bounties" },
              { id: "DAILY", label: "Daily Mandates", icon: Repeat },
              { id: "WEEKLY", label: "Weekly Crusades", icon: Calendar },
              { id: "NONE", label: "One-Off Deeds", icon: Sword },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = recurrenceFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRecurrenceFilter(tab.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-mono text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                    isSelected
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                  )}
                >
                  {Icon && <Icon className="h-3 w-3" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Dropdown */}
            {availableCategories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter quests by category"
                className="h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Disciplines</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              aria-label="Filter quests by difficulty"
              className="h-8 rounded-lg bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Ranks</option>
              <option value="EASY">Common (Rank I)</option>
              <option value="MEDIUM">Uncommon (Rank II)</option>
              <option value="HARD">Rare (Rank III)</option>
              <option value="EPIC">Legendary (Rank IV)</option>
            </select>

            {/* Search Input with Clear Button */}
            <div className="relative flex-1 sm:w-56">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500/70" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contracts..."
                aria-label="Search active quests"
                className="h-8 pl-8 pr-7 text-xs bg-slate-900 border-slate-800 focus:border-amber-500 text-slate-200 font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quest Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-52 rounded-xl bg-slate-900/60 border border-slate-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center border border-dashed border-rose-500/30 rounded-xl bg-rose-500/5">
          <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-rose-300">Failed to load guild bounties</p>
          <p className="text-xs text-slate-400 mt-1">Please verify your leyline connection and try again.</p>
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/60">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-600 mb-3">
            <Sword className="h-10 w-10 text-slate-500" />
          </div>
          <h3 className="text-base font-bold text-slate-200 font-display">
            {quests.length === 0 ? "The Bounty Ledger is Blank" : "No Bounties Match Your Filters"}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-sm">
            {quests.length === 0
              ? "Begin your adventure by inscribing your first habits, training routines, or milestones."
              : "Try adjusting your search criteria or cadence filters above."}
          </p>
          {quests.length === 0 && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-5 gap-2 font-display font-bold"
            >
              <Plus className="h-4 w-4" /> Inscribe First Bounty
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={(id) => completeMutation.mutate(id)}
              isCompleting={completingQuestId === quest.id}
              onArchive={(id) => archiveMutation.mutate(id)}
              isArchiving={archivingQuestId === quest.id}
            />
          ))}
        </div>
      )}

      {/* Quest Creation Modal */}
      <QuestCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
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
