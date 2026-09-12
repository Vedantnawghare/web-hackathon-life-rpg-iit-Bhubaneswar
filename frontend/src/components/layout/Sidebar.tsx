"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Character } from "@/types/character";
import {
  Compass,
  Scroll,
  Shield,
  Store,
  Backpack,
  Trophy,
  BookOpen,
  Sliders,
  Flame,
  Volume2,
  VolumeX,
  LogOut,
  Sparkles,
  Coins,
  Crown,
} from "lucide-react";
import { cn, formatGold } from "@/lib/utils";
import { useUiStore } from "@/hooks/use-ui-store";
import { useAuth } from "@/hooks/use-auth";

interface NavEntry {
  name: string;
  subtitle: string;
  href: string;
  icon: typeof Compass;
}

const expeditionItems: NavEntry[] = [
  { name: "World Map", subtitle: "Overland Realm", href: "/dashboard", icon: Compass },
  { name: "Bounty Board", subtitle: "Guild Contracts", href: "/quests", icon: Scroll },
  { name: "Hero Sanctum", subtitle: "Ascension & Build", href: "/character", icon: Shield },
];

const sanctuaryItems: NavEntry[] = [
  { name: "Guild Bazaar", subtitle: "Relics & Finery", href: "/shop", icon: Store },
  { name: "Relic Vault", subtitle: "Equipped Arsenal", href: "/inventory", icon: Backpack },
  { name: "Hall of Trophies", subtitle: "Heroic Feats", href: "/achievements", icon: Trophy },
  { name: "Chronicles", subtitle: "Expedition Logs", href: "/history", icon: BookOpen },
  { name: "Leyline Tuning", subtitle: "Game Preferences", href: "/settings", icon: Sliders },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAudioMuted, toggleAudioMute } = useUiStore();
  const { isAuthenticated, signOut } = useAuth();

  const { data: character } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const streakDays = Math.max(1, character?.current_streak || 1);
  const partyGold = character?.gold ?? 0;

  const renderItem = (item: NavEntry) => {
    const isActive =
      pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs transition-all duration-200 border cursor-pointer select-none",
          isActive
            ? "bg-gradient-to-r from-amber-950/80 via-amber-900/40 to-slate-950/90 text-amber-200 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.25)] font-bold translate-x-1"
            : "text-slate-300 hover:text-amber-100 border-slate-800/80 bg-slate-950/60 hover:bg-slate-900/80 hover:border-amber-900/50 hover:translate-x-0.5 shadow-sm"
        )}
      >
        {/* Active Gothic Gold Blade Trim */}
        {isActive && (
          <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 h-7 w-1.5 rounded-r bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.9)]" />
        )}

        {/* Beveled Stone Icon Box */}
        <div
          className={cn(
            "p-2 rounded-lg transition-all border shadow-md",
            isActive
              ? "bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950 border-amber-400 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-105"
              : "bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700/70 text-slate-400 group-hover:text-amber-300 group-hover:border-amber-600/40"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <span className="block font-cinzel tracking-wider text-xs truncate">
            {item.name}
          </span>
          <span className="block text-[10px] text-slate-400 group-hover:text-slate-300 font-rajdhani truncate">
            {item.subtitle}
          </span>
        </div>

        {/* Ornate corner indicator for active */}
        {isActive && (
          <Sparkles className="h-3 w-3 text-amber-400 opacity-80 shrink-0" />
        )}
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r-2 border-amber-900/50 bg-gradient-to-b from-[#10173d]/95 via-[#0e1538]/95 to-[#090e26]/95 border-r border-indigo-500/30 backdrop-blur-2xl relative z-30 shadow-[6px_0_30px_rgba(0,0,0,0.85)]">
      {/* 1. GOTHIC STONE COMMAND PANEL HEADER (Ref Image 1: "Day X" & Gold Filigree) */}
      <div className="relative p-4 border-b border-amber-900/40 bg-gradient-to-b from-[#141d4a]/90 to-[#0e163d]/90">
        {/* Ornate Gold Crown Filigree Border */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 via-amber-700 to-amber-950 border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Crown className="h-5 w-5 text-yellow-200" />
            </div>
            <div>
              <span className="font-black text-xs tracking-wider text-amber-100 uppercase font-cinzel block leading-tight">
                Life RPG
              </span>
              <span className="text-[9px] tracking-widest text-amber-400/90 uppercase font-rajdhani font-bold block">
                Aethelgard Realm
              </span>
            </div>
          </div>

          {/* Gothic "Day X" Badge (Reference Image 1) */}
          <div className="px-2.5 py-1 rounded-md bg-gradient-to-b from-amber-950 via-slate-950 to-black border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.25)] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/50 animate-pulse" />
            <span className="text-xs font-black font-cinzel text-amber-300 tracking-wider">
              DAY {streakDays}
            </span>
          </div>
        </div>

        {/* Party Gold Banner (Reference Image 1: "Party Gold: XXXX") */}
        <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-black/60 border border-amber-900/50 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] font-black font-cinzel text-amber-400/90 uppercase tracking-wider">
              Party Gold:
            </span>
          </div>
          <span className="text-xs font-black font-rajdhani text-yellow-300 tracking-wide">
            {formatGold(partyGold)} G
          </span>
        </div>
      </div>

      {/* 2. GOTHIC STONE COMMAND BUTTONS LIST */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* Section 1: Expeditions */}
        <div className="space-y-1.5">
          <div className="px-3 pb-1 text-[10px] uppercase font-cinzel tracking-widest text-amber-400/70 font-bold flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Realm Expeditions</span>
          </div>
          <div className="space-y-1.5">{expeditionItems.map(renderItem)}</div>
        </div>

        {/* Section 2: Sanctuary & Lore */}
        <div className="space-y-1.5 pt-2 border-t border-amber-900/30">
          <div className="px-3 pb-1 text-[10px] uppercase font-cinzel tracking-widest text-amber-400/70 font-bold flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Sanctuary & Lore</span>
          </div>
          <div className="space-y-1.5">{sanctuaryItems.map(renderItem)}</div>
        </div>
      </div>

      {/* 3. GOTHIC CONTROLS FOOTER */}
      <div className="p-3 border-t border-amber-900/40 bg-slate-950/95 flex items-center justify-between">
        <button
          onClick={toggleAudioMute}
          title={isAudioMuted ? "Unmute Tactical SFX" : "Mute Tactical SFX"}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer border border-slate-800/60 hover:border-amber-900/40"
        >
          {isAudioMuted ? (
            <>
              <VolumeX className="h-4 w-4 text-rose-400" />
              <span className="text-[10px] font-rajdhani font-bold">Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-rajdhani font-bold">SFX On</span>
            </>
          )}
        </button>

        <button
          onClick={handleSignOut}
          title="Leave the Realm"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer border border-slate-800/60 hover:border-rose-900/40"
          aria-label="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="text-[10px] font-rajdhani font-bold">Exit</span>
        </button>
      </div>

      {/* Subtle Team Branding */}
      <div className="px-3 py-1.5 text-center border-t border-amber-950/40 bg-slate-950">
        <span className="text-[9px] font-mono text-slate-500 tracking-wider">
          © 2026 SparkX · Life RPG
        </span>
      </div>
    </aside>
  );
}
