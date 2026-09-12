"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CharacterAttribute } from "@/types/quest";
import { cn } from "@/lib/utils";

interface ArenaBackgroundProps {
  attribute?: CharacterAttribute;
  className?: string;
  stageTheme?: "TEMPLE_COURTYARD" | "ASTRAL_GATEWAY" | "VOLCANIC_CRAG" | "VERDANT_CANOPY";
}

export function ArenaBackground({
  attribute = "INTELLECT",
  className,
  stageTheme,
}: ArenaBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();

  // Distinct environment configuration inspired directly by user reference images 2 & 3
  const env = useMemo(() => {
    // If specific fighting stage theme or based on attribute
    const theme = stageTheme || (
      attribute === "STRENGTH" ? "VOLCANIC_CRAG" :
      attribute === "DISCIPLINE" ? "TEMPLE_COURTYARD" :
      attribute === "VITALITY" ? "VERDANT_CANOPY" : "ASTRAL_GATEWAY"
    );

    switch (theme) {
      case "TEMPLE_COURTYARD": // User Image 2: Street Fighter Buddha Courtyard
        return {
          id: "temple_courtyard",
          name: "Sanctuary of the Reclining Titan",
          skyGradient: "from-sky-500 via-blue-700 to-indigo-950",
          sunColor: "radial-gradient(circle at 75% 20%, rgba(254, 240, 138, 0.6), rgba(56, 189, 248, 0.2) 45%, transparent 70%)",
          bannerColor: "bg-emerald-600/90 border-emerald-400",
          platformBorder: "border-amber-400/80 shadow-[0_-12px_40px_rgba(245,158,11,0.25)]",
          platformFill: "from-stone-800 via-stone-900 to-slate-950",
          accentRune: "☸",
          themeHue: "#f59e0b",
          type: "TEMPLE",
          description: "Ancient colossal stone titan courtyard under radiant blue skies",
        };
      case "ASTRAL_GATEWAY": // User Image 3: Frame Fighter Sanctuary Portal
        return {
          id: "astral_gateway",
          name: "The Celestial Void Gateway",
          skyGradient: "from-slate-900 via-purple-950 to-black",
          sunColor: "radial-gradient(circle at 50% 35%, rgba(168, 85, 247, 0.5), rgba(56, 189, 248, 0.25) 50%, transparent 75%)",
          bannerColor: "bg-purple-600/90 border-cyan-400",
          platformBorder: "border-cyan-400/80 shadow-[0_-12px_40px_rgba(6,182,212,0.3)]",
          platformFill: "from-slate-900 via-indigo-950/60 to-black",
          accentRune: "✦",
          themeHue: "#38bdf8",
          type: "PORTAL",
          description: "Arched monolithic sanctum humming with dimensional leylines",
        };
      case "VOLCANIC_CRAG":
        return {
          id: "volcanic_crag",
          name: "Molten Titan Caldera",
          skyGradient: "from-orange-950 via-red-950 to-stone-950",
          sunColor: "radial-gradient(circle at 65% 25%, rgba(249, 115, 22, 0.6), transparent 60%)",
          bannerColor: "bg-rose-700/90 border-orange-500",
          platformBorder: "border-rose-600/80 shadow-[0_-12px_40px_rgba(244,63,94,0.3)]",
          platformFill: "from-stone-900 via-stone-950 to-black",
          accentRune: "⚔",
          themeHue: "#f43f5e",
          type: "VOLCANIC",
          description: "Obsidian battle platform suspended above roaring lava rivers",
        };
      case "VERDANT_CANOPY":
      default:
        return {
          id: "verdant_canopy",
          name: "Heartwood Ancient Canopy",
          skyGradient: "from-emerald-950 via-teal-950 to-slate-950",
          sunColor: "radial-gradient(circle at 35% 20%, rgba(52, 211, 153, 0.5), transparent 55%)",
          bannerColor: "bg-emerald-600/90 border-emerald-400",
          platformBorder: "border-emerald-500/80 shadow-[0_-12px_40px_rgba(16,185,129,0.3)]",
          platformFill: "from-stone-900 via-slate-950 to-black",
          accentRune: "🌿",
          themeHue: "#10b981",
          type: "CANOPY",
          description: "Lush ancient forest temple woven with living solar roots",
        };
    }
  }, [attribute, stageTheme]);

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
        
        {/* Domain-specific distant landmarks matching User Reference Images */}
        {env.type === "TEMPLE" && (
          // User Reference Image 2: Giant Reclining Stone Titan / Buddha & Palm Trees
          <g>
            {/* Distant Palm Trees */}
            <g stroke="#064e3b" strokeWidth="2" fill="#047857" opacity="0.85">
              <path d="M80 300 Q100 200 120 140" stroke="#78350f" strokeWidth="6" fill="none" />
              <path d="M120 140 Q80 120 60 140 M120 140 Q110 100 90 90 M120 140 Q140 100 160 90 M120 140 Q160 120 180 140 M120 140 Q140 155 160 170" stroke="#059669" strokeWidth="3" fill="none" />
              <path d="M880 300 Q860 190 840 120" stroke="#78350f" strokeWidth="7" fill="none" />
              <path d="M840 120 Q800 100 780 120 M840 120 Q830 80 810 70 M840 120 Q860 80 880 70 M840 120 Q880 100 900 120" stroke="#059669" strokeWidth="3.5" fill="none" />
            </g>

            {/* Giant Reclining Buddha / Stone Titan Statue Silhouette */}
            <g fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" opacity="0.95" filter="drop-shadow(0 10px 25px rgba(0,0,0,0.4))">
              {/* Head resting on hand */}
              <ellipse cx="220" cy="180" rx="60" ry="75" fill="#f8fafc" />
              <path d="M170 160 Q190 140 230 140 Q270 140 280 170" fill="none" stroke="#64748b" strokeWidth="3" />
              <circle cx="210" cy="175" r="4" fill="#64748b" />
              <circle cx="250" cy="175" r="4" fill="#64748b" />
              <path d="M215 210 Q230 220 245 210" stroke="#64748b" strokeWidth="3" fill="none" />
              {/* Topknot / Usnisa */}
              <ellipse cx="235" cy="115" rx="20" ry="18" fill="#e2e8f0" />
              
              {/* Massive Reclining Torso with Hieroglyphic Robe Pattern */}
              <path d="M270 200 C340 150, 480 140, 680 180 C780 200, 850 250, 920 320 L160 320 Z" fill="#f1f5f9" />
              
              {/* Carved Robe Panels (Reference Image 2 blanket/carvings) */}
              <path d="M340 190 C420 170, 560 165, 680 200 L660 280 C540 250, 420 255, 340 280 Z" fill="#fef08a" stroke="#d97706" strokeWidth="2" opacity="0.85" />
              {/* Decorative glyph lines */}
              <path d="M380 200 L380 260 M440 190 L440 255 M500 185 L500 255 M560 185 L560 260 M620 195 L620 270" stroke="#b45309" strokeWidth="1.5" strokeDasharray="4 4" />
            </g>
          </g>
        )}

        {env.type === "PORTAL" && (
          // User Reference Image 3: Astral Void Archway & Glowing Energy Gateway
          <g>
            {/* Monumental Arched Sanctuary Dome */}
            <path d="M200 400 C200 150, 320 60, 500 60 C680 60, 800 150, 800 400 Z" fill="#0f172a" stroke="#0ea5e9" strokeWidth="4" opacity="0.8" />
            <path d="M260 400 C260 200, 360 120, 500 120 C640 120, 740 200, 740 400 Z" fill="#020617" stroke="#38bdf8" strokeWidth="2" opacity="0.9" />

            {/* Glowing Leyline Portal Core */}
            <circle cx="500" cy="240" r="85" fill="url(#astral-portal-glow)" stroke="#67e8f9" strokeWidth="3" />
            <circle cx="500" cy="240" r="60" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="8 6" />
            <circle cx="500" cy="240" r="35" fill="#ffffff" opacity="0.9" filter="drop-shadow(0 0 15px rgba(56,189,248,1))" />

            {/* Radiant Energy Conduit Rays */}
            <path d="M500 155 L500 80 M500 325 L500 400 M415 240 L340 240 M585 240 L660 240" stroke="#38bdf8" strokeWidth="3" />
            
            <defs>
              <radialGradient id="astral-portal-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#38bdf8" />
                <stop offset="80%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
          </g>
        )}

        {env.type === "VOLCANIC" && (
          // Volcanic Peaks & Flaming Forge Braziers
          <g fill="#1c1917" stroke="#f43f5e" strokeWidth="2" opacity="0.85">
            <polygon points="350,400 480,120 610,400" fill="#292524" />
            <polygon points="460,140 480,110 500,140" fill="#f59e0b" filter="drop-shadow(0 0 20px #ef4444)" />
            <rect x="180" y="170" width="40" height="50" rx="4" />
            <rect x="760" y="170" width="40" height="50" rx="4" />
          </g>
        )}

        {env.type === "CANOPY" && (
          // Giant Ancient Canopy Tree
          <g fill="#064e3b" stroke="#10b981" strokeWidth="2" opacity="0.85">
            <path d="M460 400 L470 240 Q440 200 400 190 Q500 130 600 190 Q560 220 530 240 L540 400 Z" fill="#14532d" />
            <circle cx="280" cy="190" r="65" fill="#047857" opacity="0.9" />
            <circle cx="720" cy="190" r="65" fill="#047857" opacity="0.9" />
            <circle cx="500" cy="160" r="75" fill="#059669" opacity="0.95" filter="drop-shadow(0 0 15px #34d399)" />
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
