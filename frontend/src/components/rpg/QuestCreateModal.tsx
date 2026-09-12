"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  Quest,
  QuestCreatePayload,
  QuestDifficulty,
  QuestRecurrence,
} from "@/types/quest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Sword,
  Sparkles,
  Coins,
  Loader2,
  Calendar,
  Repeat,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  "Coding",
  "Fitness",
  "Learning",
  "Mindfulness",
  "Chores",
  "Work",
  "Creative",
  "Health",
];

const DIFFICULTY_CONFIG: Record<
  QuestDifficulty,
  {
    label: string;
    xp: number;
    gold: number;
    attrBonus: number;
    color: string;
    bg: string;
    border: string;
  }
> = {
  EASY: {
    label: "Easy",
    xp: 25,
    gold: 10,
    attrBonus: 1,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  MEDIUM: {
    label: "Medium",
    xp: 50,
    gold: 25,
    attrBonus: 2,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
  },
  HARD: {
    label: "Hard",
    xp: 100,
    gold: 60,
    attrBonus: 4,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  EPIC: {
    label: "Epic",
    xp: 250,
    gold: 150,
    attrBonus: 8,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
};

export function QuestCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: QuestCreateModalProps) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Coding");
  const [difficulty, setDifficulty] = useState<QuestDifficulty>("MEDIUM");
  const [recurrence, setRecurrence] = useState<QuestRecurrence>("DAILY");
  const [dueDate, setDueDate] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset error when inputs change
  useEffect(() => {
    setErrorMessage(null);
  }, [title, description, category, difficulty, recurrence, dueDate]);

  const createMutation = useMutation({
    mutationFn: (payload: QuestCreatePayload) =>
      apiClient<Quest>("/quests", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("Coding");
      setDifficulty("MEDIUM");
      setRecurrence("DAILY");
      setDueDate("");
      setErrorMessage(null);
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to post quest. Please try again.");
      }
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMessage("Quest title is required.");
      return;
    }
    if (cleanTitle.length > 120) {
      setErrorMessage("Quest title must be at most 120 characters.");
      return;
    }

    const payload: QuestCreatePayload = {
      title: cleanTitle,
      description: description.trim() ? description.trim() : undefined,
      category,
      difficulty,
      recurrence,
      due_date: dueDate ? dueDate : undefined,
    };

    createMutation.mutate(payload);
  };

  const preview = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sword className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="modal-title"
                className="text-lg font-bold text-slate-100 leading-none"
              >
                Inscribe New Quest
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Define a real-world task to earn authoritative XP, Gold, and attribute ranks.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-2.5 p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="quest-title"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Quest Title <span className="text-amber-400">*</span>
            </label>
            <Input
              id="quest-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete 2 LeetCode Mediums or 30m Workout"
              maxLength={120}
              required
              autoFocus
              className="bg-slate-900 border-slate-800 focus:border-amber-500 text-slate-100"
            />
            <span className="text-[10px] text-slate-500 block text-right mt-1">
              {title.length}/120
            </span>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="quest-desc"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Description / Victory Conditions (Optional)
            </label>
            <textarea
              id="quest-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specify the rules of engagement or notes for this challenge..."
              maxLength={1000}
              rows={2}
              className="w-full rounded-md bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Category & Recurrence Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label
                htmlFor="quest-cat"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Category
              </label>
              <select
                id="quest-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-md bg-slate-900 border border-slate-800 px-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Recurrence */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Recurrence Cycle
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(["NONE", "DAILY", "WEEKLY"] as QuestRecurrence[]).map((rec) => (
                  <button
                    key={rec}
                    type="button"
                    onClick={() => setRecurrence(rec)}
                    className={cn(
                      "h-10 text-xs font-medium rounded-md border transition-colors flex items-center justify-center gap-1",
                      recurrence === rec
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {rec === "DAILY" && <Repeat className="h-3 w-3" />}
                    {rec === "WEEKLY" && <Calendar className="h-3 w-3" />}
                    <span>{rec === "NONE" ? "One-Off" : rec === "DAILY" ? "Daily" : "Weekly"}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["EASY", "MEDIUM", "HARD", "EPIC"] as QuestDifficulty[]).map((tier) => {
                const conf = DIFFICULTY_CONFIG[tier];
                const isSelected = difficulty === tier;
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setDifficulty(tier)}
                    className={cn(
                      "p-2.5 rounded-lg border text-left transition-all",
                      isSelected
                        ? `${conf.bg} ${conf.border} shadow-sm ring-1 ring-amber-400/40`
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    )}
                  >
                    <span className={cn("block text-xs font-bold", isSelected ? conf.color : "text-slate-300")}>
                      {conf.label}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      +{conf.xp} XP • +{conf.gold} G
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Reward Preview Banner */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Authoritative Rewards:</span>
            <div className="flex items-center gap-3 font-mono font-semibold">
              <span className="text-amber-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> +{preview.xp} XP
              </span>
              <span className="text-amber-300 flex items-center gap-1">
                <Coins className="h-3.5 w-3.5" /> +{preview.gold} Gold
              </span>
              <span className={cn(preview.color)}>
                +{preview.attrBonus} Attribute
              </span>
            </div>
          </div>

          {/* Optional Due Date */}
          <div>
            <label
              htmlFor="quest-due"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Target Due Date (Optional)
            </label>
            <Input
              id="quest-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-slate-900 border-slate-800 text-slate-100 text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="sm"
              disabled={createMutation.isPending}
              className="gap-2 font-semibold"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Inscribing...</span>
                </>
              ) : (
                <>
                  <Sword className="h-4 w-4" />
                  <span>Post to Quest Board</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
