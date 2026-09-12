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
import { getMasteryTier } from "@/components/rpg/RealmMap";
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
  Store,
} from "lucide-react";
import Link from "next/link";
import { cn, formatGold, formatXP } from "@/lib/utils";

export default function CharacterPage() {
  const { data: character, isLoading: isCharLoading } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: () => apiClient<Achievement[]>("/achievements"),
  });

  if (isCharLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-slate-900/80 rounded-2xl border border-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-900/80 rounded-xl border border-slate-800" />
          <div className="h-80 bg-slate-900/80 rounded-xl border border-slate-800 lg:col-span-2" />
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
      attrKey: "STRENGTH",
      value: str,
      icon: Dumbbell,
      color: "text-rose-400",
      desc: "Physical stamina, workout challenges, and bodily endurance.",
      mastery: getMasteryTier(str),
    },
    {
      name: "Intellect",
      attrKey: "INTELLECT",
      value: int,
      icon: Brain,
      color: "text-sky-400",
      desc: "Analytical power, algorithmic coding, and continuous study.",
      mastery: getMasteryTier(int),
    },
    {
      name: "Discipline",
      attrKey: "DISCIPLINE",
      value: dis,
      icon: Compass,
      color: "text-emerald-400",
      desc: "Consistency of execution, habit adherence, and mindful order.",
      mastery: getMasteryTier(dis),
    },
    {
      name: "Vitality",
      attrKey: "VITALITY",
      value: vit,
      icon: Heart,
      color: "text-amber-400",
      desc: "Sleep hygiene, nutrition, recovery, and overall life balance.",
      mastery: getMasteryTier(vit),
    },
    {
      name: "Creativity",
      attrKey: "CREATIVITY",
      value: cre,
      icon: Palette,
      color: "text-purple-400",
      desc: "Artistic output, writing, open innovation, and lateral design.",
      mastery: getMasteryTier(cre),
    },
  ];

  const unlockedAchievements = achievements.filter((a) => a.is_unlocked);

  const xpIntoLevel = character?.xp_into_current_level ?? 0;
  const xpRequired = character?.xp_required_for_next_level ?? 100;
  const xpPercentage = Math.min(100, Math.max(0, Math.round((xpIntoLevel / (xpRequired || 1)) * 100)));

  return (
    <div className="space-y-8">
      {/* 1. HERO SANCTUM PEDESTAL */}
      <section className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/20 p-6 md:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Equipped Frame */}
          <div className="shrink-0 p-2 rounded-2xl bg-slate-950/60 border border-slate-800 shadow-xl">
            <CosmeticFrame
              frameKey={character?.equipped_frame}
              badgeKey={character?.equipped_badge}
              size="xl"
              username={character?.username}
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
                    {character?.username}
                  </h1>
                  <Badge
                    variant="outline"
                    className="bg-amber-500/20 text-amber-300 border-amber-500/50 font-mono font-bold text-xs shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                  >
                    Rank {character?.current_level ?? 1}
                  </Badge>
                </div>
                <p className="text-sm text-amber-400 font-display font-medium mt-0.5">
                  {character?.title || "Novice Adventurer"}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                <Link href="/inventory">
                  <Button variant="outline" size="sm" className="gap-2 text-xs font-mono border-slate-700 hover:border-amber-500/40">
                    <Backpack className="h-4 w-4 text-amber-400" /> Relic Vault
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="gold" size="sm" className="gap-2 text-xs font-display font-bold">
                    <Store className="h-4 w-4" /> Guild Bazaar
                  </Button>
                </Link>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1.5 max-w-xl">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Progression to Rank {(character?.current_level ?? 1) + 1}
                </span>
                <span className="font-mono text-amber-300 text-xs font-bold">
                  {formatXP(xpIntoLevel)} / {formatXP(xpRequired)} XP ({xpPercentage}%)
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={xpPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Level progression: ${xpPercentage} percent`}
                className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-[1px]"
              >
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>

            {/* Currency & Trophies Badges */}
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/50 border border-amber-500/30 text-amber-300 font-mono font-bold shadow-sm">
                <Coins className="h-4 w-4 text-amber-400" />
                <span>{formatGold(character?.gold ?? 0)} Gold</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>{formatXP(character?.lifetime_xp ?? 0)} Lifetime XP</span>
              </div>
              <Link href="/achievements">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/30 hover:text-amber-300 transition-colors cursor-pointer">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>{unlockedAchievements.length} Trophies</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ATTRIBUTE MATRIX & BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pentagonal Astrolabe Radar */}
        <Card className="lg:col-span-1 bg-slate-950/80 border-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 font-display">
              <Shield className="h-4 w-4 text-amber-400" /> Astrolabe Matrix
            </CardTitle>
            <CardDescription>Pentagonal harmony of your 5 Ascension Domains</CardDescription>
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

        {/* Detailed Attribute Mastery List */}
        <Card className="lg:col-span-2 bg-slate-950/80 border-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base font-display">Territorial Mastery & Domain Ranks</CardTitle>
            <CardDescription>
              Each domain increases permanently upon claiming bounties aligned with its realm.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {attributesList.map((attr) => {
              const Icon = attr.icon;
              const percent = Math.min(100, Math.round((attr.value / (maxAttribute + 5)) * 100));

              return (
                <div
                  key={attr.name}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("p-2 rounded-lg bg-slate-950 border border-slate-800", attr.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100 font-display">
                            {attr.name}
                          </span>
                          <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border font-semibold", attr.mastery.badgeColor)}>
                            {attr.mastery.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-sans">{attr.desc}</span>
                      </div>
                    </div>
                    <span className="font-mono font-black text-sm text-slate-100 shrink-0 pl-2">
                      {attr.value} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* 3. STREAK CADENCE & ACTIVE RELIC LOADOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streak Calendar Component */}
        <StreakCalendar
          currentStreak={character?.current_streak ?? 0}
          longestStreak={character?.longest_streak ?? 0}
        />

        {/* Equipped Relic Loadout */}
        <Card className="bg-slate-950/80 border-slate-800 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 font-display">
                <Sparkles className="h-4 w-4 text-amber-400" /> Adorned Relics
              </CardTitle>
              <Link
                href="/inventory"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono font-semibold"
              >
                <span>Relic Vault</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <CardDescription>Active gear & titles currently displayed across the realm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Leyline Theme</span>
              <span className="font-bold text-amber-300 capitalize">
                {character?.equipped_theme?.replace(/_/g, " ") || "Default Slate"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Avatar Frame</span>
              <span className="font-bold text-amber-300 capitalize">
                {character?.equipped_frame?.replace(/_/g, " ") || "Standard Frame"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Adorned Crest Badge</span>
              <span className="font-bold text-amber-300 capitalize">
                {character?.equipped_badge?.replace(/_/g, " ") || "Default Badge"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Champion Title</span>
              <span className="font-bold text-purple-300 font-display">
                {character?.title || "Novice Adventurer"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
