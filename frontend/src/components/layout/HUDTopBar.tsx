"use client";

import { Coins, Flame, Menu, LogOut, Shield } from "lucide-react";
import { formatGold, formatXP } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useUiStore } from "@/hooks/use-ui-store";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const xpPercentage = Math.min(100, Math.max(0, Math.round((xpIntoLevel / (xpRequired || 1)) * 100)));

  return (
    <header className="h-16 border-b border-amber-500/20 bg-slate-950/90 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between gap-3 shadow-[0_4px_25px_rgba(0,0,0,0.7)] relative z-40">
      {/* Ambient Top Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent pointer-events-none" />

      {/* Left: Mobile Menu Trigger & Brand / Level */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-900 rounded-md cursor-pointer border border-transparent hover:border-slate-800 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Level Emblem */}
        <div className="flex items-center gap-2">
          <div
            className="relative flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 text-amber-300 font-bold text-sm shadow-[0_0_12px_rgba(245,158,11,0.2)] font-mono flex-shrink-0"
            title={`Rank Level ${level}`}
          >
            <Shield className="absolute inset-0 m-auto h-7 w-7 text-amber-500/20 pointer-events-none" />
            <span className="relative z-10 text-xs font-black">Lv.{level}</span>
          </div>

          <div className="hidden md:block">
            <span className="font-bold text-sm text-slate-100 font-display block leading-tight">
              {username}
            </span>
            <span className="text-[10px] text-amber-400/90 font-medium block uppercase tracking-wider">
              {title}
            </span>
          </div>
        </div>
      </div>

      {/* Center: XP Mana Gauge (Desktop & Tablet) */}
      <div className="flex-1 max-w-sm hidden sm:block mx-2">
        <div className="flex justify-between items-center text-[11px] mb-1">
          <span className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[10px]">
            Progression
          </span>
          <span className="text-amber-300 font-mono font-bold text-[11px]">
            {formatXP(xpIntoLevel)} / {formatXP(xpRequired)} XP ({xpPercentage}%)
          </span>
        </div>
        <div className="h-2 w-full bg-slate-900/90 rounded-full overflow-hidden border border-slate-800 p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            style={{ width: `${xpPercentage}%` }}
            role="progressbar"
            aria-label={`Level ${level} XP progress: ${xpPercentage}%`}
            aria-valuenow={xpPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Right: Gold Treasury, Daily Streak, Exit */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Mobile Mini XP Gauge */}
        <div className="sm:hidden flex flex-col items-end pr-1">
          <span className="font-mono text-[10px] text-amber-400 font-bold">{xpPercentage}%</span>
          <div className="h-1.5 w-12 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>

        {/* Gold Pouch */}
        <div
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-b from-amber-950/40 to-slate-950 border border-amber-500/30 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
          title="Authoritative Gold Treasury"
        >
          <Coins className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-amber-400 shrink-0" />
          <span className="font-mono font-bold text-xs sm:text-sm">{formatGold(gold)}</span>
        </div>

        {/* Streak Flame */}
        <div
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-b from-orange-950/40 to-slate-950 border border-orange-500/30 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.15)]"
          title="Active Daily Streak"
        >
          <Flame className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-orange-400 fill-orange-400/40 animate-pulse shrink-0" />
          <span className="font-mono font-bold text-xs sm:text-sm">{streak}d</span>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          title="Log out of current session"
          className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer border border-slate-800/80 hover:border-rose-500/30 shrink-0"
          aria-label="Log Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
