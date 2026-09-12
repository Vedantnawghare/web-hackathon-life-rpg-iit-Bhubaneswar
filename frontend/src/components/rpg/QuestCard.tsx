"use client";

import { useState } from "react";
import { Quest, QuestDifficulty, CharacterAttribute } from "@/types/quest";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sword,
  CheckCircle2,
  Calendar,
  Repeat,
  Sparkles,
  Coins,
  Dumbbell,
  Brain,
  Compass,
  Heart,
  Palette,
  Trash2,
  Loader2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: string) => Promise<void> | void;
  isCompleting?: boolean;
  onArchive?: (questId: string) => Promise<void> | void;
  isArchiving?: boolean;
}

const difficultyStyles: Record<
  QuestDifficulty,
  { bg: string; text: string; border: string; label: string }
> = {
  EASY: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    label: "Easy",
  },
  MEDIUM: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/20",
    label: "Medium",
  },
  HARD: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    label: "Hard",
  },
  EPIC: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    label: "Epic",
  },
};

const attributeIcons: Record<
  CharacterAttribute,
  { icon: typeof Dumbbell; label: string; color: string }
> = {
  STRENGTH: { icon: Dumbbell, label: "Strength", color: "text-rose-400" },
  INTELLECT: { icon: Brain, label: "Intellect", color: "text-blue-400" },
  DISCIPLINE: { icon: Compass, label: "Discipline", color: "text-emerald-400" },
  VITALITY: { icon: Heart, label: "Vitality", color: "text-amber-400" },
  CREATIVITY: { icon: Palette, label: "Creativity", color: "text-purple-400" },
};

const attributeBonusByDifficulty: Record<QuestDifficulty, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 4,
  EPIC: 8,
};

export function QuestCard({
  quest,
  onComplete,
  isCompleting = false,
  onArchive,
  isArchiving = false,
}: QuestCardProps) {
  const [confirmArchive, setConfirmArchive] = useState(false);
  const diff = difficultyStyles[quest.difficulty] || difficultyStyles.EASY;
  const attrInfo = attributeIcons[quest.primary_attribute] || attributeIcons.INTELLECT;
  const AttrIcon = attrInfo.icon;
  const attrBonus = attributeBonusByDifficulty[quest.difficulty] || 1;

  const isCompleted = quest.is_completed_for_period;

  const getCompletionBadgeLabel = () => {
    if (quest.recurrence === "DAILY") return "Cleared Today";
    if (quest.recurrence === "WEEKLY") return "Cleared This Week";
    return "Completed";
  };

  return (
    <Card
      className={cn(
        "relative transition-all duration-200 overflow-hidden",
        isCompleted
          ? "bg-slate-900/40 border-slate-800/60 opacity-85"
          : "bg-slate-900/80 border-slate-800 hover:border-slate-700/90 hover:shadow-lg hover:shadow-amber-500/5"
      )}
    >
      {/* Top Border Accent */}
      <div
        className={cn(
          "h-1 w-full",
          isCompleted
            ? "bg-emerald-500/40"
            : quest.difficulty === "EPIC"
            ? "bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500"
            : quest.difficulty === "HARD"
            ? "bg-amber-500"
            : quest.difficulty === "MEDIUM"
            ? "bg-sky-500"
            : "bg-emerald-500"
        )}
      />

      <CardContent className="p-5 space-y-4">
        {/* Header Row: Category, Recurrence, Difficulty */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              {quest.category}
            </span>
            <span className="text-slate-600">•</span>
            {quest.recurrence === "DAILY" ? (
              <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                <Repeat className="h-3 w-3" /> Daily
              </span>
            ) : quest.recurrence === "WEEKLY" ? (
              <span className="inline-flex items-center gap-1 text-sky-400 font-medium">
                <Calendar className="h-3 w-3" /> Weekly
              </span>
            ) : (
              <span className="text-slate-400 font-medium">One-Off</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn(diff.bg, diff.text, diff.border, "font-semibold")}
            >
              {diff.label}
            </Badge>

            {isCompleted && (
              <Badge
                variant="outline"
                className="bg-emerald-950/40 text-emerald-300 border-emerald-500/30 gap-1 font-medium"
              >
                <CheckCircle2 className="h-3 w-3" />
                {getCompletionBadgeLabel()}
              </Badge>
            )}
          </div>
        </div>

        {/* Quest Title & Description */}
        <div>
          <h3
            className={cn(
              "font-bold text-base text-slate-100 leading-snug",
              isCompleted && "line-through text-slate-400"
            )}
          >
            {quest.title}
          </h3>
          {quest.description && (
            <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
              {quest.description}
            </p>
          )}
        </div>

        {/* Rewards & Attribute Gains Row */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-3">
            {/* XP Reward */}
            <div
              className="flex items-center gap-1 text-amber-400 font-mono font-semibold"
              title="Base XP earned upon completion"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>+{quest.base_xp} XP</span>
            </div>

            {/* Gold Reward */}
            <div
              className="flex items-center gap-1 text-amber-300 font-mono font-semibold"
              title="Gold earned upon completion"
            >
              <Coins className="h-3.5 w-3.5" />
              <span>+{quest.base_gold} G</span>
            </div>

            {/* Primary Attribute Reward */}
            <div
              className={cn("flex items-center gap-1 font-mono font-semibold", attrInfo.color)}
              title={`${attrInfo.label} attribute increase`}
            >
              <AttrIcon className="h-3.5 w-3.5" />
              <span>+{attrBonus}</span>
            </div>
          </div>

          {/* Due date if set */}
          {quest.due_date && (
            <div
              className="flex items-center gap-1 text-slate-400 text-[11px]"
              title={`Due: ${quest.due_date}`}
            >
              <Clock className="h-3 w-3 text-slate-500" />
              <span>{quest.due_date}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Archive / Delete confirmation toggle */}
          {onArchive && (
            <div>
              {confirmArchive ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs px-2.5"
                    disabled={isArchiving}
                    onClick={() => onArchive(quest.id)}
                  >
                    {isArchiving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm Archive"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs px-2 text-slate-400 hover:text-slate-200"
                    onClick={() => setConfirmArchive(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                  title="Archive Quest"
                  onClick={() => setConfirmArchive(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}

          {/* Clear / Complete Button */}
          <div className="ml-auto">
            {isCompleted ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="gap-1.5 text-xs text-emerald-400 border-emerald-500/20 bg-emerald-950/20 cursor-not-allowed opacity-80"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {getCompletionBadgeLabel()}
              </Button>
            ) : (
              <Button
                variant="gold"
                size="sm"
                className="gap-1.5 text-xs font-semibold shadow-sm hover:shadow-amber-500/20"
                disabled={isCompleting}
                onClick={() => onComplete(quest.id)}
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <Sword className="h-3.5 w-3.5" />
                    <span>Clear Quest</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
