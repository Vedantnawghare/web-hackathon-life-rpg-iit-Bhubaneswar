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
  { border: string; ring: string; shadow: string; accent: string }
> = {
  default_frame: {
    border: "border-slate-700",
    ring: "ring-slate-800",
    shadow: "shadow-none",
    accent: "text-slate-400",
  },
  frame_bronze_laurel: {
    border: "border-amber-700/80",
    ring: "ring-amber-900/50",
    shadow: "shadow-[0_0_15px_rgba(180,83,9,0.3)]",
    accent: "text-amber-500",
  },
  frame_obsidian_spikes: {
    border: "border-purple-600/80",
    ring: "ring-purple-950/60",
    shadow: "shadow-[0_0_20px_rgba(147,51,234,0.3)]",
    accent: "text-purple-400",
  },
  frame_celestial_gold: {
    border: "border-yellow-400",
    ring: "ring-amber-500/40",
    shadow: "shadow-[0_0_25px_rgba(251,191,36,0.5)]",
    accent: "text-yellow-300",
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
  sm: "h-10 w-10 text-xs",
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
      {/* Outer Glow Ring */}
      <div
        className={cn(
          "rounded-2xl border-2 ring-2 transition-all duration-300 flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950",
          sizeClasses[size],
          frame.border,
          frame.ring,
          frame.shadow
        )}
      >
        {/* Avatar Monogram */}
        <span className="font-black font-mono text-slate-100 tracking-wider">
          {initial}
        </span>
      </div>

      {/* Mini Badge Emblem in bottom right */}
      {size !== "sm" && (
        <div
          className={cn(
            "absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 border border-slate-700 shadow-md",
            frame.accent
          )}
          title={`Equipped Badge: ${badgeKey.replace(/_/g, " ")}`}
        >
          <BadgeIcon className={size === "xl" ? "h-5 w-5" : "h-3.5 w-3.5"} />
        </div>
      )}
    </div>
  );
}
