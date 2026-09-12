"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Character } from "@/types/character";
import { Quest, QuestCompleteResponse } from "@/types/quest";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LevelUpModal } from "@/components/rpg/LevelUpModal";
import {
  Dumbbell,
  Brain,
  Compass,
  Heart,
  Palette,
  Sword,
  Trophy,
  CheckCircle2,
  Sparkles,
  Coins,
  Loader2,
  ArrowRight,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [completingQuestId, setCompletingQuestId] = useState<string | null>(null);
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
      queryClient.invalidateQueries({ queryKey: ["quests"] });

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

  if (isCharacterLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-slate-900 rounded-lg border border-slate-800"></div>
          <div className="h-44 bg-slate-900 rounded-lg border border-slate-800"></div>
          <div className="h-44 bg-slate-900 rounded-lg border border-slate-800"></div>
        </div>
      </div>
    );
  }

  const attributes = [
    { name: "Strength", value: character?.strength ?? 10, icon: Dumbbell, color: "text-rose-400", border: "border-rose-500/20" },
    { name: "Intellect", value: character?.intellect ?? 10, icon: Brain, color: "text-blue-400", border: "border-blue-500/20" },
    { name: "Discipline", value: character?.discipline ?? 10, icon: Compass, color: "text-emerald-400", border: "border-emerald-500/20" },
    { name: "Vitality", value: character?.vitality ?? 10, icon: Heart, color: "text-amber-400", border: "border-amber-500/20" },
    { name: "Creativity", value: character?.creativity ?? 10, icon: Palette, color: "text-purple-400", border: "border-purple-500/20" },
  ];

  // Up to 4 active quests for quick access, prioritized by uncompleted first
  const activeQuests = [...quests]
    .sort((a, b) => {
      if (a.is_completed_for_period === b.is_completed_for_period) return 0;
      return a.is_completed_for_period ? 1 : -1;
    })
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              {character?.username || "Adventurer"}
            </h1>
            <Badge variant="gold">Level {character?.current_level || 1}</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">{character?.title || "Novice Adventurer"}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/quests">
            <Button variant="gold" size="sm" className="gap-2 font-semibold">
              <Sword className="h-4 w-4" /> Open Quest Board
            </Button>
          </Link>
        </div>
      </div>

      {/* Attributes Overview */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Core Character Attributes
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {attributes.map((attr) => {
            const Icon = attr.icon;
            return (
              <Card key={attr.name} className={`bg-slate-900/60 ${attr.border}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-md bg-slate-800 ${attr.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">{attr.name}</span>
                    <span className="text-lg font-bold text-slate-100 font-mono">
                      {attr.value}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Today's Quests & Campaign Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Quests Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sword className="h-4 w-4 text-amber-400" /> Active Quests
              </CardTitle>
              <Link
                href="/quests"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <span>View All ({quests.length})</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <CardDescription>
              Conquer these challenges today to advance your character
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isQuestsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-md bg-slate-900 animate-pulse" />
                ))}
              </div>
            ) : activeQuests.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-lg">
                <Sword className="h-8 w-8 text-slate-600 mb-3" />
                <p className="text-sm text-slate-300 font-medium">No active quests logged yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Begin your journey by creating your first daily habit or productivity challenge.
                </p>
                <Link href="/quests" className="mt-4">
                  <Button variant="secondary" size="sm">
                    Inscribe Quest
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeQuests.map((quest) => {
                  const isCompleted = quest.is_completed_for_period;
                  const isCompleting = completingQuestId === quest.id;

                  return (
                    <div
                      key={quest.id}
                      className={cn(
                        "flex items-center justify-between gap-4 p-3.5 rounded-lg border transition-colors",
                        isCompleted
                          ? "bg-slate-900/30 border-slate-800/60 opacity-80"
                          : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={cn(
                              "font-semibold text-xs sm:text-sm truncate text-slate-100",
                              isCompleted && "line-through text-slate-400"
                            )}
                          >
                            {quest.title}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                            {quest.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                          <span className="text-amber-400 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> +{quest.base_xp} XP
                          </span>
                          <span className="text-amber-300 flex items-center gap-1">
                            <Coins className="h-3 w-3" /> +{quest.base_gold} G
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 font-sans uppercase text-[10px]">
                            {quest.category}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Cleared
                          </span>
                        ) : (
                          <Button
                            variant="gold"
                            size="sm"
                            disabled={isCompleting}
                            onClick={() => completeMutation.mutate(quest.id)}
                            className="h-8 text-xs font-semibold gap-1.5"
                          >
                            {isCompleting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <Sword className="h-3.5 w-3.5" />
                                <span>Clear</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" /> Campaign Progress
            </CardTitle>
            <CardDescription>Overall progression statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Total Lifetime XP</span>
              <span className="font-mono font-semibold text-slate-200">
                {character?.lifetime_xp ?? 0} XP
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Current Gold</span>
              <span className="font-mono font-semibold text-amber-300">
                {character?.gold ?? 0} G
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">XP to Next Level</span>
              <span className="font-mono font-semibold text-amber-400">
                {character?.xp_required_for_next_level
                  ? character.xp_required_for_next_level - character.xp_into_current_level
                  : 100}{" "}
                XP
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Active Daily Streak</span>
              <span className="font-mono font-semibold text-orange-400 flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 fill-orange-400/30" />
                {character?.current_streak ?? 0} days
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Timezone</span>
              <span className="font-mono text-slate-300">{character?.timezone ?? "UTC"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

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
