"use client";
/* eslint-disable @next/next/no-img-element */

import { motion, Variants, useReducedMotion } from "framer-motion";
import { CharacterAttribute, QuestDifficulty } from "@/types/quest";
import { GAME_ASSETS } from "@/lib/game-assets";
import { cn } from "@/lib/utils";

export type EnemyBattleState = "IDLE" | "APPROACH" | "ATTACK" | "HIT" | "DEFEATED";

interface EnemySpriteProps {
  state: EnemyBattleState;
  attribute: CharacterAttribute;
  difficulty: QuestDifficulty;
  name?: string;
  className?: string;
  hp?: number; // 0 to 100: drives progressive visual battle fatigue
}

export function getEnemyArchetypeInfo(attribute: CharacterAttribute, difficulty: QuestDifficulty): {
  name: string;
  title: string;
  primaryColor: string;
  glowColor: string;
  imageSrc: string;
  bgRune: string;
} {
  switch (attribute) {
    case "INTELLECT":
      return {
        name: difficulty === "EPIC" ? "Dread Archon" : difficulty === "HARD" ? "Void Archon" : "Astral Phantom",
        title: "Master of Dark Singularity",
        primaryColor: "#c084fc",
        glowColor: "rgba(192, 132, 252, 0.6)",
        imageSrc: GAME_ASSETS.enemies.voidArchon,
        bgRune: "✦",
      };
    case "STRENGTH":
      return {
        name: difficulty === "EPIC" ? "Ignis Behemoth" : difficulty === "HARD" ? "Magma Colossus" : "Volcanic Brute",
        title: "Armored Molten Titan",
        primaryColor: "#f87171",
        glowColor: "rgba(248, 113, 113, 0.65)",
        imageSrc: GAME_ASSETS.enemies.voidBrute,
        bgRune: "⚔",
      };
    case "DISCIPLINE":
    case "VITALITY":
    case "CREATIVITY":
    default:
      return {
        name: difficulty === "EPIC" ? "Abyssal Chimera" : difficulty === "HARD" ? "Chitinous Dread" : "Scythe Stalker",
        title: "Apex Bioluminescent Predator",
        primaryColor: "#34d399",
        glowColor: "rgba(52, 211, 153, 0.6)",
        imageSrc: GAME_ASSETS.enemies.crystalHorror,
        bgRune: "👁",
      };
  }
}

export function EnemySprite({
  state = "IDLE",
  attribute,
  difficulty,
  className,
  hp = 100,
}: EnemySpriteProps) {
  const shouldReduceMotion = useReducedMotion();
  const archetype = getEnemyArchetypeInfo(attribute, difficulty);

  // Animations based on battle state (Long reach & deliberate cinematic pacing)
  const enemyVariants: Variants = {
    IDLE: shouldReduceMotion
      ? { scale: 1, x: 0, opacity: 1 }
      : {
          y: hp <= 25 ? [0, -5, 0, -3, 0] : hp <= 50 ? [0, -7, 0] : [0, -10, 0],
          scale: hp <= 25 ? [1, 1.03, 1] : [1, 1.02, 1],
          transition: {
            duration: hp <= 25 ? 1.6 : hp <= 50 ? 2.2 : 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
    APPROACH: shouldReduceMotion
      ? { x: -50 }
      : {
          x: [0, -80, -60],
          y: [0, -8, 0],
          scale: [1, 1.08, 1.05],
          transition: { duration: 0.7, ease: "easeOut" },
        },
    ATTACK: shouldReduceMotion
      ? { x: -140, scale: 1.15 }
      : {
          // Deep reach forward across the arena to physically strike the hero
          x: [0, 35, -240, -180, 0],
          y: [0, -14, -8, 0, 0],
          scale: [1, 1.08, 1.28, 1.15, 1],
          transition: {
            duration: 1.4,
            times: [0, 0.25, 0.55, 0.75, 1],
            ease: "easeOut",
          },
        },
    HIT: shouldReduceMotion
      ? { opacity: 0.5 }
      : {
          x: [0, 45, -15, 25, 0],
          y: [0, -12, 6, -3, 0],
          scale: [1, 0.88, 1.06, 0.96, 1],
          transition: {
            duration: 0.8,
            ease: "easeInOut",
          },
        },
    DEFEATED: shouldReduceMotion
      ? { opacity: 0 }
      : {
          scale: [1, 1.3, 0],
          opacity: [1, 0.9, 0],
          rotate: [0, 15, -30],
          y: [0, -30, 80],
          transition: {
            duration: 1.6,
            ease: "easeIn",
          },
        },
  };

  return (
    <div className={cn("relative flex flex-col items-center select-none", className)}>
      {/* Ground Pedestal Shadow & Threat Aura */}
      <div className="absolute -bottom-4 w-44 sm:w-56 h-10 bg-black/80 rounded-full blur-md pointer-events-none" />
      <div
        className="absolute -bottom-3 w-40 sm:w-52 h-8 rounded-full border border-slate-700/50 opacity-80 pointer-events-none animate-pulse"
        style={{
          background: `radial-gradient(ellipse at center, ${archetype.glowColor}, transparent 70%)`,
        }}
      />

      {/* Critical Danger Aura (<25% HP): Pulsing Blood Rune Warning Ring */}
      {hp <= 25 && hp > 0 && (
        <div className="absolute -inset-4 rounded-full border-2 border-rose-600/80 bg-rose-950/30 blur-md animate-pulse pointer-events-none z-0" />
      )}

      {/* Moderate to Severe Fatigue Smoke Wisps (<50% HP) */}
      {hp <= 50 && hp > 0 && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          <div className="absolute bottom-8 left-8 w-4 h-4 rounded-full bg-rose-500/50 blur-sm animate-ping" />
          <div className="absolute bottom-14 right-10 w-5 h-5 rounded-full bg-slate-400/40 blur-sm animate-pulse" />
          <div className="absolute top-16 left-12 w-3 h-3 rounded-full bg-amber-400/60 blur-xs animate-bounce" />
        </div>
      )}

      {/* Large Imposing Animated Creature Artwork */}
      <motion.div
        variants={enemyVariants}
        animate={state}
        className="relative z-10 w-52 h-56 sm:w-64 sm:h-72 lg:w-72 lg:h-80 flex items-center justify-center"
      >
        <img
          src={archetype.imageSrc}
          alt={archetype.name}
          className={cn(
            "w-full h-full object-contain filter drop-shadow-[0_12px_32px_rgba(0,0,0,0.85)] transition-all",
            state === "HIT" && "brightness-150 contrast-125",
            hp <= 25 && "brightness-90 saturate-150"
          )}
        />
      </motion.div>
    </div>
  );
}
