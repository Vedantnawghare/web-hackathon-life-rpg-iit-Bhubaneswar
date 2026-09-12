"use client";

import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { HUDTopBar } from "@/components/layout/HUDTopBar";
import { apiClient } from "@/lib/api-client";
import { Character } from "@/types/character";
import { useAuth } from "@/hooks/use-auth";
import { useUiStore } from "@/hooks/use-ui-store";
import { X } from "lucide-react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export function DashboardShell({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { isMobileSidebarOpen, setMobileSidebarOpen } = useUiStore();
  const pathname = usePathname();

  // Authoritative character profile fetched via TanStack Query
  const { data: character } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
    enabled: isAuthenticated,
  });

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 md:hidden flex backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="w-64 bg-slate-950 border-r border-slate-800 h-full p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-bold text-amber-400">Life RPG</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 py-4">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      isActive
                        ? "bg-amber-500/10 text-amber-300"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <HUDTopBar
          level={character?.current_level}
          xpIntoLevel={character?.xp_into_current_level}
          xpRequired={character?.xp_required_for_next_level}
          gold={character?.gold}
          streak={character?.current_streak}
          username={character?.username}
          title={character?.title}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/50">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
