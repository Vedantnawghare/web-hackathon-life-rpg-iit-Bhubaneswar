"use client";

import { motion, Variants, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type HeroBattleState = "IDLE" | "APPROACH" | "ATTACK" | "HIT" | "VICTORY";

interface HeroSpriteProps {
  state: HeroBattleState;
  username?: string;
  className?: string;
  equippedTheme?: string;
  heroClass?: string;
}

export function HeroSprite({
  state = "IDLE",
  username = "Hero",
  className,
  heroClass = "vanguard_male",
}: HeroSpriteProps) {
  const shouldReduceMotion = useReducedMotion();

  const isRogue = heroClass.includes("rogue") || heroClass.includes("kaelen") || heroClass.includes("dual");
  const isMage = heroClass.includes("mage") || heroClass.includes("lyra") || heroClass.includes("weaver");
  const isRanger = heroClass.includes("ranger") || heroClass.includes("aria") || heroClass.includes("huntress") || heroClass.includes("bow");
  // Default is Vanguard (Valen)
  const isVanguard = !isRogue && !isMage && !isRanger;

  // Animation variants based on champion battle state
  const containerVariants: Variants = {
    IDLE: shouldReduceMotion
      ? { scale: 1, x: 0, y: 0 }
      : {
          y: isMage ? [-4, -14, -4] : [0, -6, 0],
          transition: {
            duration: isMage ? 2.8 : 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
    APPROACH: {
      x: isVanguard ? 60 : isRogue ? 80 : 30,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
    ATTACK: shouldReduceMotion
      ? { x: 40 }
      : isVanguard
      ? {
          // Valen Vanguard: Heavy power-dash forward with crushing cleave
          x: [0, -10, 110, 75, 0],
          y: [0, -4, -14, -2, 0],
          transition: {
            duration: 0.9,
            times: [0, 0.2, 0.55, 0.8, 1],
            ease: "easeOut",
          },
        }
      : isRogue
      ? {
          // Kaelen Rogue: Rapid phantom blink and dual-dagger cross flurry
          x: [0, -20, 130, 95, 0],
          scale: [1, 0.95, 1.15, 1.05, 1],
          transition: {
            duration: 0.75,
            times: [0, 0.15, 0.5, 0.75, 1],
            ease: "easeInOut",
          },
        }
      : isMage
      ? {
          // Lyra Mage: Ascends into air, staff radiates celestial power
          y: [-4, -28, -24, -4],
          scale: [1, 1.12, 1.15, 1],
          transition: {
            duration: 0.95,
            times: [0, 0.35, 0.7, 1],
            ease: "easeOut",
          },
        }
      : {
          // Aria Ranger: Recoils back into archer stance, draws string to maximum tension
          x: [0, -25, -20, 0],
          y: [0, 4, 2, 0],
          transition: {
            duration: 0.8,
            times: [0, 0.3, 0.6, 1],
            ease: "easeOut",
          },
        },
    HIT: shouldReduceMotion
      ? { opacity: 0.7 }
      : {
          x: [0, -25, -15, 0],
          rotate: [0, -6, -2, 0],
          transition: {
            duration: 0.45,
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

  // Champion Color Palettes
  const getChampionColors = () => {
    if (isRogue) {
      return {
        primary: "#06b6d4",
        secondary: "#3b82f6",
        cape1: "#083344",
        cape2: "#0e7490",
        glow: "rgba(6, 182, 212, 0.55)",
      };
    }
    if (isMage) {
      return {
        primary: "#a855f7",
        secondary: "#818cf8",
        cape1: "#3b0764",
        cape2: "#7e22ce",
        glow: "rgba(168, 85, 247, 0.6)",
      };
    }
    if (isRanger) {
      return {
        primary: "#10b981",
        secondary: "#eab308",
        cape1: "#064e3b",
        cape2: "#047857",
        glow: "rgba(16, 185, 129, 0.55)",
      };
    }
    return {
      primary: "#f59e0b",
      secondary: "#f43f5e",
      cape1: "#881337",
      cape2: "#e11d48",
      glow: "rgba(245, 158, 11, 0.55)",
    };
  };

  const colors = getChampionColors();

  return (
    <div className={cn("relative flex flex-col items-center select-none", className)}>
      {/* Ground Pedestal Shadow & Elemental Energy Ring */}
      <div className="absolute -bottom-3 w-32 h-8 bg-black/60 rounded-full blur-sm pointer-events-none" />
      <div
        className="absolute -bottom-2 w-28 h-6 rounded-full border border-amber-500/30 opacity-70 pointer-events-none animate-pulse"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.glow}, transparent 70%)`,
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
            <linearGradient id="hero-cape-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.cape1} />
              <stop offset="100%" stopColor={colors.cape2} />
            </linearGradient>
            <linearGradient id="hero-armor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="hero-weapon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor={colors.secondary} />
              <stop offset="100%" stopColor={colors.primary} />
            </linearGradient>
            <filter id="hero-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Flowing Cloak / Cape */}
          <path
            d="M 55 70 Q 25 105, 30 160 Q 55 175, 75 160 Q 65 110, 68 72 Z"
            fill="url(#hero-cape-grad)"
            opacity="0.95"
          />

          {/* 2. Legs & Armored Greaves */}
          <rect x="58" y="125" width="14" height="38" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <rect x="78" y="125" width="14" height="38" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <path d="M 54 158 L 72 158 L 74 165 L 52 165 Z" fill="#0f172a" stroke={colors.primary} strokeWidth="1" />
          <path d="M 76 158 L 94 158 L 96 165 L 74 165 Z" fill="#0f172a" stroke={colors.primary} strokeWidth="1" />

          {/* 3. Armored Torso / Breastplate */}
          <path
            d="M 54 70 L 96 70 L 90 125 L 60 125 Z"
            fill="url(#hero-armor-grad)"
            stroke="#475569"
            strokeWidth="1.5"
          />
          {/* Champion Crest Runes on Chest */}
          <circle cx="75" cy="92" r="7" fill="none" stroke={colors.primary} strokeWidth="1.5" />
          <circle cx="75" cy="92" r="3" fill={colors.secondary} />

          {/* 4. Shoulder Pauldrons */}
          <path d="M 46 68 Q 40 82, 54 88 Q 56 74, 52 68 Z" fill="#334155" stroke={colors.primary} strokeWidth="1.5" />
          <path d="M 104 68 Q 110 82, 96 88 Q 94 74, 98 68 Z" fill="#334155" stroke={colors.primary} strokeWidth="1.5" />

          {/* 5. Head / Helmet / Cowl */}
          {isRogue ? (
            <g>
              <path d="M 60 38 Q 75 22, 90 38 Q 95 62, 75 66 Q 55 62, 60 38 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
              <ellipse cx="68" cy="48" rx="4" ry="2" fill="#06b6d4" filter="url(#hero-glow-filter)" />
              <ellipse cx="82" cy="48" rx="4" ry="2" fill="#06b6d4" filter="url(#hero-glow-filter)" />
            </g>
          ) : isMage ? (
            <g>
              <path d="M 58 35 Q 75 18, 92 35 Q 98 60, 75 64 Q 52 60, 58 35 Z" fill="#2e1065" stroke="#a855f7" strokeWidth="1.5" />
              <circle cx="75" cy="34" r="4" fill="#c084fc" filter="url(#hero-glow-filter)" />
              <ellipse cx="68" cy="46" rx="3" ry="2" fill="#e9d5ff" />
              <ellipse cx="82" cy="46" rx="3" ry="2" fill="#e9d5ff" />
            </g>
          ) : isRanger ? (
            <g>
              <path d="M 58 36 Q 75 22, 92 36 Q 96 60, 75 64 Q 54 60, 58 36 Z" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
              <path d="M 75 28 L 78 35 L 72 35 Z" fill="#eab308" />
              <ellipse cx="68" cy="46" rx="3" ry="2" fill="#34d399" />
              <ellipse cx="82" cy="46" rx="3" ry="2" fill="#34d399" />
            </g>
          ) : (
            <g>
              <circle cx="75" cy="48" r="18" fill="url(#hero-armor-grad)" stroke="#64748b" strokeWidth="1.5" />
              <path d="M 62 48 L 88 48" stroke={colors.primary} strokeWidth="2" filter="url(#hero-glow-filter)" />
              <path d="M 75 30 L 75 56" stroke={colors.primary} strokeWidth="1.5" />
              <path d="M 65 30 Q 75 20, 85 30 L 75 15 Z" fill={colors.secondary} />
            </g>
          )}

          {/* 6. CHAMPION WEAPONS */}
          {isVanguard && (
            <motion.g
              animate={
                state === "ATTACK"
                  ? { rotate: [-10, -45, 75, 25, 0], x: [0, -5, 25, 10, 0] }
                  : { rotate: [0, 4, 0] }
              }
              transition={{ duration: state === "ATTACK" ? 0.9 : 2.4, repeat: state === "ATTACK" ? 0 : Infinity }}
              style={{ originX: "96px", originY: "96px" }}
            >
              <path d="M 96 96 L 140 32 L 146 36 L 100 100 Z" fill="url(#hero-weapon-grad)" filter="url(#hero-glow-filter)" />
              <rect x="90" y="94" width="16" height="5" rx="2" fill="#f59e0b" />
              <circle cx="98" cy="106" r="3" fill="#f59e0b" />
            </motion.g>
          )}

          {isRogue && (
            <g>
              <motion.g
                animate={
                  state === "ATTACK"
                    ? { rotate: [-20, 60, -10], x: [0, 18, 0] }
                    : { rotate: [0, -5, 0] }
                }
                transition={{ duration: state === "ATTACK" ? 0.75 : 2.0, repeat: state === "ATTACK" ? 0 : Infinity }}
                style={{ originX: "96px", originY: "96px" }}
              >
                <path d="M 94 92 L 130 55 L 126 50 L 90 88 Z" fill="url(#hero-weapon-grad)" filter="url(#hero-glow-filter)" />
              </motion.g>
              <motion.g
                animate={
                  state === "ATTACK"
                    ? { rotate: [20, -50, 10], x: [0, 15, 0] }
                    : { rotate: [0, 5, 0] }
                }
                transition={{ duration: state === "ATTACK" ? 0.75 : 2.0, repeat: state === "ATTACK" ? 0 : Infinity }}
                style={{ originX: "54px", originY: "96px" }}
              >
                <path d="M 54 92 L 20 60 L 24 55 L 58 88 Z" fill="url(#hero-weapon-grad)" filter="url(#hero-glow-filter)" />
              </motion.g>
            </g>
          )}

          {isMage && (
            <motion.g
              animate={
                state === "ATTACK"
                  ? { rotate: [-10, 20, -5], y: [-2, -12, 0] }
                  : { rotate: [0, 3, 0] }
              }
              transition={{ duration: state === "ATTACK" ? 0.95 : 2.8, repeat: state === "ATTACK" ? 0 : Infinity }}
              style={{ originX: "105px", originY: "120px" }}
            >
              <line x1="105" y1="145" x2="115" y2="25" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="116" cy="20" r="12" fill="none" stroke="#c084fc" strokeWidth="2" />
              <circle cx="116" cy="20" r="6" fill="#f3e8ff" filter="url(#hero-glow-filter)" />
            </motion.g>
          )}

          {isRanger && (
            <motion.g
              animate={
                state === "ATTACK"
                  ? { scaleX: [1, 1.25, 0.9, 1], x: [0, 6, 0] }
                  : { scaleX: [1, 1.04, 1] }
              }
              transition={{ duration: state === "ATTACK" ? 0.8 : 2.2, repeat: state === "ATTACK" ? 0 : Infinity }}
              style={{ originX: "100px", originY: "90px" }}
            >
              <path d="M 100 45 Q 125 90, 100 135" fill="none" stroke="#854d0e" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="100" y1="45" x2="92" y2="90" stroke="#fef08a" strokeWidth="1" />
              <line x1="92" y1="90" x2="100" y2="135" stroke="#fef08a" strokeWidth="1" />
              <line x1="88" y1="90" x2="125" y2="90" stroke="#34d399" strokeWidth="2.5" filter="url(#hero-glow-filter)" />
            </motion.g>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
