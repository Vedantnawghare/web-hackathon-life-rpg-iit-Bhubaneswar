"use client";

import { useState } from "react";
import { Quest, QuestDifficulty, CharacterAttribute } from "@/types/quest";
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
  Scroll,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: string) => Promise<void> | void;
  isCompleting?: boolean;
  onArchive?: (questId: string) => Promise<void> | void;
  isArchiving?: boolean;
}

interface DifficultyTheme {
  label: string;
  rarityTier: string;
  cardStyle: string;
  badgeStyle: string;
  headerAccent: string;
  waxSealColor: string;
}

const difficultyThemes: Record<QuestDifficulty, DifficultyTheme> = {
  EASY: {
    label: "Common Notice",
    rarityTier: "Rank I",
    cardStyle:
      "border-slate-700/70 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950 hover:border-emerald-500/50 hover:shadow-[0_4px_20px_rgba(16,185,129,0.12)]",
    badgeStyle: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    headerAccent: "bg-emerald-500/60",
    waxSealColor: "hover:bg-emerald-600 hover:border-emerald-400",
  },
  MEDIUM: {
    label: "Uncommon Bounty",
    rarityTier: "Rank II",
    cardStyle:
      "border-sky-500/40 bg-gradient-to-b from-sky-950/20 via-slate-900/95 to-slate-950 hover:border-sky-400/70 hover:shadow-[0_4px_25px_rgba(56,189,248,0.2)]",
    badgeStyle: "bg-sky-500/15 text-sky-300 border-sky-500/40",
    headerAccent: "bg-gradient-to-r from-sky-500 to-indigo-500",
    waxSealColor: "hover:bg-sky-600 hover:border-sky-400",
  },
  HARD: {
    label: "Rare Crusade",
    rarityTier: "Rank III",
    cardStyle:
      "border-amber-500/50 bg-gradient-to-b from-amber-950/25 via-slate-900/95 to-slate-950 shadow-[0_4px_25px_rgba(245,158,11,0.15)] hover:border-amber-400 hover:shadow-[0_6px_30px_rgba(245,158,11,0.3)]",
    badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold",
    headerAccent: "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600",
    waxSealColor: "hover:bg-amber-600 hover:border-yellow-400",
  },
  EPIC: {
    label: "Legendary Decree",
    rarityTier: "Rank IV",
    cardStyle:
      "border-purple-500/60 bg-gradient-to-b from-purple-950/30 via-slate-900/95 to-slate-950 shadow-[0_4px_30px_rgba(168,85,247,0.25)] hover:border-purple-400 hover:shadow-[0_8px_40px_rgba(168,85,247,0.45)] ring-1 ring-purple-500/30",
    badgeStyle: "bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold",
    headerAccent: "bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400",
    waxSealColor: "hover:bg-purple-600 hover:border-purple-400",
  },
};

const attributeDetails: Record<
  CharacterAttribute,
  { icon: typeof Dumbbell; label: string; tagColor: string; chipStyle: string }
