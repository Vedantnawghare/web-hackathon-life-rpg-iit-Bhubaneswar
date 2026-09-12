"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Hero3DModel, HeroCombatState } from "@/components/rpg/Hero3DModel";

export type { HeroCombatState };

export interface HeroCharacterProps {
  heroId?: string;
  state?: HeroCombatState;
  equippedTheme?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showShadow?: boolean;
  username?: string;
}

export function HeroCharacter({
  heroId = "vanguard_male",
  state = "IDLE",
  equippedTheme = "default_slate",
  className,
  size = "md",
  showShadow = true,
  username,
}: HeroCharacterProps) {
  return (
    <div className={cn("relative flex flex-col items-center select-none", className)}>
      {/* Optional Top Username / Title Tag */}
      {username && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-7 z-30 px-3 py-0.5 rounded-full bg-slate-950/80 border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.4)] backdrop-blur-md flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-rajdhani font-black text-amber-200 tracking-wider">
            {username}
          </span>
        </motion.div>
      )}

      {/* 3D Real-Time Digital Twin Hero Model */}
      <Hero3DModel
        heroId={heroId}
        state={state}
        equippedTheme={equippedTheme}
        size={size}
        showShadow={showShadow}
      />
    </div>
  );
}
