"use client";

import { Achievement } from "@/types/achievement";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Sword,
  Crown,
  Flame,
  Shield,
  Target,
  Sparkles,
  Compass,
  Star,
  CheckCircle2,
  Lock,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  achievement: Achievement;
}

const iconMap: Record<string, typeof Trophy> = {
  sword: Sword,
  crown: Crown,
  flame: Flame,
  shield: Shield,
  target: Target,
  sparkles: Sparkles,
  compass: Compass,
  star: Star,
  trophy: Trophy,
};

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon_name] || Trophy;
  const isUnlocked = achievement.is_unlocked;
  const progress = achievement.current_progress ?? 0;
  const threshold = achievement.condition_threshold || 1;
  const progressPercent = Math.min(100, Math.round((progress / threshold) * 100));

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        isUnlocked
          ? "bg-slate-900/80 border-amber-500/40 shadow-lg shadow-amber-500/5 hover:border-amber-500/60"
          : "bg-slate-950/60 border-slate-800/80 opacity-75 hover:opacity-90"
      )}
    >
      {/* Top Accent Ribbon */}
      <div
        className={cn(
          "h-1 w-full",
          isUnlocked
            ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            : "bg-slate-800"
        )}
      />

      <CardContent className="p-4 space-y-3">
        {/* Header: Icon + Title + Category */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-all",
              isUnlocked
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "bg-slate-900 border-slate-800 text-slate-600"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4
                className={cn(
                  "font-bold text-sm truncate",
                  isUnlocked ? "text-slate-100" : "text-slate-400"
                )}
              >
                {achievement.title}
              </h4>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] uppercase font-semibold",
                  isUnlocked
                    ? "border-amber-500/30 text-amber-300 bg-amber-500/10"
                    : "border-slate-800 text-slate-500"
                )}
              >
                {achievement.category}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {achievement.description}
            </p>
          </div>
        </div>

        {/* Progress Bar (if locked) or Unlock Date (if unlocked) */}
        {isUnlocked ? (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="h-3.5 w-3.5" /> Unlocked
            </span>
            {achievement.unlocked_at && (
              <span className="text-[10px] font-mono text-slate-400">
                {new Date(achievement.unlocked_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <Lock className="h-3 w-3 text-slate-600" /> Progress
              </span>
              <span className="font-mono text-slate-400 font-medium">
                {progress} / {threshold} ({progressPercent}%)
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Rewards Footer */}
        <div className="flex items-center justify-between text-xs pt-1 font-mono">
          <div className="flex items-center gap-3">
            {achievement.reward_xp > 0 && (
              <span className="text-amber-400 font-semibold flex items-center gap-1 text-[11px]">
                <Sparkles className="h-3 w-3" /> +{achievement.reward_xp} XP
              </span>
            )}
            {achievement.reward_gold > 0 && (
              <span className="text-amber-300 font-semibold flex items-center gap-1 text-[11px]">
                <Coins className="h-3 w-3" /> +{achievement.reward_gold} G
              </span>
            )}
          </div>

          {achievement.reward_title && (
            <span className="text-[10px] text-purple-300 font-sans font-medium px-2 py-0.5 rounded bg-purple-950/40 border border-purple-500/20">
              Title: {achievement.reward_title}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
