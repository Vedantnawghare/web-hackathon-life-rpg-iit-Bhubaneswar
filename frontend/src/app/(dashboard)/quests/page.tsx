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
      // 1. Invalidate character query to update HUD XP bar, Gold, and Streak instantly
      queryClient.invalidateQueries({ queryKey: ["character", "me"] });
      // 2. Invalidate quests to reflect updated period completion status
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      // 3. Invalidate achievements and quest history
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.invalidateQueries({ queryKey: ["quest-history"] });

      // 4. Set reward celebration toast
      setLastCompletion(data);

      // 4. Trigger level up modal if leveled up
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

    // Category filter
    if (categoryFilter !== "ALL" && q.category !== categoryFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const match =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.description && q.description.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Sword className="h-6 w-6 text-amber-400" /> Quest Board
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Conquer real-world challenges to earn authoritative XP, Gold, and attribute ranks.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 font-semibold shadow-md shadow-amber-500/10 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Inscribe New Quest
        </Button>
      </div>

      {/* Floating Victory Toast / Banner */}
      {lastCompletion && (
        <div className="relative flex items-center justify-between p-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 shadow-lg shadow-amber-500/10 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                Quest Cleared: &ldquo;{lastCompletion.quest_title}&rdquo;
              </span>
              <div className="flex items-center gap-3 text-xs font-mono font-bold mt-0.5">
                <span className="text-amber-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> +{lastCompletion.earned_xp} XP
                  {lastCompletion.xp_multiplier > 1.0 && (
                    <span className="text-[10px] font-sans font-normal text-amber-300/80">
                      ({lastCompletion.xp_multiplier}x streak)
                    </span>
                  )}
                </span>
                <span className="text-amber-300 flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5" /> +{lastCompletion.earned_gold} G
                </span>
                <span className="text-emerald-400">
                  +{lastCompletion.attribute_gain} {lastCompletion.attribute_increased}
                </span>
                {lastCompletion.streak_extended && (
                  <span className="text-orange-400 flex items-center gap-1 font-sans">
                    <Flame className="h-3.5 w-3.5 fill-orange-400/40" />
                    {lastCompletion.current_streak}d Streak!
                  </span>
                )}
                {lastCompletion.unlocked_achievements && lastCompletion.unlocked_achievements.length > 0 && (
                  <span className="text-yellow-300 flex items-center gap-1 font-sans font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                    <Trophy className="h-3.5 w-3.5" />
                    Achievement Unlocked: {lastCompletion.unlocked_achievements[0].title}!
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLastCompletion(null)}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-md"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Action Error Alert */}
      {actionError && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="p-1 text-slate-400 hover:text-slate-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs">
        {/* Recurrence Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Quests" },
            { id: "DAILY", label: "Daily", icon: Repeat },
            { id: "WEEKLY", label: "Weekly", icon: Calendar },
            { id: "NONE", label: "One-Off" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = recurrenceFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRecurrenceFilter(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap",
                  isSelected
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          {availableCategories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 rounded-md bg-slate-900 border border-slate-800 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {/* Search Input */}
          <div className="relative flex-1 sm:w-48">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quests..."
              className="h-8 pl-8 text-xs bg-slate-900 border-slate-800 focus:border-amber-500 text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Quest Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-lg bg-slate-900/60 border border-slate-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center border border-dashed border-rose-500/30 rounded-lg bg-rose-500/5">
          <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-rose-300">Failed to load quests</p>
          <p className="text-xs text-slate-400 mt-1">Please refresh the ledger or verify connection.</p>
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
          <Sword className="h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">
            {quests.length === 0 ? "Your quest log is empty" : "No quests match your filter"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {quests.length === 0
              ? "Take the first step on your journey by inscribing a daily habit or challenging task."
              : "Try adjusting your search criteria or recurrence filters above."}
          </p>
          {quests.length === 0 && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 gap-2 font-semibold"
            >
              <Plus className="h-4 w-4" /> Inscribe First Quest
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