> = {
  STRENGTH: {
    icon: Dumbbell,
    label: "Strength",
    tagColor: "text-rose-400",
    chipStyle: "bg-rose-500/10 border-rose-500/30 text-rose-300",
  },
  INTELLECT: {
    icon: Brain,
    label: "Intellect",
    tagColor: "text-sky-400",
    chipStyle: "bg-sky-500/10 border-sky-500/30 text-sky-300",
  },
  DISCIPLINE: {
    icon: Compass,
    label: "Discipline",
    tagColor: "text-emerald-400",
    chipStyle: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  },
  VITALITY: {
    icon: Heart,
    label: "Vitality",
    tagColor: "text-amber-400",
    chipStyle: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  },
  CREATIVITY: {
    icon: Palette,
    label: "Creativity",
    tagColor: "text-purple-400",
    chipStyle: "bg-purple-500/10 border-purple-500/30 text-purple-300",
  },
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
  const theme = difficultyThemes[quest.difficulty] || difficultyThemes.EASY;
  const attrInfo = attributeDetails[quest.primary_attribute] || attributeDetails.INTELLECT;
  const AttrIcon = attrInfo.icon;
  const attrBonus = attributeBonusByDifficulty[quest.difficulty] || 1;

  const isCompleted = quest.is_completed_for_period;

  const getRecurrenceBadge = () => {
    switch (quest.recurrence) {
      case "DAILY":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold tracking-wide">
            <Repeat className="h-3 w-3" /> Daily Mandate
          </span>
        );
      case "WEEKLY":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px] font-mono font-bold tracking-wide">
            <Calendar className="h-3 w-3" /> Weekly Crusade
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-mono font-medium">
            <Scroll className="h-3 w-3 text-slate-400" /> Quest Bounty
          </span>
        );
    }
  };

  const getCompletionBadgeLabel = () => {
    if (quest.recurrence === "DAILY") return "Deed Sealed Today";
    if (quest.recurrence === "WEEKLY") return "Crusade Accomplished";
    return "Deed Conquered";
  };

  return (
    <article
      className={cn(
        "relative rounded-xl border transition-all duration-300 overflow-hidden flex flex-col justify-between",
        isCompleted
          ? "bg-slate-950/60 border-slate-800/80 opacity-80 backdrop-blur-sm"
          : cn("backdrop-blur-md", theme.cardStyle)
      )}
    >
      {/* Ornate Top Accent Bar */}
      <div
        className={cn(
          "h-1.5 w-full",
          isCompleted ? "bg-emerald-500/40" : theme.headerAccent
        )}
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Top Metadata Row: Recurrence, Category Stamp, Difficulty */}
        <div>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <div className="flex items-center gap-2">
              {getRecurrenceBadge()}
              <span className="text-slate-600 font-bold">•</span>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
                {quest.category}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className={cn("text-[10px] font-mono", theme.badgeStyle)}>
                {theme.rarityTier} • {theme.label}
              </Badge>
            </div>
          </div>

          {/* Title & Description */}
          <h3
            className={cn(
              "font-bold text-base sm:text-lg text-slate-100 font-display leading-snug tracking-tight",
              isCompleted && "line-through text-slate-400"
            )}
          >
            {quest.title}
          </h3>

          {quest.description && (
            <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed font-sans">
              {quest.description}
            </p>
          )}
        </div>

        {/* Tangible Loot Chips & Expiry */}
        <div className="space-y-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Loot Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* XP Loot Chip */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs shadow-sm"
                title="Authoritative Base XP Bounty"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>+{quest.base_xp} XP</span>
              </div>

              {/* Gold Loot Chip */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-mono font-bold text-xs shadow-sm"
                title="Authoritative Gold Treasury Bounty"
              >
                <Coins className="h-3.5 w-3.5 text-yellow-400" />
                <span>+{quest.base_gold} G</span>
              </div>

              {/* Primary Attribute Chip */}
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono font-bold text-xs shadow-sm",
                  attrInfo.chipStyle
                )}
                title={`${attrInfo.label} realm progression score`}
              >
                <AttrIcon className="h-3.5 w-3.5" />
                <span>+{attrBonus} {quest.primary_attribute.slice(0, 3)}</span>
              </div>
            </div>

            {/* Due date timestamp if present */}
            {quest.due_date && (
              <div
                className="flex items-center gap-1 text-[11px] font-mono text-slate-400"
                title={`Contract expiration: ${quest.due_date}`}
              >
                <Clock className="h-3 w-3 text-slate-500" />
                <span>{quest.due_date}</span>
              </div>
            )}
          </div>

          {/* Action Row: Archive & Claim Bounty */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {/* Archive / Abandon Contract Button */}
            {onArchive ? (
              <div>
                {confirmArchive ? (
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-9 text-xs px-2.5 font-mono"
                      disabled={isArchiving}
                      onClick={() => onArchive(quest.id)}
                    >
                      {isArchiving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm Archive"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 text-xs px-2 text-slate-400 hover:text-slate-200"
                      onClick={() => setConfirmArchive(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmArchive(true)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
                    title="Archive this bounty notice"
                    aria-label={`Archive bounty: ${quest.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}

            {/* Completion Button / Wax Seal */}
            <div>
              {isCompleted ? (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>{getCompletionBadgeLabel()}</span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isCompleting}
                  onClick={() => onComplete(quest.id)}
                  aria-label={`Claim bounty for ${quest.title}`}
                  className={cn(
                    "min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md disabled:cursor-not-allowed",
                    quest.difficulty === "EPIC"
                      ? "bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white hover:brightness-110 shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400/50"
                      : quest.difficulty === "HARD"
                      ? "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 font-black hover:brightness-110 shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-yellow-300/60"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:brightness-110 border border-amber-400/40"
                  )}
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-current" />
                      <span>Sealing Deed...</span>
                    </>
                  ) : (
                    <>
                      <Sword className="h-4 w-4 text-current" />
                      <span>Claim Bounty</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
