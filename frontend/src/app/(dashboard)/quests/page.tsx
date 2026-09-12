"use client";

import { Sword, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Sword className="h-6 w-6 text-amber-400" /> Quest Board
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Undertake real-world challenges to earn authoritative XP and Gold.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button variant="gold" size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Post New Quest
          </Button>
        </div>
      </div>

      {/* Quest Categories Placeholder for Phase 2 Mechanics */}
      <Card>
        <CardHeader>
          <CardTitle>Active Quest Ledger</CardTitle>
          <CardDescription>
            Quests will be displayed here with difficulty tiers (Easy, Medium, Hard, Epic) and recurrence cycles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-lg">
            <Sword className="h-10 w-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-300 font-medium">Quest board is currently quiet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Phase 1 foundation is established. Full interactive quest creation, clearing, and reward mechanics arrive in Phase 2.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
