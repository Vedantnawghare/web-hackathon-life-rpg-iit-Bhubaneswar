"use client";

import { ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { HUDTopBar } from "@/components/layout/HUDTopBar";
import { apiClient, ApiError } from "@/lib/api-client";
import { Character } from "@/types/character";
import { useAuth } from "@/hooks/use-auth";
import { useUiStore } from "@/hooks/use-ui-store";
import { X, Menu, Compass, Scroll, Shield, Store, Backpack, Trophy, BookOpen, Sliders, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "World Map", href: "/dashboard", icon: Compass },
  { name: "Bounty Board", href: "/quests", icon: Scroll },
  { name: "Hero Sanctum", href: "/character", icon: Shield },
  { name: "Guild Bazaar", href: "/shop", icon: Store },
  { name: "Relic Vault", href: "/inventory", icon: Backpack },
  { name: "Hall of Trophies", href: "/achievements", icon: Trophy },
  { name: "Chronicles", href: "/history", icon: BookOpen },
  { name: "Leyline Tuning", href: "/settings", icon: Sliders },
];

const themeGradients: Record<string, string> = {
  default_slate: "bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/50",
  theme_abyssal_dark: "bg-gradient-to-b from-black via-slate-950 to-purple-950/25",
  theme_sunfire_gold: "bg-gradient-to-b from-slate-950 via-amber-950/15 to-slate-900/60",
  theme_emerald_forest: "bg-gradient-to-b from-slate-950 via-emerald-950/15 to-slate-900/60",
  theme_arcane_violet: "bg-gradient-to-b from-slate-950 via-purple-950/25 to-slate-900/60",
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading, signOut } = useAuth();
  const { isMobileSidebarOpen, setMobileSidebarOpen } = useUiStore();
  const pathname = usePathname();
  const router = useRouter();

  // Escape key closes mobile navigation drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileSidebarOpen, setMobileSidebarOpen]);

  // Authoritative character profile fetched via TanStack Query
  const { data: character, error: charError } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
    enabled: isAuthenticated,
    retry: false,
  });

  // Redirect to onboarding if character does not exist yet
  useEffect(() => {
    if (charError instanceof ApiError && charError.code === "CHARACTER_NOT_FOUND") {
      router.push("/onboarding");
    }
  }, [charError, router]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const activeThemeBg =
    themeGradients[character?.equipped_theme || "default_slate"] ||
    themeGradients.default_slate;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 md:hidden flex backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
        >
          <div
            className="w-64 bg-slate-950 border-r border-amber-500/30 h-full p-4 flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-bold text-amber-400 font-display">Life RPG</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
                aria-label="Close Navigation Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 py-4 overflow-y-auto">
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
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={async () => {
                  setMobileSidebarOpen(false);
                  await signOut();
                  router.push("/login");
                }}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-rose-400 w-full transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Leave Realm</span>
              </button>
            </div>
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

        <main className={cn("flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 transition-colors duration-500", activeThemeBg)}>
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>

        {/* Mobile Bottom RPG Action Dock */}
        <nav
          aria-label="Realm Quick Dock"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-amber-500/25 backdrop-blur-xl px-2 py-1 flex items-center justify-around shadow-[0_-4px_25px_rgba(0,0,0,0.8)]"
        >
          <Link
            href="/character"
            className={cn(
              "flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 rounded-lg font-mono transition-colors",
              pathname === "/character"
                ? "text-amber-300 font-bold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Shield className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Hero</span>
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 rounded-lg font-mono transition-colors",
              pathname === "/dashboard"
                ? "text-amber-300 font-bold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Compass className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Map</span>
          </Link>
          <Link
            href="/quests"
            className={cn(
              "flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 rounded-lg font-mono transition-colors",
              pathname === "/quests"
                ? "text-amber-300 font-bold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Scroll className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Bounties</span>
          </Link>
          <Link
            href="/shop"
            className={cn(
              "flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 rounded-lg font-mono transition-colors",
              pathname === "/shop"
                ? "text-amber-300 font-bold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Store className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Bazaar</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 rounded-lg font-mono text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Open More Realm Navigation"
          >
            <Menu className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Menu</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
