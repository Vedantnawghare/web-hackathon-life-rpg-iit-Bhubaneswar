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
  Award,
  Layers,
} from "lucide-react";
import { cn, formatXP } from "@/lib/utils";

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
  { icon: React.ComponentType<{ className?: string }>; label: string; color: string }
> = {
  STRENGTH: { icon: Dumbbell, label: "Strength", color: "text-rose-400" },
  INTELLECT: { icon: Brain, label: "Intellect", color: "text-blue-400" },
  DISCIPLINE: { icon: Compass, label: "Discipline", color: "text-amber-400" },
  VITALITY: { icon: Heart, label: "Vitality", color: "text-emerald-400" },
  CREATIVITY: { icon: Palette, label: "Creativity", color: "text-purple-400" },
};

export default function HistoryPage() {
  const [page, setPage] = useState(0);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const offset = page * PAGE_SIZE;

  // Paginated table data query
  const { data, isLoading, error } = useQuery<QuestHistoryResponse>({
    queryKey: ["quests", "history", page],
    queryFn: () => apiClient<QuestHistoryResponse>(`/quests/history?limit=${PAGE_SIZE}&offset=${offset}`),
  });

  // Comprehensive analytics query: loads up to 100 historical deeds for multi-day graphs
  const { data: analyticsData } = useQuery<QuestHistoryResponse>({
    queryKey: ["quests", "history", "analytics-all"],
    queryFn: () => apiClient<QuestHistoryResponse>("/quests/history?limit=100&offset=0"),
  });

  const total = data?.total ?? 0;
  const rawItems = useMemo(() => data?.items ?? [], [data?.items]);
  const allAnalyticsItems = useMemo(() => analyticsData?.items ?? rawItems, [analyticsData?.items, rawItems]);

  // Filter items for table
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
    allAnalyticsItems.forEach((item) => {
      if (item.completed_at) {
        const d = new Date(item.completed_at);
        const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
        const dayName = days[dayIdx];
        if (dayName) counts[dayName] = (counts[dayName] || 0) + 1;
      }
    });
    const maxCount = Math.max(...Object.values(counts), 1);
    return { counts, maxCount };
  }, [allAnalyticsItems]);

  // Real Authenticated Analytics: Attribute/category breakdown
  const attributeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      INTELLECT: 0,
      STRENGTH: 0,
      DISCIPLINE: 0,
      VITALITY: 0,
      CREATIVITY: 0,
    };
    allAnalyticsItems.forEach((item) => {
      const attr = (item.primary_attribute || "DISCIPLINE").toUpperCase();
      if (counts[attr] !== undefined) {
        counts[attr]++;
      } else {
        counts.DISCIPLINE++;
      }
    });
    const totalCount = allAnalyticsItems.length || 1;
    return Object.entries(counts).map(([attr, count]) => ({
      attribute: attr as CharacterAttribute,
      count,
      pct: Math.round((count / totalCount) * 100),
    }));
  }, [allAnalyticsItems]);

  // Real Authenticated Analytics: Chronological Cumulative XP Progression Curve
  const xpProgression = useMemo(() => {
    if (allAnalyticsItems.length === 0) return { points: [], totalXp: 0, maxDaily: 0, avgDaily: 0 };
    const dateMap = new Map<string, number>();
    allAnalyticsItems.forEach((item) => {
      const dStr = item.completion_date || item.completed_at.slice(0, 10);
      dateMap.set(dStr, (dateMap.get(dStr) || 0) + item.earned_xp);
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    let cumulative = 0;
    let maxDaily = 0;

    const points = sortedDates.map((dStr) => {
      const daily = dateMap.get(dStr) || 0;
      cumulative += daily;
      if (daily > maxDaily) maxDaily = daily;
      const d = new Date(dStr);
      const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return { date: dStr, label, daily, cumulative };
    });

    const totalXp = cumulative;
    const avgDaily = points.length > 0 ? Math.round(totalXp / points.length) : 0;
    return { points, totalXp, maxDaily, avgDaily };
  }, [allAnalyticsItems]);

  // Real Authenticated Analytics: Difficulty Distribution
  const difficultyBreakdown = useMemo(() => {
    const counts: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0, EPIC: 0 };
    allAnalyticsItems.forEach((item) => {
      if (counts[item.difficulty] !== undefined) counts[item.difficulty]++;
    });
    const totalCount = allAnalyticsItems.length || 1;
    return Object.entries(counts).map(([diff, count]) => ({
      difficulty: diff as QuestDifficulty,
      count,
      pct: Math.round((count / totalCount) * 100),
    }));
  }, [allAnalyticsItems]);

  // Real Authenticated Analytics: Category Performance
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    allAnalyticsItems.forEach((item) => {
      const cat = item.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const totalCount = allAnalyticsItems.length || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({
        category,
        count,
        pct: Math.round((count / totalCount) * 100),
      }));
  }, [allAnalyticsItems]);

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
            <div className="flex items-center gap-2">
              <History className="h-6 w-6 text-amber-400" />
              <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white drop-shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                Chronicles & Expedition Logs
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Authoritative audit trail of completed quests, lifetime experience milestones, and domain mastery
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-slate-900/80 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-amber-300">
                {total} Completed Deeds
              </span>
            </div>
          </div>
        </div>

        {/* Analytics Section 1: XP Progression & Cumulative Growth Curve */}
        <Card className="border-2 border-amber-500/30 bg-slate-900/85 backdrop-blur-md shadow-xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-800/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-display font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-400" />
                  CUMULATIVE XP PROGRESSION & EXPEDITION CURVE
                </CardTitle>
                <CardDescription className="text-xs text-slate-300 mt-0.5">
                  Multi-day growth trajectory charting experience gained across completed bounties
                </CardDescription>
              </div>

              {/* Stat HUD Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono font-bold text-amber-300">
                  Total XP: +{formatXP(xpProgression.totalXp)}
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-[11px] font-mono font-bold text-indigo-300">
                  Daily Avg: ~{formatXP(xpProgression.avgDaily)} XP
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-300">
                  {xpProgression.points.length} Active Days Recorded
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {xpProgression.points.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                <TrendingUp className="h-6 w-6 text-slate-600 mb-2" />
                <p className="text-xs text-slate-400">
                  Complete contracts across multiple days to reveal your historical experience progression curve.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual Area/Line Progression Graph */}
                <div className="relative h-44 w-full pt-4 pb-6 px-3">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="xpAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                        <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="xpLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#d97706" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#fef08a" />
                      </linearGradient>
                    </defs>

                    {/* Generate SVG polyline and area polygon points */}
                    {(() => {
                      const pts = xpProgression.points;
                      const maxVal = pts[pts.length - 1]?.cumulative || 1;
                      const coords = pts.map((p, i) => {
                        const x = pts.length === 1 ? 50 : (i / (pts.length - 1)) * 100;
                        const y = Math.max(5, Math.min(95, 95 - (p.cumulative / maxVal) * 85));
                        return { x, y, point: p };
                      });

                      const polyPoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
                      const areaPoints = `0,95 ${polyPoints} 100,95`;

                      return (
                        <>
                          {/* Grid Guideline Lines */}
                          <line x1="0" y1="20" x2="100" y2="20" stroke="#334155" strokeDasharray="2 2" strokeWidth="0.5" opacity="0.4" />
                          <line x1="0" y1="55" x2="100" y2="55" stroke="#334155" strokeDasharray="2 2" strokeWidth="0.5" opacity="0.4" />
                          <line x1="0" y1="95" x2="100" y2="95" stroke="#475569" strokeWidth="0.75" opacity="0.6" />

                          {/* Gradient Area Fill */}
                          <polygon points={areaPoints} fill="url(#xpAreaGrad)" />

                          {/* Main Glowing Trendline */}
                          <polyline
                            fill="none"
                            stroke="url(#xpLineGrad)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={polyPoints}
                          />

                          {/* Glowing interactive nodes */}
                          {coords.map((c, idx) => (
                            <g key={idx} className="cursor-pointer group">
                              <circle
                                cx={c.x}
                                cy={c.y}
                                r="3.5"
                                className="fill-amber-400 stroke-slate-950 stroke-2 group-hover:r-5 transition-all"
                              />
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>

                  {/* Horizontal Dates Axis */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2">
                    {xpProgression.points.map((p, idx) => (
                      <span key={idx} className="text-center truncate px-1">
                        {p.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Day-by-day milestone chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 border-t border-slate-800/60">
                  {xpProgression.points.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center text-center group hover:border-amber-500/40 transition-colors"
                    >
                      <span className="text-[10px] font-mono text-slate-400">{p.label}</span>
                      <span className="text-xs font-mono font-bold text-amber-300 mt-0.5">
                        +{p.daily} XP
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                        Σ {p.cumulative}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Section 2: Weekly Adventure & Attribute Domains */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chart 1: Weekly Adventure Activity (Day of Week) */}
          <Card className="lg:col-span-6 border-2 border-amber-500/30 bg-slate-900/85 backdrop-blur-md shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-display font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-amber-400" />
                  WEEKLY ADVENTURE ACTIVITY
                </CardTitle>
                <span className="text-[11px] font-mono text-slate-400">Day of Week</span>
              </div>
              <CardDescription className="text-xs text-slate-300">
                Frequency of completed deeds across each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {allAnalyticsItems.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                  <TrendingUp className="h-6 w-6 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400">
                    Complete more quests to reveal your weekly adventure activity chart.
                  </p>
                </div>
              ) : (
                <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
                  {Object.entries(weeklyDayActivity.counts).map(([day, count]) => {
                    const heightPct = Math.max(10, Math.round((count / weeklyDayActivity.maxCount) * 100));
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
              {allAnalyticsItems.length === 0 ? (
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

        {/* Analytics Section 3: Difficulty & Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Difficulty Tier Distribution */}
          <Card className="lg:col-span-6 border-2 border-amber-500/30 bg-slate-900/85 backdrop-blur-md shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-display font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-400" />
                  DIFFICULTY TIER DISTRIBUTION
                </CardTitle>
                <span className="text-[11px] font-mono text-slate-400">Challenge Ratio</span>
              </div>
              <CardDescription className="text-xs text-slate-300">
                Breakdown of contracts conquered by heroic difficulty tier
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {difficultyBreakdown.map((diff) => {
                  const style = difficultyStyles[diff.difficulty];
                  return (
                    <div
                      key={diff.difficulty}
                      className={cn(
                        "p-3 rounded-xl border flex flex-col items-center justify-center text-center",
                        style.bg,
                        style.border
                      )}
                    >
                      <span className={cn("text-xs font-mono font-bold tracking-wider", style.text)}>
                        {diff.difficulty}
                      </span>
                      <span className="text-lg font-mono font-black text-white mt-1">
                        {diff.count}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {diff.pct}% of total
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card className="lg:col-span-6 border-2 border-amber-500/30 bg-slate-900/85 backdrop-blur-md shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-display font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="h-4 w-4 text-sky-400" />
                  CATEGORY PERFORMANCE
                </CardTitle>
                <span className="text-[11px] font-mono text-slate-400">Domain Breakdown</span>
              </div>
              <CardDescription className="text-xs text-slate-300">
                Highest active categories across all completed adventurer contracts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-2">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-xs">
                    <span className="font-semibold text-slate-200">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-300 font-bold">{cat.count} deeds</span>
                      <span className="font-mono text-slate-400 text-[11px]">({cat.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Toolbar for Table */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs backdrop-blur-md">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "EASY", "MEDIUM", "HARD", "EPIC"].map((tier) => {
              const isSelected = difficultyFilter === tier;
              return (
                <button
                  key={tier}
                  onClick={() => {
                    setDifficultyFilter(tier);
                    setPage(0);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-mono font-medium transition-colors whitespace-nowrap",
                    isSelected
                      ? "bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  )}
                >
                  {tier}
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search historical contracts..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="h-8 pl-8 text-xs bg-slate-950/60 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-amber-500/30"
            />
          </div>
        </div>

        {/* Paginated Historical Records Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-900/60 animate-pulse border border-slate-800/60" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center border border-red-500/20 rounded-xl bg-red-950/20 text-red-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
            <p className="text-sm font-semibold">Failed to retrieve historical archives.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center border border-slate-800 rounded-xl bg-slate-900/40">
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
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
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
