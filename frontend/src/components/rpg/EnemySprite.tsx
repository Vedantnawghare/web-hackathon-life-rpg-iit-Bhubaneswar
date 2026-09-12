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
        glowColor: "rgba(192, 132, 252, 0.75)",
        imageSrc: GAME_ASSETS.enemies.voidArchon,
        bgRune: "✦",
      };
    case "STRENGTH":
      return {
        name: difficulty === "EPIC" ? "Ignis Behemoth" : difficulty === "HARD" ? "Magma Colossus" : "Volcanic Brute",
        title: "Armored Molten Titan",
        primaryColor: "#f87171",
        glowColor: "rgba(248, 113, 113, 0.8)",
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
        glowColor: "rgba(52, 211, 153, 0.75)",
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

  // 3D Digital Boss Animations
  const enemyVariants: Variants = {
    IDLE: shouldReduceMotion
      ? { scale: 1, x: 0, opacity: 1 }
      : {
          y: hp <= 25 ? [0, -4, 0, -2, 0] : hp <= 50 ? [0, -8, 0] : [0, -12, 0],
          scale: hp <= 25 ? [1, 1.04, 1] : [1, 1.02, 1],
          rotateZ: hp <= 25 ? [-1, 1, -1] : [-0.5, 0.5, -0.5],
          transition: {
            duration: hp <= 25 ? 1.4 : hp <= 50 ? 2.0 : 3.0,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
    APPROACH: shouldReduceMotion
      ? { x: -50 }
      : {
          x: [0, -90, -60],
          y: [0, -10, 0],
          scale: [1, 1.1, 1.06],
          transition: { duration: 0.7, ease: "easeOut" },
        },
    ATTACK: shouldReduceMotion
      ? { x: -160, scale: 1.2 }
      : {
          x: [0, 40, -260, -200, 0],
          y: [0, -16, -10, 0, 0],
          scale: [1, 1.08, 1.32, 1.18, 1],
          rotateZ: [0, -4, 8, 2, 0],
          transition: {
            duration: 1.4,
            times: [0, 0.25, 0.55, 0.75, 1],
            ease: "easeOut",
          },
        },
    HIT: shouldReduceMotion
      ? { opacity: 0.5 }
      : {
          x: [0, 55, -20, 30, 0],
          y: [0, -14, 8, -4, 0],
          scale: [1, 0.86, 1.08, 0.96, 1],
          rotateZ: [0, 6, -3, 2, 0],
          transition: {
            duration: 0.8,
            ease: "easeInOut",
          },
        },
    DEFEATED: shouldReduceMotion
      ? { opacity: 0 }
      : {
          scale: [1, 1.35, 0],
          opacity: [1, 0.9, 0],
          rotateZ: [0, 20, -45],
          y: [0, -40, 100],
          filter: [
            `drop-shadow(0 0 25px ${archetype.glowColor})`,
            "drop-shadow(0 0 60px rgba(255,255,255,1))",
            "drop-shadow(0 0 0px transparent)",
          ],
          transition: {
            duration: 1.8,
            ease: "easeIn",
          },
        },
  };

  return (
    <div className={cn("relative flex flex-col items-center select-none", className)}>
      {/* 1. Dynamic 3D Ground Shadow (Scales with Boss Breathing & Height) */}
      <motion.div
        animate={{
          scaleX: hp <= 25 ? [1, 1.05, 1] : [1, 1.12, 1],
          opacity: hp <= 25 ? [0.6, 0.75, 0.6] : [0.75, 0.9, 0.75],
        }}
        transition={{
          duration: hp <= 25 ? 1.4 : 3.0,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-6 w-52 sm:w-64 h-12 rounded-full pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 50%, transparent 75%)`,
        }}
      />

      {/* 2. Concentric Magic Rune Stage Ring */}
      <div
        className="absolute -bottom-5 w-48 sm:w-60 h-10 rounded-full border border-slate-600/40 opacity-70 pointer-events-none z-0 animate-pulse"
        style={{
          background: `radial-gradient(ellipse at center, ${archetype.glowColor}, transparent 70%)`,
        }}
      />

      {/* 3. Critical Danger Aura (<25% HP): Pulsing Blood Warning Flare */}
      {hp <= 25 && hp > 0 && (
        <div className="absolute -inset-6 rounded-full border-2 border-rose-500/80 bg-rose-950/20 blur-xl animate-pulse pointer-events-none z-0" />
      )}

      {/* 4. Battle Damage Wisps (<50% HP): Dissolving Plasma Tendrils */}
      {hp <= 50 && hp > 0 && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          <div className="absolute bottom-10 left-6 w-4 h-4 rounded-full bg-rose-500/60 blur-sm animate-ping" />
          <div className="absolute bottom-16 right-8 w-5 h-5 rounded-full bg-amber-400/50 blur-sm animate-pulse" />
          <div className="absolute top-20 left-10 w-3 h-3 rounded-full bg-purple-400/60 blur-xs animate-bounce" />
        </div>
      )}

      {/* 5. 3D DIGITAL BOSS CHARACTER SPRITE (NO RECTANGULAR BOX, TRANSPARENT EDGES + 3D DEPTH) */}
      <motion.div
        variants={enemyVariants}
        animate={state}
        style={{
          perspective: 800,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 w-56 h-60 sm:w-68 sm:h-76 lg:w-80 lg:h-88 flex items-center justify-center"
      >
        {/* Core Volumetric Glow Behind Boss Torso */}
        <div
          className="absolute w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40 animate-pulse"
          style={{ backgroundColor: archetype.primaryColor }}
        />

        {/* The Transparent Cutout Boss Artwork with Volumetric Rim Lighting */}
        <img
          src={archetype.imageSrc}
          alt={archetype.name}
          style={{
            transform: "rotateY(-6deg) rotateX(2deg)",
            filter: `drop-shadow(0 0 18px ${archetype.glowColor}) drop-shadow(0 14px 28px rgba(0,0,0,0.85))`,
          }}
          className={cn(
            "w-full h-full object-contain pointer-events-none select-none transition-all duration-300",
            state === "HIT" && "brightness-175 contrast-150",
            hp <= 25 && "contrast-125 saturate-125"
          )}
        />
      </motion.div>
    </div>
  );
}