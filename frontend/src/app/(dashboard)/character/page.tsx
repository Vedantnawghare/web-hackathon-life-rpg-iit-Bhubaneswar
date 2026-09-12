"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Character } from "@/types/character";
import { Shield, Dumbbell, Brain, Compass, Heart, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CharacterPage() {
  const { data: character } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
  });

  const attributes = [
    { name: "Strength", value: character?.strength ?? 10, icon: Dumbbell, desc: "Physical power and fitness achievements", color: "text-rose-400" },
    { name: "Intellect", value: character?.intellect ?? 10, icon: Brain, desc: "Analytical and deep cognitive endeavors", color: "text-blue-400" },
    { name: "Discipline", value: character?.discipline ?? 10, icon: Compass, desc: "Consistency, habits, and mindfulness", color: "text-emerald-400" },
    { name: "Vitality", value: character?.vitality ?? 10, icon: Heart, desc: "Endurance, hydration, sleep, and recovery", color: "text-amber-400" },
    { name: "Creativity", value: character?.creativity ?? 10, icon: Palette, desc: "Artistic expression, design, and innovation", color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <Shield className="h-6 w-6 text-amber-400" /> Character Dossier
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect your hero attributes, active titles, and progression stats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Character Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-20 w-20 rounded-full bg-slate-800 border-2 border-amber-500/40 flex items-center justify-center text-amber-300 text-2xl font-bold mb-3 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              {character?.username?.charAt(0).toUpperCase() || "H"}
            </div>
            <CardTitle>{character?.username || "Hero"}</CardTitle>
            <CardDescription>{character?.title || "Novice Adventurer"}</CardDescription>
            <div className="pt-2">
              <Badge variant="gold">Level {character?.current_level || 1}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs pt-4 border-t border-slate-800">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Lifetime XP</span>
              <span className="font-mono font-semibold text-slate-200">{character?.lifetime_xp ?? 0}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Gold Treasury</span>
              <span className="font-mono font-semibold text-amber-300">{character?.gold ?? 0} G</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Account Timezone</span>
              <span className="font-mono text-slate-300">{character?.timezone ?? "UTC"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Attribute Breakdown */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Attribute Specialization
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {attributes.map((attr) => {
              const Icon = attr.icon;
              return (
                <Card key={attr.name} className="bg-slate-900/70">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-slate-800/80 ${attr.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-slate-100 block">{attr.name}</span>
                        <span className="text-xs text-slate-500">{attr.desc}</span>
                      </div>
                    </div>
                    <span className="text-2xl font-bold font-mono text-slate-100">{attr.value}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
