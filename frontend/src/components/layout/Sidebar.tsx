"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/hooks/use-ui-store";
import { useAuth } from "@/hooks/use-auth";

interface NavEntry {
  name: string;
  subtitle: string;
  href: string;
  icon: typeof Compass;
}

const expeditionItems: NavEntry[] = [
  { name: "World Map", subtitle: "Realm Command Hub", href: "/dashboard", icon: Compass },
  { name: "Bounty Board", subtitle: "Guild Quests", href: "/quests", icon: Scroll },
  { name: "Hero Sanctum", subtitle: "Character & Mastery", href: "/character", icon: Shield },
];

const sanctuaryItems: NavEntry[] = [
  { name: "Guild Bazaar", subtitle: "Cosmetic Artifacts", href: "/shop", icon: Store },
  { name: "Relic Vault", subtitle: "Equipped Inventory", href: "/inventory", icon: Backpack },
  { name: "Hall of Trophies", subtitle: "Realm Milestones", href: "/achievements", icon: Trophy },
  { name: "Chronicles", subtitle: "Adventure Logbook", href: "/history", icon: BookOpen },
  { name: "Leyline Tuning", subtitle: "Client Settings", href: "/settings", icon: Sliders },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAudioMuted, toggleAudioMute } = useUiStore();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const renderItem = (item: NavEntry) => {
    const isActive =
      pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all duration-200 border",
          isActive
            ? "bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent text-amber-200 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.12)] font-semibold"
            : "text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/70 hover:border-slate-800"
        )}
      >
        {/* Active Rune Marker */}
        {isActive && (
          <div className="absolute -left-[13px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        )}

        <div
          className={cn(
            "p-1.5 rounded-md transition-colors",
            isActive
              ? "bg-amber-500/20 text-amber-300"
              : "bg-slate-900 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-800"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <span className="block font-display tracking-wide truncate">{item.name}</span>
          <span className="block text-[10px] text-slate-500 group-hover:text-slate-400 truncate">
            {item.subtitle}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-amber-500/20 bg-slate-950/90 backdrop-blur-xl relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.6)]">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-amber-500/20 gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-950/80 to-slate-950 border border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
          <Flame className="h-5 w-5 fill-amber-400/30 animate-pulse" />
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300" />
        </div>
        <div>
          <span className="font-bold text-base tracking-wider text-slate-100 uppercase font-display block leading-tight">
            Life RPG
          </span>
          <span className="block text-[10px] tracking-widest text-amber-400/90 uppercase font-mono font-semibold">
            Adventure World
          </span>
        </div>
      </div>

      {/* Nav Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* Section 1: Expeditions */}
        <div className="space-y-1.5">
          <div className="px-3 pb-1 text-[10px] uppercase font-mono tracking-widest text-amber-400/60 font-bold flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-amber-400" />
            <span>Expeditions</span>
          </div>
          <div className="space-y-1">{expeditionItems.map(renderItem)}</div>
        </div>

        {/* Section 2: Sanctuary & Lore */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="px-3 pb-1 text-[10px] uppercase font-mono tracking-widest text-amber-400/60 font-bold flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-amber-400" />
            <span>Sanctuary & Lore</span>
          </div>
          <div className="space-y-1">{sanctuaryItems.map(renderItem)}</div>
        </div>
      </div>

      {/* Grimoire Footer Controls */}
      <div className="p-3 border-t border-amber-500/20 bg-slate-950/95 flex items-center justify-between">
        <button
          onClick={toggleAudioMute}
          title={isAudioMuted ? "Unmute Tactical SFX" : "Mute Tactical SFX"}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-md hover:bg-slate-900 cursor-pointer border border-transparent hover:border-slate-800"
        >
          {isAudioMuted ? (
            <>
              <VolumeX className="h-4 w-4 text-rose-400" />
              <span className="text-[11px] font-mono">Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4 text-emerald-400" />
              <span className="text-[11px] font-mono">SFX Active</span>
            </>
          )}
        </button>

        <button
          onClick={handleSignOut}
          title="Leave the Realm"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-md hover:bg-slate-900 cursor-pointer border border-transparent hover:border-rose-500/30"
          aria-label="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="text-[11px] font-mono">Exit</span>
        </button>
      </div>
    </aside>
  );
}
