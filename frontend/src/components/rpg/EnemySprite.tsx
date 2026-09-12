"use client";

import { motion } from "framer-motion";
import { CharacterAttribute, QuestDifficulty } from "@/types/quest";
import { GAME_ASSETS } from "@/lib/game-assets";
import { cn } from "@/lib/utils";
import { Boss3DModel } from "@/components/rpg/Boss3DModel";

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
  const archetype = getEnemyArchetypeInfo(attribute, difficulty);

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
        className="absolute -bottom-6 w-56 sm:w-72 h-14 rounded-full pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at center, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 50%, transparent 75%)`,
        }}
      />

      {/* 2. Concentric Magic Rune Stage Ring */}
      <div
        className="absolute -bottom-5 w-52 sm:w-68 h-10 rounded-full border border-slate-600/40 opacity-70 pointer-events-none z-0 animate-pulse"
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

      {/* 5. REAL-TIME 3D DIGITAL TWIN BOSS MODEL (Three.js WebGL Model) */}
      <div className="relative z-10 flex items-center justify-center">
        <Boss3DModel
          state={state}
          attribute={attribute}
          difficulty={difficulty}
          hp={hp}
        />
      </div>
    </div>
  );
}
