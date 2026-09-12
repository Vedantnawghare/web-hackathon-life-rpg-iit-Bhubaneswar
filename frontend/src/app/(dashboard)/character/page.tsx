"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Character } from "@/types/character";
import { Achievement } from "@/types/achievement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatRadar } from "@/components/rpg/StatRadar";
import { HeroCharacter } from "@/components/rpg/HeroCharacter";
import { HERO_LIST, getHeroArchetype, HeroArchetype } from "@/lib/hero-data";
import { audioManager } from "@/lib/audio-manager";
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
  X,
  Check,
  Users,
} from "lucide-react";
import Link from "next/link";
import { cn, formatGold, formatXP } from "@/lib/utils";

export default function CharacterPage() {
  const queryClient = useQueryClient();
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const { data: character, isLoading: isCharLoading } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: () => apiClient<Achievement[]>("/achievements"),
  });

  const currentHero = getHeroArchetype(character?.hero_class);

  const handleSwapHero = async (newHero: HeroArchetype) => {
    if (newHero.id === character?.hero_class || isSwapping) return;

    setIsSwapping(true);
    try {
      await apiClient<Character>("/characters/me/equip", {
        method: "PATCH",
        body: JSON.stringify({ hero_class: newHero.id }),
      });

      audioManager.playFanfare();
      queryClient.invalidateQueries({ queryKey: ["character", "me"] });
      setShowHeroModal(false);
    } catch (err) {
      console.error("Failed to swap hero archetype:", err);
    } finally {
      setIsSwapping(false);
    }
  };

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
    <div className="space-y-8 select-none">
      {/* 1. HERO SANCTUM PEDESTAL WITH FULL CHARACTER RIG */}
      <section className="relative rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Hero Vector Artwork Staging */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative p-4 rounded-2xl bg-black/60 border border-slate-800 shadow-2xl flex flex-col items-center">
              <HeroCharacter
                heroId={character?.hero_class || "vanguard_male"}
                state="IDLE"
                equippedTheme={character?.equipped_theme}
                size="lg"
                showShadow={true}
              />
              <div className="mt-2 text-center">
                <span className="text-xs font-bold font-cinzel text-amber-400">
                  {currentHero.name} â€” {currentHero.title}
                </span>
                <span className="block text-[11px] text-slate-400 font-rajdhani">
                  Signature Weapon: {currentHero.weapon}
                </span>
              </div>
            </div>

            {/* Change Champion Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHeroModal(true)}
              className="gap-2 text-xs font-cinzel font-bold border-amber-500/50 bg-slate-900 text-amber-300 hover:bg-amber-500 hover:text-slate-950 shadow-md"
            >
              <Users className="h-3.5 w-3.5" /> Change Champion
            </Button>
          </div>

          {/* Right: Character Meta & Progression */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                  <h1 className="text-3xl font-black tracking-tight text-white font-cinzel">
                    {character?.username}
                  </h1>
                  <Badge
                    variant="outline"
                    className="bg-amber-500/20 text-amber-300 border-amber-500/50 font-rajdhani font-bold text-xs shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                  >
                    Rank {character?.current_level ?? 1}
                  </Badge>
                </div>
                <p className="text-sm text-amber-400 font-cinzel font-medium mt-0.5">
                  {character?.title || "Novice Adventurer"}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                <Link href="/inventory">
                  <Button variant="outline" size="sm" className="gap-2 text-xs font-rajdhani border-slate-700 hover:border-amber-500/40">
                    <Backpack className="h-4 w-4 text-amber-400" /> Relic Vault
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="gold" size="sm" className="gap-2 text-xs font-cinzel font-bold">
                    <Store className="h-4 w-4" /> Guild Bazaar
                  </Button>
                </Link>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1.5 max-w-xl">
              <div className="flex justify-between items-center text-xs font-rajdhani">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  Progression to Rank {(character?.current_level ?? 1) + 1}
                </span>
                <span className="font-rajdhani text-amber-300 text-xs font-bold">
                  {formatXP(xpIntoLevel)} / {formatXP(xpRequired)} XP ({xpPercentage}%)
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={xpPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800"
              >
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>

            {/* Treasury & Resolve Stats */}
            <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span className="font-rajdhani font-bold text-sm text-yellow-300">
                  {formatGold(character?.gold ?? 0)} Gold
                </span>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="font-rajdhani font-bold text-sm text-emerald-300">
                  {character?.current_streak ?? 0} Day Streak
                </span>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span className="font-rajdhani font-bold text-sm text-amber-300">
                  {unlockedAchievements.length} Trophies
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CHANGE CHAMPION MODAL */}
      {showHeroModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowHeroModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold font-cinzel text-amber-300">
                SWAP YOUR CHAMPION
              </h2>
              <p className="text-xs text-slate-400 font-rajdhani">
                Switching champion alters your combat avatar across the Arena, Dashboard, and Profile. All level, XP, and gold progression remain intact.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {HERO_LIST.map((hero) => {
                const isCurrent = (character?.hero_class || "vanguard_male") === hero.id;
                return (
                  <div
                    key={hero.id}
                    onClick={() => handleSwapHero(hero)}
                    className={cn(
                      "relative p-3 rounded-xl border-2 flex flex-col items-center text-center cursor-pointer transition-all duration-200",
                      isCurrent
                        ? "bg-slate-900/90 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400"
                        : "bg-slate-950/70 border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100"
                    )}
                  >
                    {isCurrent && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    <div className="h-36 flex items-center justify-center my-1">
                      <HeroCharacter heroId={hero.id} state="IDLE" size="sm" showShadow={false} />
                    </div>

                    <h4 className="text-sm font-bold font-cinzel text-slate-100">{hero.name}</h4>
                    <span className="text-[11px] text-amber-400 font-rajdhani font-semibold">
                      {hero.archetype}
                    </span>
                    <span className="text-[10px] text-slate-400 font-rajdhani mt-1">
                      Weapon: {hero.weapon}
                    </span>

                    <Button
                      size="sm"
                      disabled={isCurrent || isSwapping}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwapHero(hero);
                      }}
                      className={cn(
                        "w-full mt-3 h-8 text-xs font-cinzel font-bold",
                        isCurrent
                          ? "bg-slate-800 text-slate-400 cursor-default"
                          : "bg-amber-600 hover:bg-amber-500 text-slate-950"
                      )}
                    >
                      {isCurrent ? "Active" : "Select Hero"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. RADAR MATRIX & ATTRIBUTE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Astrolabe Radar Matrix */}
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-cinzel flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" /> Astrolabe Radar Matrix
            </CardTitle>
            <CardDescription>Visual balance of your 5 life faculties</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-4">
            <StatRadar
              strength={str}
              intellect={int}
              discipline={dis}
              vitality={vit}
              creativity={cre}
            />
          </CardContent>
        </Card>

        {/* 5 Core Attributes List */}
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-cinzel">Core Life Attributes</CardTitle>
            <CardDescription>Faculties enhanced by clearing bounties across the realm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {attributesList.map((attr) => {
              const Icon = attr.icon;
              const fillPercentage = Math.min(100, Math.round((attr.value / maxAttribute) * 100));
              return (
                <div
                  key={attr.name}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <Icon className={cn("h-4 w-4", attr.color)} />
                      </div>
                      <div>
                        <span className="font-cinzel text-sm font-bold text-slate-200">
                          {attr.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-rajdhani ml-2">
                          Mastery: {attr.mastery.title}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-rajdhani text-lg font-bold text-white">
                        {attr.value}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-rajdhani">{attr.desc}</p>

                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-slate-700 to-amber-500 rounded-full"
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* 4. STREAK CALENDAR & ADVENTURE GEAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StreakCalendar />

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-cinzel flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" /> Adorned Relics
              </CardTitle>
              <Link
                href="/inventory"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-rajdhani font-semibold"
              >
                <span>Relic Vault</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <CardDescription>Active gear & titles currently displayed across the realm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs font-rajdhani">
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
              <span className="font-bold text-purple-300 font-cinzel">
                {character?.title || "Novice Adventurer"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

