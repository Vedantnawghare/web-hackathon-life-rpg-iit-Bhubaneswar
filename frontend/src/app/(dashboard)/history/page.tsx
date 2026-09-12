"use client";

import { History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <History className="h-6 w-6 text-amber-400" /> Completion Chronicles
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical log of every quest cleared, XP gained, and attribute honed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chronicles of Past Deeds</CardTitle>
          <CardDescription>
            Audit log records for completed one-off, daily, and weekly quests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-lg">
            <History className="h-10 w-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-300 font-medium">No chronicles recorded yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Complete quests in your quest log to generate permanent audit records in the chronicles.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
