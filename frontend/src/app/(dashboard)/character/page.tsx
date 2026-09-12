"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Character } from "@/types/character";
import { Achievement } from "@/types/achievement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatRadar } from "@/components/rpg/StatRadar";
import { CosmeticFrame } from "@/components/rpg/CosmeticFrame";
import { StreakCalendar } from "@/components/rpg/StreakCalendar";
import {
  Shield,
  Coins,
  Trophy,
  Dumbbell,
  Brain,
  Compass,
  Heart,
  Palette,
  Sparkles,
  ArrowRight,
  Backpack,
} from "lucide-react";
import Link from "next/link";
import { formatGold, formatXP } from "@/lib/utils";

export default function CharacterPage() {
  const { data: character, isLoading: isCharLoading } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
  });

  const { data: achievements = [], isLoading: isAchLoading } = useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: () => apiClient<Achievement[]>("/achievements"),
  });

  if (isCharLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-900 rounded-xl border border-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-900 rounded-xl border border-slate-800" />
          <div className="h-80 bg-slate-900 rounded-xl border border-slate-800 lg:col-span-2" />
        </div>
      </div>
    );
  }

  const str = character?.strength ?? 10;
  const int = character?.intellect ?? 10;
  const dis = character?.discipline ?? 10;
  const vit = character?.vitality ?? 10;
  const cre = character?.creativity ?? 10;

  const maxAttribute = Math.max(str, int, dis, vit, cre, 20);

  const attributesList = [
    {
      name: "Strength",
      value: str,
      icon: Dumbbell,
      color: "text-rose-400",
      desc: "Physical stamina, workout challenges, and raw endurance.",
    },
    {
      name: "Intellect",
      value: int,
      icon: Brain,
      color: "text-sky-400",
      desc: "Analytical power, algorithmic coding, and continuous learning.",
    },
    {
      name: "Discipline",
      value: dis,
      icon: Compass,
      color: "text-emerald-400",
      desc: "Consistency of execution, habit adherence, and mindful order.",
    },
    {
      name: "Vitality",
      value: vit,
      icon: Heart,
      color: "text-amber-400",
      desc: "Sleep hygiene, nutrition, recovery, and overall life balance.",
    },
    {
      name: "Creativity",
      value: cre,
      icon: Palette,
      color: "text-purple-400",
      desc: "Artistic output, writing, open innovation, and lateral design.",
    },
  ];

  const unlockedAchievements = achievements.filter((a) => a.is_unlocked);

  const xpIntoLevel = character?.xp_into_current_level ?? 0;
  const xpRequired = character?.xp_required_for_next_level ?? 100;
  const xpPercentage = Math.min(100, Math.max(0, Math.round((xpIntoLevel / (xpRequired || 1)) * 100)));

  return (
    <div className="space-y-8">
      {/* Header Profile Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 shadow-xl">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Equipped Frame */}
          <CosmeticFrame
            frameKey={character?.equipped_frame}
            badgeKey={character?.equipped_badge}
            size="xl"
            username={character?.username}
          />

          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {character?.username}
                  </h1>
                  <Badge variant="gold" className="text-xs px-2.5 py-0.5">
                    Level {character?.current_level ?? 1}
                  </Badge>
                </div>
                <p className="text-sm text-amber-300/90 font-medium mt-0.5">
                  {character?.title || "Novice Adventurer"}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Link href="/inventory">
                  <Button variant="outline" size="sm" className="gap-2 text-xs">
                    <Backpack className="h-4 w-4" /> Manage Relics
                  </Button>
                </Link>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1.5 max-w-xl">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  Progression to Level {(character?.current_level ?? 1) + 1}
                </span>
                <span className="font-mono text-amber-300 text-[11px] font-bold">
                  {formatXP(xpIntoLevel)} / {formatXP(xpRequired)} XP ({xpPercentage}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>

            {/* Currency & Metadata Badges */}
            <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-950/40 border border-amber-500/20 text-amber-300 font-mono font-bold">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span>{formatGold(character?.gold ?? 0)} Gold</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>{formatXP(character?.lifetime_xp ?? 0)} Lifetime XP</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>{unlockedAchievements.length} Achievements</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attributes & Radar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pentagonal Radar Chart Card */}
        <Card className="lg:col-span-1 bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" /> Attribute Matrix
            </CardTitle>
            <CardDescription>Pentagonal balance of your 5 core attributes</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pt-2">
            <StatRadar
              strength={str}
              intellect={int}
              discipline={dis}
              vitality={vit}
              creativity={cre}
              maxStat={maxAttribute + 5}
            />
          </CardContent>
        </Card>

        {/* Detailed Attribute Breakdown */}
        <Card className="lg:col-span-2 bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Attribute Breakdown & Mastery</CardTitle>
            <CardDescription>
              Attributes increase permanently when clearing quests aligned with their domain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {attributesList.map((attr) => {
              const Icon = attr.icon;
              const percent = Math.min(100, Math.round((attr.value / (maxAttribute + 5)) * 100));

              return (
                <div
                  key={attr.name}
                  className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50 hover:border-slate-700 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-md bg-slate-900 ${attr.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">
                          {attr.name}
                        </span>
                        <span className="text-[11px] text-slate-400">{attr.desc}</span>
                      </div>
                    </div>
                    <span className="font-mono font-black text-sm text-slate-100">
                      {attr.value}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Streak Tracker & Equipped Cosmetics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streak Calendar Component */}
        <StreakCalendar
          currentStreak={character?.current_streak ?? 0}
          longestStreak={character?.current_streak ?? 0}
        />

        {/* Equipped Cosmetics Roster */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" /> Active Loadout
              </CardTitle>
              <Link
                href="/inventory"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <span>Inventory</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <CardDescription>Cosmetic relics currently adorned by your champion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Equipped Theme</span>
              <span className="font-mono font-semibold text-amber-300 capitalize">
                {character?.equipped_theme?.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Avatar Frame</span>
              <span className="font-mono font-semibold text-amber-300 capitalize">
                {character?.equipped_frame?.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Adorned Badge</span>
              <span className="font-mono font-semibold text-amber-300 capitalize">
                {character?.equipped_badge?.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Champion Title</span>
              <span className="font-semibold text-purple-300">
                {character?.title || "Novice Adventurer"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unlocked Achievements Gallery Showcase */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" /> Trophies of Honor
            </CardTitle>
            <Link
              href="/achievements"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <span>View All Achievements ({achievements.length})</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <CardDescription>
            {unlockedAchievements.length} of {achievements.length} realm milestones unlocked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAchLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-900 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : unlockedAchievements.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
              <Trophy className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-medium">No trophies forged yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Clear your first quest or maintain a daily streak to unlock legendary honors.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {unlockedAchievements.slice(0, 6).map((ach) => (
                <div
                  key={ach.id}
                  className="p-3.5 rounded-lg border border-amber-500/30 bg-slate-950/80 flex items-start gap-3 shadow-sm"
                >
                  <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-200 block truncate">
                      {ach.title}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-1 block mt-0.5">
                      {ach.description}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold block mt-1">
                      +{ach.reward_gold} G • +{ach.reward_xp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
