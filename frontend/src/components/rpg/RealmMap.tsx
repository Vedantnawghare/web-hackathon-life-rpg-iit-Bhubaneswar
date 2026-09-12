"use client";
/* eslint-disable @next/next/no-img-element */
import { GAME_ASSETS } from "@/lib/game-assets";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CharacterAttribute, Quest } from "@/types/quest";
import {
  Brain,
  Dumbbell,
  Compass,
  Heart,
  Palette,
  MapPin,
  Castle,
  X,
} from "lucide-react";
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
  regionType: string;
  description: string;
  icon: typeof Brain;
  colorName: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
  bgGradient: string;
  chipBg: string;
  posDesktop: { x: number; y: number }; // Percentage positions on map canvas
  svgPath: string; // Map feature shape
}

const ZONES: ZoneDefinition[] = [
  {
    id: "INTELLECT",
    name: "Mindpeak Archipelago",
    subtitle: "Celestial Spire & Astral Atoll",
    regionType: "Floating Obsidian Spires",
    description: "Floating islands deciphering ancient arcane manuscripts, deep focus, and study rituals.",
    icon: Brain,
    colorName: "Azure",
    textColor: "text-sky-400",
    borderColor: "border-sky-500/60",
    glowColor: "rgba(56, 189, 248, 0.4)",
    bgGradient: "from-sky-950/80 via-slate-950 to-black",
    chipBg: "bg-sky-500/20 border-sky-400/50 text-sky-200",
    posDesktop: { x: 20, y: 28 },
    svgPath: "M 15 25 Q 22 18, 30 24 T 35 38 Q 28 45, 18 42 Z",
  },
  {
    id: "STRENGTH",
    name: "The Iron Crags",
    subtitle: "Basalt Caldera & Forges",
    regionType: "Volcanic Jagged Peaks",
    description: "Active magma peaks where champions forge physical resilience, power, and unyielding stamina.",
    icon: Dumbbell,
    colorName: "Crimson",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/60",
    glowColor: "rgba(244, 63, 94, 0.4)",
    bgGradient: "from-rose-950/80 via-slate-950 to-black",
    chipBg: "bg-rose-500/20 border-rose-400/50 text-rose-200",
    posDesktop: { x: 80, y: 26 },
    svgPath: "M 70 20 Q 82 15, 92 25 T 90 40 Q 78 46, 68 36 Z",
  },
  {
    id: "DISCIPLINE",
    name: "Sanctum of the Jade Falls",
    subtitle: "Monolithic Zen Citadel",
    regionType: "Highland Valley Temple",
    description: "Steep highland cliffs and cascading waters where daily habit consistency anchors your destiny.",
    icon: Compass,
    colorName: "Emerald",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/60",
    glowColor: "rgba(16, 185, 129, 0.4)",
    bgGradient: "from-emerald-950/80 via-slate-950 to-black",
    chipBg: "bg-emerald-500/20 border-emerald-400/50 text-emerald-200",
    posDesktop: { x: 50, y: 16 },
    svgPath: "M 42 10 Q 52 5, 62 12 T 60 26 Q 48 30, 40 22 Z",
  },
  {
    id: "VITALITY",
    name: "Springs of Vitalis",
    subtitle: "Sunlit Oasis & Restorative Glade",
    regionType: "Coastal Golden Lagoons",
    description: "Luminescent restorative waters nourishing sleep, physical rejuvenation, and nutritional balance.",
    icon: Heart,
    colorName: "Amber",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/60",
    glowColor: "rgba(245, 158, 11, 0.4)",
    bgGradient: "from-amber-950/80 via-slate-950 to-black",
    chipBg: "bg-amber-500/20 border-amber-400/50 text-amber-200",
    posDesktop: { x: 26, y: 76 },
    svgPath: "M 18 68 Q 30 62, 38 72 T 34 88 Q 22 92, 16 80 Z",
  },
  {
    id: "CREATIVITY",
    name: "The Celestial Arcanum",
    subtitle: "World Tree of Inspiration",
    regionType: "Prismatic Ancient Grove",
    description: "Luminous enchanted forest radiating artistic breakthrough, imaginative craft, and vision.",
    icon: Palette,
    colorName: "Violet",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/60",
    glowColor: "rgba(192, 132, 252, 0.4)",
    bgGradient: "from-purple-950/80 via-slate-950 to-black",
    chipBg: "bg-purple-500/20 border-purple-400/50 text-purple-200",
    posDesktop: { x: 74, y: 74 },
    svgPath: "M 66 65 Q 80 58, 88 70 T 84 88 Q 70 94, 62 82 Z",
  },
];

