"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Character } from "@/types/character";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Brain, Compass, Heart, Palette, Sword, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: character, isLoading } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
  });

  if (isLoading) {
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
            <Button variant="gold" size="sm" className="gap-2">
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

      {/* Today's Quests & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sword className="h-4 w-4 text-amber-400" /> Active Quests
              </CardTitle>
              <Link href="/quests" className="text-xs text-amber-400 hover:underline">
                View All
              </Link>
            </div>
            <CardDescription>
              Real-world tasks ready to be conquered for authoritative rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-lg">
              <Sword className="h-8 w-8 text-slate-600 mb-3" />
              <p className="text-sm text-slate-300 font-medium">No active quests logged yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Begin your journey by crafting your first real-world habit or productivity quest.
              </p>
              <Link href="/quests" className="mt-4">
                <Button variant="secondary" size="sm">
                  Create Quest
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Milestones */}
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
              <span className="text-slate-400">Timezone</span>
              <span className="font-mono text-slate-300">{character?.timezone ?? "UTC"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Equipped Theme</span>
              <span className="text-slate-300 capitalize">
                {character?.equipped_theme?.replace("_", " ") ?? "Default"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
