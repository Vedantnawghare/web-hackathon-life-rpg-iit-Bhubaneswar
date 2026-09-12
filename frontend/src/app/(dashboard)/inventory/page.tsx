"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { InventoryItem, ShopItemType } from "@/types/shop";
import { Character } from "@/types/character";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CosmeticFrame } from "@/components/rpg/CosmeticFrame";
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

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
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

  // Filtered inventory items
  const filteredItems = items.filter((inv) => {
    if (selectedCategory === "ALL") return true;
    return inv.shop_item.item_type === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <section className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/20 p-5 sm:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(56,189,248,0.06),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Backpack className="h-6 w-6 text-amber-400" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
                Relic Vault & Armory
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Inspect, equip, and attune the rare cosmetic treasures and titles conquered on your journey.
            </p>
          </div>

          <Link href="/shop">
            <Button
              variant="gold"
              size="sm"
              className="gap-2 font-display font-bold tracking-wide shadow-[0_0_15px_rgba(245,158,11,0.2)] self-start sm:self-auto shrink-0"
            >
              <Store className="h-4 w-4" /> Acquire More Relics
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. Active Loadout Showcase */}
      <section className="p-5 sm:p-6 rounded-2xl border border-amber-500/25 bg-slate-950/80 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-display">
            Active Champion Loadout
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Slot 1: Avatar Frame */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
            <div className="shrink-0">
              <CosmeticFrame
                size="sm"
                username={character?.username || "Adventurer"}
                frameKey={character?.equipped_frame || "default_frame"}
                badgeKey={character?.equipped_badge || "default_badge"}
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block font-bold">
                Frame
              </span>
              <span className="text-xs font-bold text-slate-200 font-display truncate block">
                {character?.equipped_frame || "Standard Frame"}
              </span>
            </div>
          </div>

          {/* Slot 2: Badge */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block font-bold">
                Crest Badge
              </span>
              <span className="text-xs font-bold text-slate-200 font-display truncate block">
                {character?.equipped_badge || "Default Badge"}
              </span>
            </div>
          </div>

          {/* Slot 3: Title */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
            <div className="p-2 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300">
              <Crown className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block font-bold">
                Title
              </span>
              <span className="text-xs font-bold text-slate-200 font-display truncate block">
                {character?.title || "Novice Adventurer"}
              </span>
            </div>
          </div>

          {/* Slot 4: Leyline Theme */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
            <div className="p-2 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300">
              <Palette className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block font-bold">
                Leyline Theme
              </span>
              <span className="text-xs font-bold text-slate-200 font-display truncate block">
                {character?.equipped_theme || "Standard Slate"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Error Alert */}
      {errorMessage && (
        <div role="alert" className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 text-slate-400 hover:text-slate-100"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer",
                isSelected
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 4. Vault Relics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/60">
          <Backpack className="h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-200 font-display">
            {items.length === 0 ? "Your Relic Vault is Empty" : "No Relics in this Compartment"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {items.length === 0
              ? "Visit the Guild Bazaar to acquire cosmetic avatar frames, themes, and badges with gold earned from completed bounties."
              : "Acquire relics of this type from the Guild Bazaar to customize your champion."}
          </p>
          {items.length === 0 && (
            <Link href="/shop" className="mt-5">
              <Button variant="gold" size="sm" className="gap-2 font-display font-bold">
                <Store className="h-4 w-4" /> Browse Guild Bazaar
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((inv) => {
            const item = inv.shop_item;
            const isEquipped = inv.is_equipped;
            const isProcessing = actionItemId === inv.id;
            const Icon = itemIcons[item.item_type] || Shield;

            return (
              <div
                key={inv.id}
                className={cn(
                  "relative rounded-xl border transition-all duration-300 overflow-hidden flex flex-col justify-between backdrop-blur-md",
                  isEquipped
                    ? "bg-slate-900/95 border-amber-400/70 shadow-[0_0_25px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/40"
                    : "bg-slate-900/75 border-slate-800 hover:border-slate-700 hover:shadow-md"
                )}
              >
                {/* Top Accent Ribbon */}
                <div
                  className={cn(
                    "h-1.5 w-full",
                    isEquipped
                      ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"
                      : "bg-slate-800"
                  )}
                />

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Category & Equipped Wax Seal */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono font-semibold text-slate-400">
                        {item.item_type.replace("_", " ")}
                      </Badge>

                      {isEquipped && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                          <CheckCircle2 className="h-3 w-3 text-amber-400" /> Equipped
                        </span>
                      )}
                    </div>

                    {/* Icon & Details */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={cn(
                          "p-3 rounded-xl border flex items-center justify-center shrink-0",
                          isEquipped
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                            : "bg-slate-800 border-slate-700 text-slate-300"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <h3 className="font-bold text-base text-slate-100 font-display leading-snug">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] font-mono text-slate-500">
                      Acquired {new Date(inv.acquired_at).toLocaleDateString()}
                    </span>

                    <div>
                      {isEquipped ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => unequipMutation.mutate(inv.id)}
                          className="h-8 text-xs text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800 font-mono"
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
                          className="h-8 text-xs font-display font-bold uppercase tracking-wider gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
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
  );
}
