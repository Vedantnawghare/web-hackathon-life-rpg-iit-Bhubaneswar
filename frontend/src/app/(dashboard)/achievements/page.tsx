"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Achievement } from "@/types/achievement";
import { Trophy, CheckCircle, Lock, Coins, Sparkles } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AchievementsPage() {
  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: () => apiClient<Achievement[]>("/achievements"),
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <Trophy className="h-6 w-6 text-amber-400" /> Hall of Achievements
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Milestones earned through heroic dedication and unwavering consistency.
        </p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Unveiling achievements ledger...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements?.map((ach) => (
            <Card
              key={ach.id}
              className={`transition-all ${
                ach.is_unlocked
                  ? "bg-slate-900/90 border-amber-500/30"
                  : "bg-slate-950/60 border-slate-800/80 opacity-70"
              }`}
            >
              <CardHeader className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-lg border flex-shrink-0 ${
                        ach.is_unlocked
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-slate-800/60 border-slate-700 text-slate-500"
                      }`}
                    >
                      {ach.is_unlocked ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-semibold">{ach.title}</CardTitle>
                        <Badge variant="outline" className="text-[10px]">
                          {ach.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-1">{ach.description}</CardDescription>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-1 text-xs">
                    <div className="flex items-center gap-1 text-amber-300 font-mono font-semibold">
                      <Sparkles className="h-3 w-3 text-amber-400" /> +{ach.reward_xp} XP
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-mono font-semibold">
                      <Coins className="h-3 w-3" /> +{ach.reward_gold} G
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
