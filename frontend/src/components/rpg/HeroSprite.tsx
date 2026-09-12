"use client";

import { motion, Variants, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type HeroBattleState = "IDLE" | "ATTACK" | "HIT" | "VICTORY";

interface HeroSpriteProps {
  state: HeroBattleState;
  username?: string;
  className?: string;
  equippedTheme?: string;
}

export function HeroSprite({
  state = "IDLE",
  username = "Hero",
  className,
  equippedTheme = "default_slate",
}: HeroSpriteProps) {
  const shouldReduceMotion = useReducedMotion();

  // Animation variants based on battle state
  const containerVariants: Variants = {
    IDLE: shouldReduceMotion
      ? { scale: 1, x: 0, y: 0 }
      : {
          y: [0, -6, 0],
          transition: {
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
    ATTACK: shouldReduceMotion
      ? { x: 40 }
      : {
          x: [0, -15, 75, 50, 0],
          y: [0, -4, -12, -2, 0],
          transition: {
            duration: 1.0,
            times: [0, 0.25, 0.55, 0.8, 1],
            ease: "easeOut",
          },
        },
    HIT: shouldReduceMotion
      ? { opacity: 0.7 }
      : {
          x: [0, -25, -15, 0],
          rotate: [0, -6, -2, 0],
          transition: {
            duration: 0.5,
            ease: "easeOut",
          },
        },
    VICTORY: shouldReduceMotion
      ? { scale: 1.05 }
      : {
          y: [0, -16, 0, -8, 0],
          scale: [1, 1.08, 1, 1.04, 1],
          transition: {
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
  };

  const bladeVariants: Variants = {
    IDLE: {
      rotate: [0, 3, 0],
      transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
    },
    ATTACK: {
      rotate: [0, -45, 65, 30, 0],
      scale: [1, 1.2, 1.35, 1.1, 1],
      transition: { duration: 1.0, times: [0, 0.2, 0.55, 0.8, 1] },
    },
    HIT: {
      rotate: [0, -15, 0],
      transition: { duration: 0.4 },
    },
    VICTORY: {
      rotate: [-35, -45, -35],
      y: [-6, -12, -6],
      transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const getThemeAccent = () => {
    switch (equippedTheme) {
      case "theme_sunfire_gold":
        return { primary: "#f59e0b", secondary: "#fbbf24", glow: "rgba(245,158,11,0.5)" };
      case "theme_emerald_forest":
        return { primary: "#10b981", secondary: "#34d399", glow: "rgba(16,185,129,0.5)" };
      case "theme_arcane_violet":
        return { primary: "#a855f7", secondary: "#c084fc", glow: "rgba(168,85,247,0.5)" };
      default:
        return { primary: "#38bdf8", secondary: "#7dd3fc", glow: "rgba(56,189,248,0.5)" };
    }
  };

  const themeColors = getThemeAccent();

  return (
    <div className={cn("relative flex flex-col items-center select-none", className)}>
      {/* Ground Pedestal Shadow & Elemental Energy Ring */}
      <div className="absolute -bottom-3 w-32 h-8 bg-black/60 rounded-full blur-sm pointer-events-none" />
      <div
        className="absolute -bottom-2 w-28 h-6 rounded-full border border-amber-500/30 opacity-70 pointer-events-none animate-pulse"
        style={{
          background: `radial-gradient(ellipse at center, ${themeColors.glow}, transparent 70%)`,
        }}
      />

      {/* Hero Animated Sprite Rig */}
      <motion.div
        variants={containerVariants}
        animate={state}
        className="relative z-10 w-36 h-48 sm:w-44 sm:h-56 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 160 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
          aria-label={`Hero character ${username} in state ${state}`}
        >
          <defs>
            <linearGradient id="hero-cape" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="hero-armor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="hero-blade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor={themeColors.secondary} />
              <stop offset="100%" stopColor={themeColors.primary} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Flowing Cloak / Cape (Back Layer) */}
          <path
            d="M 54 88 Q 30 140 40 178 Q 80 186 114 176 Q 124 140 106 88 Z"
            fill="url(#hero-cape)"
            stroke="#451a03"
            strokeWidth="2"
          />

          {/* 2. Legs & Boots */}
          <rect x="58" y="142" width="16" height="34" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
          <rect x="86" y="142" width="16" height="34" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
          {/* Iron Greave Caps */}
          <path d="M 56 166 L 76 166 L 74 176 L 54 176 Z" fill="#475569" stroke="#0f172a" strokeWidth="1.5" />
          <path d="M 84 166 L 104 166 L 106 176 L 86 176 Z" fill="#475569" stroke="#0f172a" strokeWidth="1.5" />

          {/* 3. Armored Torso / Breastplate */}
          <path
            d="M 52 82 Q 80 76 108 82 L 104 146 Q 80 152 56 146 Z"
            fill="url(#hero-armor)"
            stroke="#475569"
            strokeWidth="2.5"
          />
          {/* Golden Guild Crest on Chest */}
          <circle cx="80" cy="108" r="8" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.5" filter="url(#glow)" />
          <polygon points="80,103 84,111 76,111" fill="#78350f" />

          {/* 4. Left Arm & Shield / Bracer */}
          <rect x="36" y="88" width="16" height="42" rx="8" fill="#334155" stroke="#1e293b" strokeWidth="2" />
          <circle cx="44" cy="116" r="14" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
          <polygon points="44,108 50,116 44,124 38,116" fill={themeColors.primary} />

          {/* 5. Hero Head & Winged Helmet */}
          <circle cx="80" cy="56" r="22" fill="#fed7aa" stroke="#7c2d12" strokeWidth="1.5" />
          {/* Knight Helm Visor & Wings */}
          <path
            d="M 58 52 Q 80 34 102 52 L 98 68 Q 80 62 62 68 Z"
            fill="#334155"
            stroke="#475569"
            strokeWidth="2"
          />
          {/* Eyes (Visor Slit with Cyan/Gold Glow) */}
          <rect x="68" y="56" width="24" height="4" rx="2" fill={themeColors.primary} filter="url(#glow)" />
          {/* Golden Winged Crest */}
          <path d="M 56 46 L 46 28 L 62 38 Z" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          <path d="M 104 46 L 114 28 L 98 38 Z" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          <circle cx="80" cy="38" r="4" fill="#f59e0b" />

          {/* 6. Right Arm & Glowing Weapon Rig (Animated) */}
          <motion.g variants={bladeVariants} animate={state} style={{ originX: "108px", originY: "90px" }}>
            {/* Right Arm */}
            <rect x="104" y="84" width="16" height="34" rx="7" fill="#334155" stroke="#1e293b" strokeWidth="2" />
            <circle cx="112" cy="118" r="7" fill="#f59e0b" />

            {/* Glowing Broadsword */}
            <g transform="translate(108, 54)">
              {/* Pommel & Crossguard */}
              <rect x="0" y="60" width="8" height="12" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1" />
              <rect x="-12" y="54" width="32" height="7" rx="2" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
              {/* Rune Blade */}
              <path
                d="M -4 54 L 0 -12 L 4 -20 L 8 -12 L 12 54 Z"
                fill="url(#hero-blade)"
                stroke="#ffffff"
                strokeWidth="1.5"
                filter="url(#glow)"
              />
              {/* Center Rune Inlay */}
              <line x1="4" y1="50" x2="4" y2="4" stroke={themeColors.primary} strokeWidth="2" />
            </g>
          </motion.g>

          {/* Attack Slashing Particle Arc when in ATTACK state */}
          {state === "ATTACK" && (
            <motion.path
              initial={{ pathLength: 0, opacity: 1 }}
              animate={{ pathLength: 1, opacity: [1, 0.8, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
              d="M 110 30 Q 155 70 145 135"
              stroke="#fbbf24"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow)"
            />
          )}
        </svg>
      </motion.div>

      {/* Champion Tag */}
      <div className="relative z-20 -mt-2 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 shadow">
        {username}
      </div>
    </div>
  );
}