export function getMasteryTier(score: number): { title: string; tier: string; badgeColor: string } {
  if (score >= 50) return { title: "Mythic Sovereign", tier: "Tier IV", badgeColor: "text-purple-400 border-purple-500/50 bg-purple-950/50" };
  if (score >= 30) return { title: "Grand Master", tier: "Tier III", badgeColor: "text-amber-400 border-amber-500/50 bg-amber-950/50" };
  if (score >= 18) return { title: "Silver Adept", tier: "Tier II", badgeColor: "text-sky-400 border-sky-500/50 bg-sky-950/50" };
  return { title: "Iron Novice", tier: "Tier I", badgeColor: "text-slate-400 border-slate-700 bg-slate-900/60" };
}

export function RealmMap({
  attributes,
  quests = [],
  selectedZone,
  onSelectZone,
}: RealmMapProps) {
  // Active Boss & Today's Task HP Progression
  const totalDailyTasks = (quests || []).length;
  const completedDailyTasks = useMemo(() => {
    return (quests || []).filter((q) => q.is_completed_for_period).length;
  }, [quests]);

  const dailyBossHp = useMemo(() => {
    if (totalDailyTasks === 0) return 100;
    return Math.max(0, Math.min(100, Math.round(100 * (1 - completedDailyTasks / totalDailyTasks))));
  }, [totalDailyTasks, completedDailyTasks]);

  const activeBossName = useMemo(() => {
    if (selectedZone) {
      const zone = ZONES.find((z) => z.id === selectedZone);
      return zone ? `${zone.name} Guardian` : "Arcane Wolf";
    }
    return "Arcane Wolf";
  }, [selectedZone]);

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

  const selectedZoneData = ZONES.find((z) => z.id === selectedZone) || null;

  return (
    <div className="relative rounded-2xl border-2 border-amber-900/60 bg-gradient-to-b from-slate-950 via-slate-950/95 to-black p-4 sm:p-6 overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.85)]">
      {/* 1. MAP HEADER & REALM STATUS */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-900/40">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/70 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-md">
              <Compass className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-amber-100 font-cinzel flex items-center gap-2">
                <span>The Continent of Aethelgard</span>
                <span className="text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 bg-amber-950/50">
                  5 Territories
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-rajdhani">
                Real-world habit mastery manifests as territorial ascension across the realm.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {selectedZone ? (
            <button
              onClick={() => onSelectZone(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 text-xs font-rajdhani font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Show Entire Realm</span>
            </button>
          ) : (
            <span className="text-[11px] font-rajdhani text-amber-400/80 uppercase tracking-wider px-2.5 py-1 rounded bg-black/60 border border-amber-900/50 font-bold">
              ★ All Territories Visible
            </span>
          )}
        </div>
      </div>

      {/* 2. HAND-PAINTED FANTASY OVERLAND WORLD MAP CANVAS */}
      <div className="relative z-10 hidden md:block my-4 h-[460px] w-full rounded-2xl border-2 border-amber-500/40 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Real Fantasy World Map Background Image */}
        <img
          src={GAME_ASSETS.backgrounds.worldMap}
          alt="Realm of Aethelgard Map"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0 brightness-[0.88] contrast-[1.05]"
        />
        {/* Atmosphere overlay ensuring interactive pins pop cleanly */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40 pointer-events-none z-0" />

        {/* Floating Active Encounter & Boss Progress Card */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-amber-500/60 shadow-[0_4px_25px_rgba(0,0,0,0.8)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 font-bold text-sm shadow-md">
            ⚔️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black font-cinzel text-amber-200 uppercase tracking-wide">
                [ACTIVE BOSS] {activeBossName}
              </span>
              <span className={`text-[11px] font-mono font-bold ${dailyBossHp === 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {dailyBossHp} / 100 HP
              </span>
            </div>
            <div className="text-[10px] text-slate-300 font-rajdhani flex items-center gap-2 mt-0.5">
              <span>Today&apos;s Tasks: <strong className="text-amber-300">{completedDailyTasks}/{totalDailyTasks} Complete</strong></span>
              <span className="text-amber-500">•</span>
              <span className="text-emerald-400 font-bold">{100 - dailyBossHp}% Damage Dealt</span>
            </div>
          </div>
        </div>

        {/* ILLUSTRATED FANTASY MAP SVG CANVAS */}
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Gradients for Landmasses & Coastlines */}
            <linearGradient id="ocean-shading" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f2132" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#08141f" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="land-northwest" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="100%" stopColor="#0f2238" />
            </linearGradient>

            <linearGradient id="land-northeast" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a1525" />
              <stop offset="100%" stopColor="#250914" />
            </linearGradient>

            <linearGradient id="land-southwest" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3d2d14" />
              <stop offset="100%" stopColor="#1c1409" />
            </linearGradient>

            <linearGradient id="land-southeast" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2d174d" />
              <stop offset="100%" stopColor="#150a26" />
            </linearGradient>

            <linearGradient id="citadel-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            <filter id="map-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Coastal Water Ripple Shading */}
          <ellipse cx="200" cy="140" rx="140" ry="85" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="6" strokeDasharray="12 8" />
          <ellipse cx="800" cy="130" rx="135" ry="85" fill="none" stroke="rgba(244, 63, 94, 0.15)" strokeWidth="6" strokeDasharray="12 8" />
          <ellipse cx="260" cy="380" rx="145" ry="90" fill="none" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="6" strokeDasharray="12 8" />
          <ellipse cx="740" cy="370" rx="145" ry="90" fill="none" stroke="rgba(192, 132, 252, 0.15)" strokeWidth="6" strokeDasharray="12 8" />
          <ellipse cx="500" cy="240" rx="120" ry="75" fill="none" stroke="rgba(234, 179, 8, 0.2)" strokeWidth="8" />

          {/* 2. Archipelago Landmass Outlines (Ref Image 1 Continents) */}
          {/* NW: Mindpeak Archipelago */}
          <path
            d="M 100 130 Q 160 80, 240 100 T 320 170 Q 280 220, 190 200 T 90 150 Z"
            fill="url(#land-northwest)"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeOpacity="0.5"
          />
          {/* NE: Iron Grounds Volcanic Crags */}
          <path
            d="M 680 120 Q 760 70, 860 100 T 910 180 Q 840 230, 750 200 T 670 140 Z"
            fill="url(#land-northeast)"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeOpacity="0.5"
          />
          {/* North Center: Sanctum Monolith Mountain Range */}
          <path
            d="M 420 50 Q 500 20, 580 45 T 610 120 Q 520 145, 430 130 T 390 70 Z"
            fill="#062e1e"
            stroke="#10b981"
            strokeWidth="2"
            strokeOpacity="0.5"
          />
          {/* SW: Springs of Vitalis Lagoons */}
          <path
            d="M 140 370 Q 230 320, 340 340 T 370 420 Q 290 470, 180 450 T 130 390 Z"
            fill="url(#land-southwest)"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeOpacity="0.5"
          />
          {/* SE: The Arcanum Sacred Tree Forest */}
          <path
            d="M 630 360 Q 720 310, 830 330 T 880 430 Q 780 480, 680 460 T 620 380 Z"
            fill="url(#land-southeast)"
            stroke="#c084fc"
            strokeWidth="2"
            strokeOpacity="0.5"
          />

          {/* Central Main Island: Grand Citadel of Ascension */}
          <path
            d="M 400 230 Q 500 180, 600 220 T 620 290 Q 510 340, 410 310 T 380 250 Z"
            fill="#1c1917"
            stroke="#d97706"
            strokeWidth="2.5"
            strokeOpacity="0.7"
          />

          {/* 3. Mountain Ridges & Peaks on Landmasses */}
          <g stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.4" fill="none">
            {/* NE Volcanic Mountains */}
            <path d="M 750 140 L 770 100 L 790 140 M 790 140 L 815 85 L 840 140 M 840 140 L 865 105 L 890 140" />
            {/* NW High Spires */}
            <path d="M 160 140 L 180 90 L 200 140 M 210 150 L 235 80 L 260 150" />
            {/* Highland Temple Ridge */}
            <path d="M 460 85 L 485 45 L 510 85 M 510 85 L 535 40 L 560 85" />
          </g>

          {/* 4. Winding Expedition Dirt Trails (Connecting Central Citadel to All 5 Territories) */}
          <g stroke="#d97706" strokeWidth="2.5" strokeDasharray="8 6" strokeOpacity="0.6">
            {/* Trail to Mindpeak (NW) */}
            <path d="M 440 230 Q 320 210, 230 160" />
            {/* Trail to Iron Grounds (NE) */}
            <path d="M 570 230 Q 690 200, 780 150" />
            {/* Trail to Sanctum (N) */}
            <path d="M 500 200 L 500 110" />
            {/* Trail to Vitalis (SW) */}
            <path d="M 440 280 Q 340 330, 270 370" />
            {/* Trail to Arcanum (SE) */}
            <path d="M 570 280 Q 660 340, 730 380" />
          </g>

          {/* 5. Center Compass Rose & Nautical Details (Reference Image 1) */}
          <g transform="translate(500, 255)">
            <circle r="46" fill="none" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="1" />
            <circle r="32" fill="none" stroke="rgba(245, 158, 11, 0.18)" strokeWidth="1" strokeDasharray="4 4" />
            {/* 4 Compass Needles */}
            <polygon points="0,-42 5,-8 0,0 -5,-8" fill="#f59e0b" fillOpacity="0.6" />
            <polygon points="0,42 5,8 0,0 -5,8" fill="#d97706" fillOpacity="0.6" />
            <polygon points="42,0 8,5 0,0 8,-5" fill="#d97706" fillOpacity="0.6" />
            <polygon points="-42,0 -8,5 0,0 -8,-5" fill="#d97706" fillOpacity="0.6" />
            <text x="0" y="-48" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="Cinzel">N</text>
            <text x="0" y="58" textAnchor="middle" fill="#d97706" fontSize="11" fontWeight="bold" fontFamily="Cinzel">S</text>
            <text x="56" y="4" textAnchor="middle" fill="#d97706" fontSize="11" fontWeight="bold" fontFamily="Cinzel">E</text>
            <text x="-56" y="4" textAnchor="middle" fill="#d97706" fontSize="11" fontWeight="bold" fontFamily="Cinzel">W</text>
          </g>

          {/* 6. Antique Ornate Corner Brackets */}
          <path d="M 20 50 L 20 20 L 50 20" fill="none" stroke="#d97706" strokeWidth="2.5" strokeOpacity="0.6" />
          <circle cx="20" cy="20" r="4" fill="#f59e0b" fillOpacity="0.6" />

          <path d="M 980 50 L 980 20 L 950 20" fill="none" stroke="#d97706" strokeWidth="2.5" strokeOpacity="0.6" />
          <circle cx="980" cy="20" r="4" fill="#f59e0b" fillOpacity="0.6" />

          <path d="M 20 450 L 20 480 L 50 480" fill="none" stroke="#d97706" strokeWidth="2.5" strokeOpacity="0.6" />
          <circle cx="20" cy="480" r="4" fill="#f59e0b" fillOpacity="0.6" />

          <path d="M 980 450 L 980 480 L 950 480" fill="none" stroke="#d97706" strokeWidth="2.5" strokeOpacity="0.6" />
          <circle cx="980" cy="480" r="4" fill="#f59e0b" fillOpacity="0.6" />
        </svg>

        {/* CENTER CITADEL ICON (Grand Castle Nexus) */}
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none select-none">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-700 to-black border-2 border-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center justify-center animate-pulse">
            <Castle className="w-7 h-7 text-yellow-200" />
          </div>
          <span className="text-[10px] font-black font-cinzel text-amber-200 tracking-widest uppercase mt-1 bg-black/70 px-2 py-0.5 rounded border border-amber-900/60 shadow">
            Grand Citadel
          </span>
        </div>

        {/* 5 INTERACTIVE TERRITORIAL NODES (Ref Image 1 Gothic Banners & Map Pins) */}
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
              className="absolute z-30"
            >
              <button
                type="button"
                onClick={() => onSelectZone(isSelected ? null : zone.id)}
                aria-pressed={isSelected}
                aria-label={`Zone: ${zone.name}, Attribute: ${zone.id}, Score: ${score}, Active Bounties: ${bountyCount}`}
                className={cn(
                  "group relative flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer backdrop-blur-md select-none",
                  isSelected
                    ? "bg-slate-950 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.6)] scale-110 z-40"
                    : "bg-slate-950/90 hover:bg-slate-900 border-amber-900/60 hover:border-amber-500/80 hover:scale-105 shadow-xl",
                  zone.borderColor
                )}
              >
                {/* Territory Heraldic Shield Crest */}
                <div
                  className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-xl border-2 p-2 shrink-0 transition-transform group-hover:rotate-6 shadow-lg",
                    zone.chipBg
                  )}
                  style={{
                    boxShadow: isSelected ? `0 0 20px ${zone.glowColor}` : undefined,
                  }}
                >
                  <Icon className={cn("h-7 w-7", zone.textColor)} />
                  {bountyCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-1 text-[10px] font-black font-rajdhani text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-bounce">
                      {bountyCount}
                    </span>
                  )}
                </div>

                {/* Territory Details */}
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-100 font-cinzel tracking-wide truncate">
                      {zone.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-rajdhani truncate">
                    {zone.regionType}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("font-rajdhani font-black text-sm", zone.textColor)}>
                      {score} <span className="text-[9px] uppercase font-normal text-slate-400">{zone.id.slice(0, 3)}</span>
                    </span>
                    <span className={cn("text-[9px] font-cinzel uppercase px-1.5 py-0.5 rounded border font-bold", mastery.badgeColor)}>
                      {mastery.title}
                    </span>
                  </div>
                </div>

                {/* Waypoint Engaged Marker */}
                {isSelected && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 text-slate-950 text-[9px] font-black font-cinzel uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                    <MapPin className="h-3 w-3 fill-slate-950" />
                    <span>Engaged</span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. MOBILE & TABLET TERRITORY CARDS */}
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
                "flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer",
                isSelected
                  ? "bg-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : "bg-slate-950/80 border-slate-800 hover:bg-slate-900/80",
                zone.borderColor
              )}
            >
              <div className={cn("p-2 rounded-lg border", zone.chipBg)}>
                <Icon className={cn("h-5 w-5", zone.textColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-black font-cinzel text-slate-100 truncate">
                  {zone.name}
                </span>
                <div className="flex items-center gap-2 mt-0.5 text-xs">
                  <span className={cn("font-bold font-rajdhani", zone.textColor)}>
                    {score} {zone.id.slice(0, 3)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-cinzel">
                    {bountyCount} {bountyCount === 1 ? "Bounty" : "Bounties"} • {mastery.title}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. SELECTED ZONE OVERVIEW EXPEDITION PANEL */}
      <AnimatePresence>
        {selectedZoneData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className={cn(
              "relative z-20 mt-4 p-4 rounded-xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl",
              selectedZoneData.bgGradient,
              selectedZoneData.borderColor
            )}
          >
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black font-cinzel tracking-widest uppercase text-amber-400">
                  Target Territory Focus
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-rajdhani">
                  • {selectedZoneData.regionType}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black font-cinzel text-white">
                {selectedZoneData.name} ({selectedZoneData.subtitle})
              </h3>
              <p className="text-xs text-slate-300 font-rajdhani leading-relaxed">
                {selectedZoneData.description}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="block text-[10px] font-cinzel text-slate-400 uppercase">
                  Active Bounties
                </span>
                <span className="text-xl font-black font-rajdhani text-amber-300">
                  {zoneBountyCounts[selectedZoneData.id]}
                </span>
              </div>
              <button
                onClick={() => onSelectZone(null)}
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Dismiss territory focus"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
