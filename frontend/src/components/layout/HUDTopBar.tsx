"use client";

import { Coins, Flame, Menu, LogOut } from "lucide-react";
import { formatGold, formatXP } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useUiStore } from "@/hooks/use-ui-store";

interface HUDTopBarProps {
  level?: number;
  xpIntoLevel?: number;
  xpRequired?: number;
  gold?: number;
  streak?: number;
  username?: string;
  title?: string;
}

export function HUDTopBar({
  level = 1,
  xpIntoLevel = 0,
  xpRequired = 100,
  gold = 0,
  streak = 0,
  username = "Adventurer",
  title = "Novice",
}: HUDTopBarProps) {
  const { signOut } = useAuth();
  const { setMobileSidebarOpen } = useUiStore();

  const xpPercentage = Math.min(100, Math.max(0, Math.round((xpIntoLevel / (xpRequired || 1)) * 100)));

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Mobile Menu Trigger */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-md"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-bold text-sm text-slate-200">Life RPG</span>
      </div>

      {/* Level Crest & XP Bar */}
      <div className="flex-1 max-w-md hidden sm:flex items-center gap-3">
        {/* Level Badge */}
        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-sm shadow-[0_0_10px_rgba(245,158,11,0.15)] flex-shrink-0">
          Lv.{level}
        </div>

        {/* XP Bar */}
        <div className="flex-1">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">
              Experience
            </span>
            <span className="text-amber-400/90 font-mono text-[11px]">
              {formatXP(xpIntoLevel)} / {formatXP(xpRequired)} XP ({xpPercentage}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${xpPercentage}%` }}
              role="progressbar"
              aria-valuenow={xpPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* Right HUD Metrics: Gold, Streak, Character & SignOut */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Gold Counter */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-950/30 border border-amber-500/20 text-amber-300 shadow-sm"
          title="Authoritative Gold Balance"
        >
          <Coins className="h-4 w-4 text-amber-400" />
          <span className="font-mono font-bold text-xs sm:text-sm">{formatGold(gold)}</span>
        </div>

        {/* Streak Flame */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-950/30 border border-orange-500/20 text-orange-300 shadow-sm"
          title="Active Daily Streak"
        >
          <Flame className="h-4 w-4 text-orange-400 fill-orange-400/30" />
          <span className="font-mono font-bold text-xs sm:text-sm">{streak}d</span>
        </div>

        {/* User / Sign Out */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="hidden lg:block text-right">
            <span className="block text-xs font-semibold text-slate-200 leading-tight">
              {username}
            </span>
            <span className="block text-[10px] text-slate-400 leading-tight">
              {title}
            </span>
          </div>

          <button
            onClick={signOut}
            title="Log out of current session"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-md transition-colors cursor-pointer"
            aria-label="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
