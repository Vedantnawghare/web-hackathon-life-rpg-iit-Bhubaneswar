"use client";

import { useMemo } from "react";
import { CharacterAttribute, Quest } from "@/types/quest";
import { Brain, Dumbbell, Compass, Heart, Palette, Sparkles, MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RealmMapProps {
  attributes: {
    strength: number;
    intellect: number;
    discipline: number;
    vitality: number;
    creativity: number;
  };
  quests?: Quest[];
  selectedZone: CharacterAttribute | null;
  onSelectZone: (zone: CharacterAttribute | null) => void;
}

interface ZoneDefinition {
  id: CharacterAttribute;
  name: string;
  subtitle: string;
  description: string;
  icon: typeof Brain;
  colorName: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
  bgGradient: string;
  chipBg: string;
  posDesktop: { x: number; y: number }; // Percentage positions on map canvas
}

const ZONES: ZoneDefinition[] = [
  {
    id: "INTELLECT",
    name: "Mindpeak Spire",
    subtitle: "Celestial Observatory",
    description: "Floating obsidian islands deciphering the ancient arcane scripts of knowledge & study.",
    icon: Brain,
    colorName: "Azure",
    textColor: "text-sky-400",
    borderColor: "border-sky-500/50",
    glowColor: "rgba(56, 189, 248, 0.35)",
    bgGradient: "from-sky-950/70 via-slate-950/80 to-slate-950",
    chipBg: "bg-sky-500/15 border-sky-500/30 text-sky-300",
    posDesktop: { x: 22, y: 30 },
  },
  {
    id: "STRENGTH",
    name: "The Iron Grounds",
    subtitle: "Basalt Colosseum",
    description: "Volcanic forges where iron wills clash to harden bodily resilience & physical endurance.",
    icon: Dumbbell,
    colorName: "Crimson",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/50",
    glowColor: "rgba(244, 63, 94, 0.35)",
    bgGradient: "from-rose-950/70 via-slate-950/80 to-slate-950",
    chipBg: "bg-rose-500/15 border-rose-500/30 text-rose-300",
    posDesktop: { x: 78, y: 28 },
  },
  {
    id: "DISCIPLINE",
    name: "Sanctum of Discipline",
    subtitle: "Monolithic Zen Temple",
    description: "Cascading jade waterfalls where quiet consistency anchors immovable daily resolve.",
    icon: Compass,
    colorName: "Emerald",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/50",
    glowColor: "rgba(16, 185, 129, 0.35)",
    bgGradient: "from-emerald-950/70 via-slate-950/80 to-slate-950",
    chipBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    posDesktop: { x: 50, y: 16 },
  },
  {
    id: "VITALITY",
    name: "Springs of Vitalis",
    subtitle: "Sunlit Flora Glade",
    description: "Restorative golden waters rejuvenating health, sleep restoration, and somatic vitality.",
    icon: Heart,
    colorName: "Amber",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/50",
    glowColor: "rgba(245, 158, 11, 0.35)",
    bgGradient: "from-amber-950/70 via-slate-950/80 to-slate-950",
    chipBg: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    posDesktop: { x: 30, y: 76 },
  },
  {
    id: "CREATIVITY",
    name: "The Arcanum",
    subtitle: "Prismatic Workshop",
    description: "Floating crystal spires sparking unbridled invention, design, and boundless creative output.",
    icon: Palette,
    colorName: "Violet",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/50",
    glowColor: "rgba(192, 132, 252, 0.35)",
    bgGradient: "from-purple-950/70 via-slate-950/80 to-slate-950",
    chipBg: "bg-purple-500/15 border-purple-500/30 text-purple-300",
    posDesktop: { x: 70, y: 74 },
  },
];

export function getMasteryTier(score: number): { title: string; tier: string; badgeColor: string } {
  if (score >= 50) return { title: "Mythic Sovereign", tier: "Tier IV", badgeColor: "text-purple-400 border-purple-500/40 bg-purple-500/10" };
  if (score >= 30) return { title: "Grand Master", tier: "Tier III", badgeColor: "text-amber-400 border-amber-500/40 bg-amber-500/10" };
  if (score >= 18) return { title: "Silver Adept", tier: "Tier II", badgeColor: "text-sky-400 border-sky-500/40 bg-sky-500/10" };
  return { title: "Iron Novice", tier: "Tier I", badgeColor: "text-slate-400 border-slate-700 bg-slate-800/40" };
}

export function RealmMap({
  attributes,
  quests = [],
  selectedZone,
  onSelectZone,
}: RealmMapProps) {
  // Count active quests per attribute/zone
  const zoneBountyCounts = useMemo(() => {
    const counts: Record<CharacterAttribute, number> = {
      INTELLECT: 0,
      STRENGTH: 0,
      DISCIPLINE: 0,
      VITALITY: 0,
      CREATIVITY: 0,
    };
    for (const q of quests) {
      if (counts[q.primary_attribute] !== undefined) {
        counts[q.primary_attribute]++;
      }
    }
    return counts;
  }, [quests]);

  const getAttributeValue = (attr: CharacterAttribute) => {
    switch (attr) {
      case "INTELLECT":
        return attributes.intellect;
      case "STRENGTH":
        return attributes.strength;
      case "DISCIPLINE":
        return attributes.discipline;
      case "VITALITY":
        return attributes.vitality;
      case "CREATIVITY":
        return attributes.creativity;
    }
  };

  return (
    <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-900/90 p-4 sm:p-6 overflow-hidden shadow-[0_10px_35px_rgba(0,0,0,0.7)]">
      {/* Background Cartography Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(51,65,85,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.08)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 font-display flex items-center gap-2">
              <span>The Realm of Ascension</span>
              <span className="text-xs font-mono font-normal text-amber-400/80 px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10">
                5 Zones
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            The living world mirrors your real-world progress. Click any territorial zone to focus your guild bounties.
          </p>
        </div>

        {/* Filter Clear or Active Filter Pill */}
        <div className="flex items-center gap-2">
          {selectedZone ? (
            <button
              onClick={() => onSelectZone(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-mono font-semibold transition-colors cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Reset Realm Filter</span>
            </button>
          ) : (
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider px-2 py-1 rounded bg-slate-900 border border-slate-800">
              Showing All Territories
            </span>
          )}
        </div>
      </div>

      {/* Desktop & Tablet Interactive 2D Map Canvas */}
      <div className="relative z-10 hidden md:block my-4 h-[380px] w-full rounded-xl bg-slate-950/80 border border-slate-800/80 overflow-hidden shadow-inner">
        {/* SVG Leyline Conduit Connectors */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden="true">
          <defs>
            <linearGradient id="leyline-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.4)" />
              <stop offset="50%" stopColor="rgba(56, 189, 248, 0.3)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.4)" />
            </linearGradient>
          </defs>
          {/* Connecting lines between central node (Discipline) and outer nodes */}
          <line x1="50%" y1="20%" x2="22%" y2="34%" stroke="url(#leyline-gold)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
          <line x1="50%" y1="20%" x2="78%" y2="32%" stroke="url(#leyline-gold)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
          <line x1="22%" y1="34%" x2="30%" y2="78%" stroke="url(#leyline-gold)" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="78%" y1="32%" x2="70%" y2="76%" stroke="url(#leyline-gold)" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="30%" y1="78%" x2="70%" y2="76%" stroke="url(#leyline-gold)" strokeWidth="2" strokeDasharray="4 4" />
          {/* Compass Rose watermark at center */}
          <circle cx="50%" cy="52%" r="58" fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="1" />
          <circle cx="50%" cy="52%" r="40" fill="none" stroke="rgba(245,158,11,0.08)" strokeWidth="1" strokeDasharray="3 3" />
        </svg>

        {/* Map Center Rune Emblem */}
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none">
          <span className="text-[10px] font-display uppercase tracking-[0.25em] text-amber-500/40 block font-bold">
            Nexus of Ascension
          </span>
          <span className="text-[9px] font-mono text-slate-600 block mt-0.5">
            Real-World Dominion
          </span>
        </div>

        {/* 5 Interactive Territory Zone Nodes */}
        {ZONES.map((zone) => {
          const isSelected = selectedZone === zone.id;
          const score = getAttributeValue(zone.id);
          const mastery = getMasteryTier(score);
          const bountyCount = zoneBountyCounts[zone.id];
          const Icon = zone.icon;

          return (
            <div
              key={zone.id}
              style={{
                left: `${zone.posDesktop.x}%`,
                top: `${zone.posDesktop.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              className="absolute z-20"
            >
              <button
                type="button"
                onClick={() => onSelectZone(isSelected ? null : zone.id)}
                aria-pressed={isSelected}
                aria-label={`Zone: ${zone.name}, Attribute: ${zone.id}, Score: ${score}, Active Bounties: ${bountyCount}`}
                className={cn(
                  "group relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer backdrop-blur-md",
                  isSelected
                    ? "bg-slate-900/95 ring-2 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)] scale-105 z-30"
                    : "bg-slate-950/90 hover:bg-slate-900/95 hover:scale-102 shadow-lg",
                  zone.borderColor
                )}
              >
                {/* Zone Attribute Emblem */}
                <div
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-lg border p-2 shrink-0 transition-transform group-hover:rotate-6",
                    zone.chipBg
                  )}
                  style={{
                    boxShadow: isSelected ? `0 0 15px ${zone.glowColor}` : undefined,
                  }}
                >
                  <Icon className={cn("h-6 w-6", zone.textColor)} />
                  {bountyCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-mono font-bold text-slate-950 shadow">
                      {bountyCount}
                    </span>
                  )}
                </div>

                {/* Zone Details */}
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-100 font-display truncate">
                      {zone.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn("font-mono font-bold text-sm", zone.textColor)}>
                      {score} <span className="text-[10px] uppercase font-normal text-slate-400">{zone.id.slice(0, 3)}</span>
                    </span>
                    <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border font-semibold", mastery.badgeColor)}>
                      {mastery.title}
                    </span>
                  </div>
                </div>

                {/* Pin Marker indicator */}
                {isSelected && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-mono font-black uppercase tracking-wider shadow">
                    <MapPin className="h-2.5 w-2.5" />
                    <span>Engaged</span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Mobile & Tablet Zone Selector Cards */}
      <div className="md:hidden relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
        {ZONES.map((zone) => {
          const isSelected = selectedZone === zone.id;
          const score = getAttributeValue(zone.id);
          const mastery = getMasteryTier(score);
          const bountyCount = zoneBountyCounts[zone.id];
          const Icon = zone.icon;

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onSelectZone(isSelected ? null : zone.id)}
              aria-pressed={isSelected}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer",
                isSelected
                  ? "bg-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400"
                  : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("p-2 rounded-lg border shrink-0", zone.chipBg)}>
                  <Icon className={cn("h-4 w-4", zone.textColor)} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-200 font-display truncate">
                      {zone.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="h-3 w-3 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {zone.id}: <strong className={zone.textColor}>{score}</strong> • {mastery.title}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-right pl-2">
                <span className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-[10px] text-amber-300 font-semibold">
                  {bountyCount} {bountyCount === 1 ? "bounty" : "bounties"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Realm Zone Lore Box if selected */}
      {selectedZone && (
        <div className="relative z-10 mt-3 p-3.5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-950 to-amber-950/20 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-slate-200 block font-display">
                Focus Territory: {ZONES.find((z) => z.id === selectedZone)?.name}
              </span>
              <span className="text-slate-400 text-[11px] block mt-0.5">
                {ZONES.find((z) => z.id === selectedZone)?.description}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectZone(null)}
            className="text-xs text-amber-400 hover:text-amber-300 underline font-mono shrink-0 cursor-pointer"
          >
            Show All
          </button>
        </div>
      )}
    </div>
  );
}
