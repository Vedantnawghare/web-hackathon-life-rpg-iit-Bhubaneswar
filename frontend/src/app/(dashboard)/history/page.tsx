"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QuestHistoryResponse, QuestDifficulty, CharacterAttribute } from "@/types/quest";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  History,
  Sparkles,
  Coins,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Brain,
  Compass,
  Heart,
  Palette,
  Clock,
  AlertCircle,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

const difficultyStyles: Record<
  QuestDifficulty,
  { bg: string; text: string; border: string }
> = {
  EASY: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  MEDIUM: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20" },
  HARD: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  EPIC: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
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

export default function HistoryPage() {
  const [page, setPage] = useState(0);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const offset = page * PAGE_SIZE;

  const { data, isLoading, error } = useQuery<QuestHistoryResponse>({
    queryKey: ["quests", "history", page],
    queryFn: () => apiClient<QuestHistoryResponse>(`/quests/history?limit=${PAGE_SIZE}&offset=${offset}`),
  });

  const total = data?.total ?? 0;
  const rawItems = data?.items ?? [];

  // Filter items
  const items = rawItems.filter((item) => {
    if (difficultyFilter !== "ALL" && item.difficulty !== difficultyFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const match =
        item.quest_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <History className="h-6 w-6 text-amber-400" /> Completion Chronicles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative audit trail of every quest cleared, XP earned, and attribute honed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono border-slate-800 text-slate-300">
            Total Quests Cleared: <span className="text-amber-400 ml-1 font-bold">{total}</span>
          </Badge>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "EASY", "MEDIUM", "HARD", "EPIC"].map((tier) => {
            const isSelected = difficultyFilter === tier;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setDifficultyFilter(tier)}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap",
                  isSelected
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                )}
              >
                {tier === "ALL" ? "All Difficulties" : tier}
              </button>
            );
          })}
        </div>

        <div className="relative flex-1 sm:w-56">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter past deeds..."
            className="h-8 pl-8 text-xs bg-slate-900 border-slate-800 focus:border-amber-500 text-slate-200"
          />
        </div>
      </div>

      {/* Main Ledger Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chronicles of Past Deeds</CardTitle>
          <CardDescription>
            Permanent immutable records generated from completed one-off, daily, and weekly cycles.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-slate-900 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-rose-300">Unable to load chronicles</p>
              <p className="text-xs text-slate-500 mt-1">Please try refreshing the page.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border-t border-slate-800/80">
              <History className="h-10 w-10 text-slate-600 mb-3" />
              <p className="text-sm text-slate-300 font-medium">No chronicles recorded yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Conquer challenges from your Quest Board to forge permanent records in this chronicle.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 border-t border-slate-800/80">
              {items.map((item) => {
                const diff = difficultyStyles[item.difficulty] || difficultyStyles.EASY;
                const attrInfo = attributeIcons[item.primary_attribute] || attributeIcons.INTELLECT;
                const AttrIcon = attrInfo.icon;
                const completedDate = new Date(item.completed_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-200">
                          {item.quest_title}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(diff.bg, diff.text, diff.border, "text-[10px] font-semibold")}
                        >
                          {item.difficulty}
                        </Badge>
                        <span className="text-[11px] text-slate-500 uppercase">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        <span>Date: {item.completion_date}</span>
                        <span className="text-slate-600">•</span>
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{completedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono font-semibold self-start sm:self-auto pt-1 sm:pt-0">
                      <span className="text-amber-400 flex items-center gap-1" title="XP Earned">
                        <Sparkles className="h-3.5 w-3.5" /> +{item.earned_xp} XP
                      </span>
                      <span className="text-amber-300 flex items-center gap-1" title="Gold Earned">
                        <Coins className="h-3.5 w-3.5" /> +{item.earned_gold} G
                      </span>
                      <span
                        className={cn("flex items-center gap-1", attrInfo.color)}
                        title={`${attrInfo.label} Increased`}
                      >
                        <AttrIcon className="h-3.5 w-3.5" /> +{item.attribute_gain}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>
            Showing {items.length} of {total} deeds (Page {page + 1} of {totalPages})
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="h-8 gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 gap-1"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
