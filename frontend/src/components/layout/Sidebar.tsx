"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sword,
  Shield,
  Store,
  Backpack,
  Trophy,
  History,
  Settings,
  Flame,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/hooks/use-ui-store";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Quest Board", href: "/quests", icon: Sword },
  { name: "Character", href: "/character", icon: Shield },
  { name: "Guild Shop", href: "/shop", icon: Store },
  { name: "Inventory", href: "/inventory", icon: Backpack },
  { name: "Achievements", href: "/achievements", icon: Trophy },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAudioMuted, toggleAudioMute } = useUiStore();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950/80 backdrop-blur-md">
      {/* Brand / Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-800/80 gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Flame className="h-5 w-5 fill-amber-400/20" />
        </div>
        <div>
          <span className="font-bold text-base tracking-wider text-slate-100 uppercase">
            Life RPG
          </span>
          <span className="block text-[10px] tracking-widest text-amber-400/80 uppercase font-semibold">
            Productivity Guild
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
        <button
          onClick={toggleAudioMute}
          title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-md hover:bg-slate-900 cursor-pointer"
        >
          {isAudioMuted ? (
            <>
              <VolumeX className="h-4 w-4 text-rose-400" />
              <span>Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4 text-emerald-400" />
              <span>SFX On</span>
            </>
          )}
        </button>

        <span className="text-[11px] text-slate-600 font-mono">v1.0.0</span>
      </div>
    </aside>
  );
}
