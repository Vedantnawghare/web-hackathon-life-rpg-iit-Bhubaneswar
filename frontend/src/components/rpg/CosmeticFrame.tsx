"use client";

import { Shield, Sparkles, Flame, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CosmeticFrameProps {
  frameKey?: string;
  badgeKey?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  username?: string;
}

const frameStyles: Record<
  string,
  { border: string; ring: string; shadow: string; accent: string; bgGradient: string }
> = {
  default_frame: {
    border: "border-slate-600",
    ring: "ring-slate-800",
    shadow: "shadow-md",
    accent: "text-slate-400",
    bgGradient: "from-slate-800 via-slate-900 to-slate-950",
  },
  frame_bronze_laurel: {
    border: "border-amber-500",
    ring: "ring-amber-700/60",
    shadow: "shadow-[0_0_20px_rgba(245,158,11,0.5)]",
    accent: "text-amber-400",
    bgGradient: "from-amber-700/40 via-amber-950 to-slate-950",
  },
  frame_obsidian_spikes: {
    border: "border-purple-500",
    ring: "ring-purple-800/60",
    shadow: "shadow-[0_0_25px_rgba(168,85,247,0.5)]",
    accent: "text-purple-400",
    bgGradient: "from-purple-800/40 via-purple-950 to-slate-950",
  },
  frame_celestial_gold: {
    border: "border-yellow-300",
    ring: "ring-amber-400/70",
    shadow: "shadow-[0_0_30px_rgba(251,191,36,0.7)]",
    accent: "text-yellow-300",
    bgGradient: "from-yellow-600/50 via-amber-900 to-black",
  },
};

const badgeIcons: Record<string, typeof Shield> = {
  default_badge: Shield,
  novice_badge: Shield,
  badge_founder_sigil: Sparkles,
  badge_phoenix_crest: Flame,
  badge_iron_shield: Shield,
};

const sizeClasses = {
  sm: "h-11 w-11 text-sm",
  md: "h-16 w-16 text-lg",
  lg: "h-24 w-24 text-2xl",
  xl: "h-32 w-32 text-4xl",
};

export function CosmeticFrame({
  frameKey = "default_frame",
  badgeKey = "novice_badge",
  size = "md",
  className,
  username = "A",
}: CosmeticFrameProps) {
  const frame = frameStyles[frameKey] || frameStyles.default_frame;
  const BadgeIcon = badgeIcons[badgeKey] || Crown;

  const initial = username.charAt(0).toUpperCase();

  return (
    <div className={cn("relative inline-flex items-center justify-center select-none", className)}>
      {/* Frame Visual Ornaments (Laurel, Spikes, or Celestial Halo) */}
      {frameKey === "frame_bronze_laurel" && (
        <div className="absolute -inset-1 rounded-2xl border border-amber-400/40 pointer-events-none animate-pulse" />
      )}
      {frameKey === "frame_celestial_gold" && (
        <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-yellow-400/30 via-amber-500/20 to-yellow-400/30 blur-sm pointer-events-none" />
      )}
      {frameKey === "frame_obsidian_spikes" && (
        <div className="absolute -inset-1 rounded-2xl border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] pointer-events-none" />
      )}

      {/* Main Avatar Container */}
      <div
        className={cn(
          "rounded-2xl border-2 ring-2 transition-all duration-300 flex items-center justify-center relative overflow-hidden bg-gradient-to-br",
          sizeClasses[size],
          frame.border,
          frame.ring,
          frame.shadow,
          frame.bgGradient
        )}
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />

        {/* Avatar Initial Monogram */}
        <span className="relative z-10 font-black font-cinzel text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {initial}
        </span>
      </div>

      {/* Mini Badge Emblem (Equipped Badge) */}
      <div
        className={cn(
          "absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 border border-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.5)] z-20 flex items-center justify-center",
          frame.accent
        )}
        title={`Equipped Badge: ${badgeKey.replace(/_/g, " ")}`}
      >
        <BadgeIcon className={size === "xl" ? "h-5 w-5" : size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </div>
    </div>
  );
}
