"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QuestHistoryResponse, QuestDifficulty, CharacterAttribute } from "@/types/quest";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GAME_ASSETS } from "@/lib/game-assets";
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
  BarChart2,
  TrendingUp,
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
  const rawItems = useMemo(() => data?.items ?? [], [data?.items]);

  // Filter items
  const items = useMemo(() => {
    return rawItems.filter((item) => {
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
  }, [rawItems, difficultyFilter, searchQuery]);

  // Real Authenticated Analytics: Day of week activity
  const weeklyDayActivity = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    rawItems.forEach((item) => {
      if (item.completed_at) {
        const d = new Date(item.completed_at);
        const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
        const dayName = days[dayIdx];
        if (dayName) counts[dayName] = (counts[dayName] || 0) + 1;
      }
    });
    const maxCount = Math.max(...Object.values(counts), 1);
    return { counts, maxCount };
  }, [rawItems]);

  // Real Authenticated Analytics: Attribute/category breakdown
  const attributeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      INTELLECT: 0,
      STRENGTH: 0,
      DISCIPLINE: 0,
      VITALITY: 0,
      CREATIVITY: 0,
    };
    rawItems.forEach((item) => {
      const attr = (item.primary_attribute || "DISCIPLINE").toUpperCase();
      if (counts[attr] !== undefined) {
        counts[attr]++;
      } else {
        counts.DISCIPLINE++;
      }
    });
    const totalCount = rawItems.length || 1;
    return Object.entries(counts).map(([attr, count]) => ({
      attribute: attr as CharacterAttribute,
      count,
      pct: Math.round((count / totalCount) * 100),
    }));
  }, [rawItems]);

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <>
      {/* Fixed Guild Hall Environment Backdrop: Preserves full artwork composition */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img
          src={GAME_ASSETS.backgrounds.quests}
          alt="Chronicles Hall Backdrop"
          className="w-full h-full object-cover object-center brightness-[1.04] contrast-[1.05] saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e]/75 via-[#0c1435]/45 to-[#070b1e]/85" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5 font-display">
              <History className="h-6 w-6 text-amber-400" /> Completion Chronicles
            </h1>
            <p className="text-xs text-slate-300 mt-1 font-sans">
              Authoritative audit trail of every quest cleared, XP earned, and attribute honed across the realm.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono border-amber-500/40 bg-slate-950/80 text-amber-300 px-3 py-1 shadow">
              Total Quests Cleared: <span className="text-white ml-1.5 font-bold">{total}</span>
            </Badge>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RPG-STYLE ANALYTICS & PROGRESSION GRAPHS (REAL DATA ONLY) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Weekly Adventure Activity Bar Chart */}
          <Card className="lg:col-span-6 border-2 border-amber-500/30 bg-slate-900/85 backdrop-blur-md shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-display font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-amber-400" />
                  WEEKLY ADVENTURE
                </CardTitle>
                <span className="text-[11px] font-mono text-slate-400">Activity by Day</span>
              </div>
              <CardDescription className="text-xs text-slate-300">
                Frequency of completed deeds across each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {rawItems.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                  <TrendingUp className="h-6 w-6 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400">
                    Complete more quests to reveal your weekly adventure activity chart.
                  </p>
                </div>
              ) : (
                <div className="h-40 flex items-end justify-between gap-2 pt-6 px-2">
                  {Object.entries(weeklyDayActivity.counts).map(([day, count]) => {
                    const heightPct = Math.max(8, Math.round((count / weeklyDayActivity.maxCount) * 100));
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[10px] font-mono font-bold text-amber-300 opacity-80 group-hover:opacity-100 transition-opacity">
                          {count > 0 ? count : ""}
                        </span>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            count > 0
                              ? "bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                              : "bg-slate-800/40"
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">{day}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart 2: Attribute Profile & Domain Distribution */}
          <Card className="lg:col-span-6 border-2 border-amber-500/30 bg-slate-900/85 backdrop-blur-md shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-display font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  ATTRIBUTE PROFILE & DOMAINS
                </CardTitle>
                <span className="text-[11px] font-mono text-slate-400">Territory Distribution</span>
              </div>
              <CardDescription className="text-xs text-slate-300">
                Proportion of cleared contracts categorized by life faculty
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-2.5">
              {rawItems.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                  <Sparkles className="h-6 w-6 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400">
                    Clear bounties across different life domains to chart your attribute growth.
                  </p>
                </div>
              ) : (
                attributeBreakdown.map((item) => {
                  const meta = attributeIcons[item.attribute] || attributeIcons.DISCIPLINE;
                  const Icon = meta.icon;
                  return (
                    <div key={item.attribute} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 font-sans font-medium text-slate-200">
                          <Icon className={cn("h-3.5 w-3.5", meta.color)} />
                          <span>{meta.label}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-300 font-bold">
                          {item.count} tasks ({item.pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-slate-700 via-amber-400 to-amber-300 rounded-full transition-all duration-500"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs backdrop-blur-md">
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
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  )}
                >
                  {tier === "ALL" ? "All Difficulties" : tier}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder="Search cleared deeds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-slate-950/70 border-slate-700/80 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Content List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-slate-900/40 border border-slate-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load completion chronicles. Please check connection and try again.</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 p-6">
            <Clock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">No Chronicle Records Found</p>
            <p className="text-xs text-slate-400 mt-1">
              {difficultyFilter !== "ALL" || searchQuery
                ? "No completed deeds match the selected filters."
                : "Complete your first bounty contract to begin etching your legacy."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => {
              const diffStyle = difficultyStyles[item.difficulty] || difficultyStyles.EASY;
              const attrMeta = (item.primary_attribute && attributeIcons[item.primary_attribute]) || attributeIcons.DISCIPLINE;
              const AttrIcon = attrMeta.icon;

              const completedDate = new Date(item.completed_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800/80 bg-slate-900/75 hover:border-amber-500/40 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg border", diffStyle.bg, diffStyle.border)}>
                      <AttrIcon className={cn("h-4 w-4", attrMeta.color)} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-white font-display">
                          {item.quest_title}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-mono", diffStyle.text, diffStyle.border)}
                        >
                          {item.difficulty}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{item.category}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="h-3 w-3" />
                          {completedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rewards summary */}
                  <div className="flex items-center gap-3 self-end sm:self-center font-mono text-xs font-bold">
                    <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      +{item.earned_xp} XP
                    </span>
                    <span className="flex items-center gap-1 text-yellow-300 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                      <Coins className="h-3 w-3 text-yellow-400" />
                      +{item.earned_gold} G
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs text-slate-400">
            <span className="font-mono">
              Page {page + 1} of {totalPages} ({total} deeds recorded)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                aria-label="Previous page of deeds"
                className="h-8 gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page of deeds"
                className="h-8 gap-1"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
