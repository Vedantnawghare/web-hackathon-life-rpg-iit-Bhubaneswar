"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CharacterAttribute } from "@/types/quest";
import { cn } from "@/lib/utils";

interface ArenaBackgroundProps {
  attribute?: CharacterAttribute;
  className?: string;
}

export function ArenaBackground({
  attribute = "INTELLECT",
  className,
}: ArenaBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();

  // Distinct environment configuration for each of the 5 domains
  const env = useMemo(() => {
    switch (attribute) {
      case "STRENGTH":
        return {
          id: "iron_grounds",
          name: "The Iron Grounds",
          skyGradient: "from-orange-950 via-slate-900 to-stone-950",
          sunColor: "radial-gradient(circle at 75% 25%, rgba(249,115,22,0.45), transparent 50%)",
          bannerColor: "bg-rose-700/80 border-rose-500",
          platformBorder: "border-rose-700/60 shadow-[0_-8px_30px_rgba(244,63,94,0.2)]",
          platformFill: "from-stone-900 via-stone-950 to-black",
          accentRune: "?",
          themeHue: "#f43f5e",
          description: "Volcanic crags & ancient warrior training arena",
        };
      case "DISCIPLINE":
        return {
          id: "sanctum",
          name: "Sanctum of Discipline",
          skyGradient: "from-emerald-950 via-slate-900 to-stone-950",
          sunColor: "radial-gradient(circle at 25% 20%, rgba(16,185,129,0.4), transparent 50%)",
          bannerColor: "bg-emerald-700/80 border-emerald-500",
          platformBorder: "border-emerald-700/60 shadow-[0_-8px_30px_rgba(16,185,129,0.2)]",
          platformFill: "from-slate-900 via-stone-950 to-black",
          accentRune: "??",
          themeHue: "#10b981",
          description: "Mist-veiled bamboo pagoda & temple waterfalls",
        };
      case "VITALITY":
        return {
          id: "vitalis",
          name: "Vitalis Sun Valley",
          skyGradient: "from-amber-950/90 via-slate-900 to-stone-950",
          sunColor: "radial-gradient(circle at 50% 20%, rgba(234,179,8,0.45), transparent 55%)",
          bannerColor: "bg-amber-600/80 border-amber-400",
          platformBorder: "border-amber-600/60 shadow-[0_-8px_30px_rgba(245,158,11,0.2)]",
          platformFill: "from-stone-900 via-stone-950 to-black",
          accentRune: "??",
          themeHue: "#f59e0b",
          description: "Ancient living heartwood canopy & sunlit river springs",
        };
      case "CREATIVITY":
        return {
          id: "arcanum",
          name: "The Prismatic Arcanum",
          skyGradient: "from-purple-950 via-slate-900 to-stone-950",
          sunColor: "radial-gradient(circle at 80% 30%, rgba(192,132,252,0.45), transparent 50%)",
          bannerColor: "bg-purple-600/80 border-purple-400",
          platformBorder: "border-purple-600/60 shadow-[0_-8px_30px_rgba(168,85,247,0.2)]",
          platformFill: "from-slate-900 via-purple-950/40 to-black",
          accentRune: "?",
          themeHue: "#c084fc",
          description: "Floating crystalline aether islands & chromatic portals",
        };
      case "INTELLECT":
      default:
        return {
          id: "mindpeak",
          name: "Mindpeak Observatory",
          skyGradient: "from-sky-950 via-slate-900 to-stone-950",
          sunColor: "radial-gradient(circle at 30% 25%, rgba(56,189,248,0.45), transparent 50%)",
          bannerColor: "bg-sky-600/80 border-sky-400",
          platformBorder: "border-sky-600/60 shadow-[0_-8px_30px_rgba(56,189,248,0.2)]",
          platformFill: "from-slate-900 via-sky-950/40 to-black",
          accentRune: "?",
          themeHue: "#38bdf8",
          description: "Celestial heights, starry nebula & floating obelisks",
        };
    }
  }, [attribute]);

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none rounded-2xl select-none",
        className
      )}
      aria-hidden="true"
    >
      {/* 1. LAYER 1: SKY & ATMOSPHERE */}
      <div className={cn("absolute inset-0 bg-gradient-to-b", env.skyGradient)} />
      <div className="absolute inset-0 opacity-60" style={{ background: env.sunColor }} />

      {/* Floating Star / Nebula Dust (Subtle Particle motion) */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            animate={{ x: [0, 40, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${env.themeHue}33, transparent 70%)` }}
          />
          <motion.div
            animate={{ x: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-1/4 w-80 h-80 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${env.themeHue}22, transparent 70%)` }}
          />
        </>
      )}

      {/* 2. LAYER 2: DISTANT BACKGROUND SILHOUETTES */}
      <svg
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-35"
      >
        {/* Distant jagged mountains */}
        <polygon points="0,400 0,220 90,160 180,240 270,140 380,260 480,180 580,250 690,130 810,230 920,150 1000,210 1000,400" fill="#090d16" />
        
        {/* Domain-specific distant landmarks */}
        {env.id === "mindpeak" && (
          // Floating Observatory Towers & Spire
          <g fill="#0f172a" stroke={env.themeHue} strokeWidth="1" opacity="0.6">
            <rect x="250" y="110" width="28" height="70" rx="3" />
            <polygon points="264,80 246,110 282,110" />
            <circle cx="264" cy="74" r="5" fill={env.themeHue} />
            <rect x="710" y="100" width="32" height="80" rx="3" />
            <polygon points="726,70 706,100 746,100" />
            <circle cx="726" cy="62" r="6" fill={env.themeHue} />
          </g>
        )}

        {env.id === "iron_grounds" && (
          // Volcanic Peaks & Flaming Forge Braziers
          <g fill="#1c1917" stroke="#f43f5e" strokeWidth="1" opacity="0.6">
            <polygon points="450,400 490,140 530,400" />
            <polygon points="485,140 490,120 495,140" fill="#f59e0b" />
            <rect x="180" y="170" width="40" height="50" rx="4" />
            <rect x="760" y="170" width="40" height="50" rx="4" />
          </g>
        )}

        {env.id === "sanctum" && (
          // Mountain Pagoda Roofs & Waterfalls
          <g fill="#064e3b" stroke="#10b981" strokeWidth="1" opacity="0.6">
            <path d="M220 180 Q250 160 280 180 L275 220 L225 220 Z" />
            <path d="M210 155 Q250 135 290 155 L285 175 L215 175 Z" />
            <path d="M720 180 Q750 160 780 180 L775 220 L725 220 Z" />
          </g>
        )}

        {env.id === "vitalis" && (
          // Giant Ancient Canopy Tree
          <g fill="#14532d" stroke="#eab308" strokeWidth="1" opacity="0.5">
            <circle cx="240" cy="180" r="55" />
            <circle cx="760" cy="180" r="55" />
            <circle cx="500" cy="190" r="45" />
          </g>
        )}

        {env.id === "arcanum" && (
          // Floating Crystal Geodes & Arcs
          <g fill="#3b0764" stroke="#c084fc" strokeWidth="1" opacity="0.6">
            <polygon points="260,110 275,140 260,170 245,140" />
            <polygon points="740,100 760,135 740,170 720,135" />
          </g>
        )}
      </svg>

      {/* 3. LAYER 3: MIDGROUND ARENA STRUCTURES & BANNERS */}
      <div className="absolute inset-x-0 bottom-16 h-40 flex justify-between items-end px-4 sm:px-12 opacity-80 pointer-events-none">
        {/* Left Arena Banner */}
        <div className="flex flex-col items-center">
          <div className="w-1.5 h-36 bg-amber-700/80 rounded-t" />
          <motion.div
            animate={shouldReduceMotion ? {} : { rotate: [-1, 2, -1], skewX: [-1, 1, -1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "w-8 sm:w-12 h-20 -mt-32 rounded-b border shadow-lg flex items-center justify-center font-bold text-xs text-white",
              env.bannerColor
            )}
          >
            <span>{env.accentRune}</span>
          </motion.div>
        </div>

        {/* Center Environment Subtitle Badge */}
        <div className="flex flex-col items-center mb-8 px-4 py-1.5 rounded-full bg-slate-950/70 border border-slate-700/50 backdrop-blur-sm shadow-md">
          <span className="text-[11px] font-bold text-slate-300 font-cinzel tracking-wider flex items-center gap-1.5">
            <span style={{ color: env.themeHue }}>{env.accentRune}</span>
            {env.name}
          </span>
          <span className="text-[9px] text-slate-400 hidden sm:inline">
            {env.description}
          </span>
        </div>

        {/* Right Arena Banner */}
        <div className="flex flex-col items-center">
          <div className="w-1.5 h-36 bg-amber-700/80 rounded-t" />
          <motion.div
            animate={shouldReduceMotion ? {} : { rotate: [1, -2, 1], skewX: [1, -1, 1] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "w-8 sm:w-12 h-20 -mt-32 rounded-b border shadow-lg flex items-center justify-center font-bold text-xs text-white",
              env.bannerColor
            )}
          >
            <span>{env.accentRune}</span>
          </motion.div>
        </div>
      </div>

      {/* 4. LAYER 4: ARENA COMBAT PLATFORM FOREGROUND */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-24 sm:h-28 bg-gradient-to-t border-t-2",
          env.platformFill,
          env.platformBorder
        )}
      >
        {/* Carved stone tile pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Combat Platform Center Rune Circle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-12 rounded-full border border-slate-700/60 bg-slate-950/60 blur-[1px] flex items-center justify-center">
          <div
            className="w-32 sm:w-48 h-6 rounded-full border opacity-50"
            style={{ borderColor: env.themeHue }}
          />
        </div>
      </div>
    </div>
  );
}
