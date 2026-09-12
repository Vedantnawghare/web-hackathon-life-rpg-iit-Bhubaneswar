"use client";

/* eslint-disable @next/next/no-img-element */
import { GAME_ASSETS } from "@/lib/game-assets";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { InventoryItem, ShopItemType } from "@/types/shop";
import { Character } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CosmeticFrame } from "@/components/rpg/CosmeticFrame";
import { HeroCharacter } from "@/components/rpg/HeroCharacter";
import { getHeroArchetype } from "@/lib/hero-data";
import { audioManager } from "@/lib/audio-manager";
import {
  Backpack,
  Store,
  CheckCircle2,
  Sparkles,
  Shield,
  Palette,
  Crown,
  Loader2,
  AlertCircle,
  X,
  Users,
  Search,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const CATEGORIES: { id: string; label: string; type?: ShopItemType }[] = [
  { id: "ALL", label: "All Relics" },
  { id: "THEME", label: "Themes", type: "THEME" },
  { id: "AVATAR_FRAME", label: "Avatar Frames", type: "AVATAR_FRAME" },
  { id: "BADGE", label: "Badges", type: "BADGE" },
  { id: "TITLE", label: "Titles", type: "TITLE" },
  { id: "COSMETIC", label: "Cosmetics", type: "COSMETIC" },
];

const itemIcons: Record<ShopItemType, typeof Shield> = {
  THEME: Palette,
  AVATAR_FRAME: Crown,
  BADGE: Sparkles,
  TITLE: Crown,
  COSMETIC: Shield,
};

const COSMETIC_NAMES: Record<string, string> = {
  default_frame: "Standard Frame",
  frame_bronze_laurel: "Bronze Laurel Frame",
  frame_obsidian_spikes: "Obsidian Spikes Frame",
  frame_celestial_gold: "Celestial Gold Frame",
  default_badge: "Novice Badge",
  novice_badge: "Novice Badge",
  badge_founder_sigil: "Founder Sigil",
  badge_phoenix_crest: "Phoenix Crest",
  badge_iron_shield: "Iron Shield",
  default_slate: "Standard Slate Theme",
  theme_abyssal_dark: "Abyssal Dark Theme",
  theme_sunfire_gold: "Sunfire Gold Theme",
  theme_emerald_forest: "Emerald Forest Theme",
  theme_arcane_violet: "Arcane Violet Theme",
};

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionItemId, setActionItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Character query for active loadout
  const { data: character } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
  });

  // Inventory query
  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["inventory"],
    queryFn: () => apiClient<InventoryItem[]>("/inventory"),
  });

  // Equip mutation
  const equipMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiClient<Character>(`/inventory/items/${itemId}/equip`, {
        method: "POST",
      }),
    onMutate: (itemId) => {
      setActionItemId(itemId);
      setErrorMessage(null);
    },
    onSuccess: () => {
      audioManager.playFanfare();
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["character", "me"] });
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to equip relic.");
      }
    },
    onSettled: () => {
      setActionItemId(null);
    },
  });

  // Unequip mutation
  const unequipMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiClient<Character>(`/inventory/items/${itemId}/unequip`, {
        method: "POST",
      }),
    onMutate: (itemId) => {
      setActionItemId(itemId);
      setErrorMessage(null);
    },
    onSuccess: () => {
      audioManager.playCoinSound();
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["character", "me"] });
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to unequip relic.");
      }
    },
    onSettled: () => {
      setActionItemId(null);
    },
  });

  // Helper to find inventory item by asset key or type
  const findEquippedItemByType = (type: ShopItemType) => {
    return items.find((i) => i.is_equipped && i.shop_item.item_type === type);
  };

  // Filtered inventory items with real-time Search
  const filteredItems = useMemo(() => {
    return items.filter((inv) => {
      // Category filter
      if (selectedCategory !== "ALL" && inv.shop_item.item_type !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = inv.shop_item.name.toLowerCase().includes(q);
        const matchDesc = inv.shop_item.description.toLowerCase().includes(q);
        const matchType = inv.shop_item.item_type.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchType) return false;
      }
      return true;
    });
  }, [items, selectedCategory, searchQuery]);

  const equippedFrameItem = findEquippedItemByType("AVATAR_FRAME");
  const equippedBadgeItem = findEquippedItemByType("BADGE");
  const equippedTitleItem = findEquippedItemByType("TITLE");
  const equippedThemeItem = findEquippedItemByType("THEME");

  return (
    <>
      {/* Fixed Relic Vault Environment Backdrop: Preserves full artwork composition across viewports */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img
          src={GAME_ASSETS.backgrounds.inventory}
          alt="Relic Vault & Armory"
          className="w-full h-full object-cover object-center brightness-[1.04] contrast-[1.05] saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e]/75 via-[#0c1435]/45 to-[#070b1e]/85" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* 1. Header Banner */}
        <section className="relative rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-slate-950/90 via-slate-900/85 to-amber-950/40 p-5 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(245,158,11,0.12),transparent_65%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Backpack className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 font-cinzel">
                  Relic Vault & Armory
                </h1>
                <p className="text-xs text-slate-300 mt-0.5 font-rajdhani">
                  Equip and attune your cosmetic avatar frames, mystical crest badges, and legendary titles.
                </p>
              </div>
            </div>
          </div>

          <Link href="/shop">
            <Button
              variant="gold"
              size="sm"
              className="gap-2 font-cinzel font-black tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] self-start sm:self-auto shrink-0 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:from-amber-400 hover:to-yellow-300"
            >
              <Store className="h-4 w-4" /> Acquire More Relics
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. Colorful Active Loadout Showcase */}
      <section className="p-5 sm:p-6 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-black backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-100 font-cinzel">
              Active Champion Loadout
            </h2>
          </div>
          <Link href="/character">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-cinzel border-amber-500/40 bg-slate-900/80 text-amber-300 hover:bg-slate-800 shadow-sm">
              <Users className="h-3.5 w-3.5 text-amber-400" /> Switch Champion
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Slot 0: Champion Rig */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-slate-950 border-2 border-rose-500/40 flex items-center gap-3 shadow-md">
            <div className="shrink-0 h-16 w-14 flex items-center justify-center">
              <HeroCharacter
                heroId={character?.hero_class || "vanguard_male"}
                equippedTheme={character?.equipped_theme}
                state="IDLE"
                size="sm"
                showShadow={false}
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 block font-bold">
                Champion
              </span>
              <span className="text-xs font-black text-slate-100 font-cinzel truncate block">
                {getHeroArchetype(character?.hero_class).name}
              </span>
              <span className="text-[10px] text-slate-400 font-rajdhani truncate block">
                {getHeroArchetype(character?.hero_class).weapon}
              </span>
            </div>
          </div>

          {/* Slot 1: Avatar Frame */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-950 border-2 border-amber-500/40 flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0">
                <CosmeticFrame
                  size="sm"
                  username={character?.username || "Adventurer"}
                  frameKey={character?.equipped_frame || "default_frame"}
                  badgeKey={character?.equipped_badge || "default_badge"}
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 block font-bold">
                  Avatar Frame
                </span>
                <span className="text-xs font-black text-amber-100 font-cinzel truncate block">
                  {COSMETIC_NAMES[character?.equipped_frame || "default_frame"] || "Standard Frame"}
                </span>
              </div>
            </div>
            {equippedFrameItem && (
              <Button
                variant="ghost"
                size="sm"
                disabled={actionItemId === equippedFrameItem.id}
                onClick={() => unequipMutation.mutate(equippedFrameItem.id)}
                className="h-7 px-2 text-[10px] font-mono text-amber-400 hover:text-rose-400 hover:bg-rose-950/40 shrink-0"
              >
                Unequip
              </Button>
            )}
          </div>

          {/* Slot 2: Badge */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-yellow-950/40 via-slate-900/90 to-slate-950 border-2 border-yellow-500/40 flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-lg bg-yellow-500/20 border border-yellow-400/50 text-yellow-300 shrink-0 shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-mono tracking-wider text-yellow-400 block font-bold">
                  Crest Badge
                </span>
                <span className="text-xs font-black text-yellow-100 font-cinzel truncate block">
                  {COSMETIC_NAMES[character?.equipped_badge || "default_badge"] || "Novice Badge"}
                </span>
              </div>
            </div>
            {equippedBadgeItem && (
              <Button
                variant="ghost"
                size="sm"
                disabled={actionItemId === equippedBadgeItem.id}
                onClick={() => unequipMutation.mutate(equippedBadgeItem.id)}
                className="h-7 px-2 text-[10px] font-mono text-yellow-400 hover:text-rose-400 hover:bg-rose-950/40 shrink-0"
              >
                Unequip
              </Button>
            )}
          </div>

          {/* Slot 3: Title */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-slate-950 border-2 border-purple-500/40 flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-lg bg-purple-500/20 border border-purple-400/50 text-purple-300 shrink-0 shadow-sm">
                <Crown className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 block font-bold">
                  Realm Title
                </span>
                <span className="text-xs font-black text-purple-100 font-cinzel truncate block">
                  {character?.title || "Novice Adventurer"}
                </span>
              </div>
            </div>
            {equippedTitleItem && (
              <Button
                variant="ghost"
                size="sm"
                disabled={actionItemId === equippedTitleItem.id}
                onClick={() => unequipMutation.mutate(equippedTitleItem.id)}
                className="h-7 px-2 text-[10px] font-mono text-purple-400 hover:text-rose-400 hover:bg-rose-950/40 shrink-0"
              >
                Unequip
              </Button>
            )}
          </div>

          {/* Slot 4: Leyline Theme */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-sky-950/40 via-slate-900/90 to-slate-950 border-2 border-sky-500/40 flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-lg bg-sky-500/20 border border-sky-400/50 text-sky-300 shrink-0 shadow-sm">
                <Palette className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 block font-bold">
                  Leyline Theme
                </span>
                <span className="text-xs font-black text-sky-100 font-cinzel truncate block">
                  {COSMETIC_NAMES[character?.equipped_theme || "default_slate"] || "Standard Slate"}
                </span>
              </div>
            </div>
            {equippedThemeItem && (
              <Button
                variant="ghost"
                size="sm"
                disabled={actionItemId === equippedThemeItem.id}
                onClick={() => unequipMutation.mutate(equippedThemeItem.id)}
                className="h-7 px-2 text-[10px] font-mono text-sky-400 hover:text-rose-400 hover:bg-rose-950/40 shrink-0"
              >
                Unequip
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Error Alert */}
      {errorMessage && (
        <div role="alert" className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/15 border-2 border-rose-500/50 text-rose-200 text-xs font-mono shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 text-rose-400 hover:text-white"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 3. Category Filter Tabs & REAL-TIME SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/90 border-2 border-amber-900/40 backdrop-blur-md">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-rajdhani">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer font-bold text-xs",
                  isSelected
                    ? "bg-gradient-to-r from-amber-500/30 to-amber-600/20 text-amber-300 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Real-time Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/70" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search armory relics..."
            aria-label="Search armory relics"
            className="h-9 pl-9 pr-8 text-xs bg-slate-900/90 border-amber-900/50 focus:border-amber-400 text-slate-100 font-rajdhani font-medium placeholder:text-slate-500 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Search results status indicator */}
      {searchQuery && (
        <div className="flex items-center justify-between text-xs text-amber-400/90 px-1 font-rajdhani font-semibold">
          <span>Found {filteredItems.length} matching relics for &ldquo;{searchQuery}&rdquo;</span>
          <button onClick={() => setSearchQuery("")} className="underline hover:text-white">
            Reset search
          </button>
        </div>
      )}

      {/* 4. Colorful Vault Relics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 text-center rounded-2xl border-2 border-dashed border-amber-900/40 bg-slate-950/70">
          <Backpack className="h-12 w-12 text-amber-500/40 mb-3" />
          <h3 className="text-base font-black text-slate-200 font-cinzel">
            {items.length === 0 ? "Your Relic Vault is Empty" : "No Matching Relics Found"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm font-rajdhani">
            {searchQuery
              ? `No relics matched your search query "${searchQuery}". Try a different keyword or reset filters.`
              : items.length === 0
              ? "Visit the Guild Bazaar to acquire cosmetic avatar frames, themes, and badges with gold earned from completed bounties."
              : "Acquire relics of this type from the Guild Bazaar to customize your champion."}
          </p>
          {items.length === 0 ? (
            <Link href="/shop" className="mt-5">
              <Button variant="gold" size="sm" className="gap-2 font-cinzel font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950">
                <Store className="h-4 w-4" /> Browse Guild Bazaar
              </Button>
            </Link>
          ) : searchQuery ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="mt-4 font-rajdhani border-slate-700"
            >
              Clear Search Filter
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((inv) => {
            const item = inv.shop_item;
            const isEquipped = inv.is_equipped;
            const isProcessing = actionItemId === inv.id;
            const Icon = itemIcons[item.item_type] || Shield;

            // Determine vibrant jewel-toned palette by item type
            const typeGradients: Record<ShopItemType, { border: string; glow: string; ribbon: string; badgeColor: string }> = {
              AVATAR_FRAME: {
                border: "border-amber-500/50 hover:border-amber-400",
                glow: "shadow-[0_0_25px_rgba(245,158,11,0.25)]",
                ribbon: "from-amber-500 via-yellow-400 to-amber-600",
                badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
              },
              BADGE: {
                border: "border-yellow-500/50 hover:border-yellow-400",
                glow: "shadow-[0_0_25px_rgba(234,179,8,0.25)]",
                ribbon: "from-yellow-400 via-amber-300 to-yellow-500",
                badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
              },
              TITLE: {
                border: "border-purple-500/50 hover:border-purple-400",
                glow: "shadow-[0_0_25px_rgba(168,85,247,0.25)]",
                ribbon: "from-purple-500 via-fuchsia-400 to-purple-600",
                badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
              },
              THEME: {
                border: "border-sky-500/50 hover:border-sky-400",
                glow: "shadow-[0_0_25px_rgba(56,189,248,0.25)]",
                ribbon: "from-sky-500 via-cyan-400 to-blue-600",
                badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
              },
              COSMETIC: {
                border: "border-emerald-500/50 hover:border-emerald-400",
                glow: "shadow-[0_0_25px_rgba(16,185,129,0.25)]",
                ribbon: "from-emerald-500 via-teal-400 to-emerald-600",
                badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
              },
            };

            const style = typeGradients[item.item_type] || typeGradients.COSMETIC;

            return (
              <div
                key={inv.id}
                className={cn(
                  "relative rounded-2xl border-2 transition-all duration-300 overflow-hidden flex flex-col justify-between backdrop-blur-md bg-gradient-to-b from-slate-900/90 via-slate-950 to-black",
                  style.border,
                  isEquipped && "ring-2 ring-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.35)]"
                )}
              >
                {/* Top Colorful Jewel Accent Ribbon */}
                <div
                  className={cn(
                    "h-2 w-full bg-gradient-to-r",
                    style.ribbon
                  )}
                />

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Category & Equipped Wax Seal */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn("text-[10px] uppercase font-bold font-rajdhani px-2.5 py-0.5 rounded-full border", style.badgeColor)}>
                        {item.item_type.replace("_", " ")}
                      </span>

                      {isEquipped && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black font-cinzel uppercase tracking-wider text-yellow-300 bg-amber-500/25 border-2 border-amber-400/60 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse">
                          <CheckCircle2 className="h-3.5 w-3.5 text-yellow-300" /> Equipped
                        </span>
                      )}
                    </div>

                    {/* Icon & Details */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={cn(
                          "p-3.5 rounded-xl border-2 flex items-center justify-center shrink-0 shadow-md",
                          isEquipped
                            ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                            : "bg-slate-800/90 border-slate-700 text-slate-300"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <h3 className="font-black text-base text-slate-100 font-cinzel leading-snug">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-300 font-rajdhani line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-amber-900/30">
                    <span className="text-[11px] font-mono text-slate-400">
                      Acquired {new Date(inv.acquired_at).toLocaleDateString()}
                    </span>

                    <div>
                      {isEquipped ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => unequipMutation.mutate(inv.id)}
                          className="h-8 text-xs text-rose-300 hover:text-white border-rose-600/50 hover:bg-rose-950/60 font-cinzel font-bold shadow-sm"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Unequip"
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="gold"
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => equipMutation.mutate(inv.id)}
                          className="h-8 text-xs font-cinzel font-black uppercase tracking-wider gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:from-amber-400 hover:to-yellow-300"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Equip Relic</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}
