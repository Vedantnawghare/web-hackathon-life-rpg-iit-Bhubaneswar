"use client";

/* eslint-disable @next/next/no-img-element */
import { GAME_ASSETS } from "@/lib/game-assets";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ShopItem, ShopItemType, InventoryItem, PurchaseResponse } from "@/types/shop";
import { Character } from "@/types/character";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CosmeticFrame } from "@/components/rpg/CosmeticFrame";
import { HeroCharacter } from "@/components/rpg/HeroCharacter";
import {
  Store,
  Coins,
  Sparkles,
  Shield,
  Palette,
  Crown,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Lock,
  Eye,
} from "lucide-react";
import { cn, formatGold } from "@/lib/utils";

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

export default function ShopPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [purchasingItemId, setPurchasingItemId] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<PurchaseResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);

  // Character query for authoritative gold and equipped cosmetics
  const { data: character } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
  });

  // Shop catalog query
  const { data: items = [], isLoading: isCatalogLoading } = useQuery<ShopItem[]>({
    queryKey: ["shop", "items"],
    queryFn: () => apiClient<ShopItem[]>("/shop/items"),
  });

  // Inventory query to determine owned status
  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ["inventory"],
    queryFn: () => apiClient<InventoryItem[]>("/inventory"),
  });

  const ownedShopItemIds = new Set(inventory.map((inv) => inv.shop_item_id));

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiClient<PurchaseResponse>(`/shop/items/${itemId}/purchase`, {
        method: "POST",
      }),
    onMutate: (itemId) => {
      setPurchasingItemId(itemId);
      setErrorMessage(null);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["character", "me"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setPurchaseSuccess(data);
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to complete purchase. Please try again.");
      }
    },
    onSettled: () => {
      setPurchasingItemId(null);
    },
  });

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (selectedCategory !== "ALL" && item.item_type !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const match =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const gold = character?.gold ?? 0;

  // Active preview cosmetics
  const previewFrameKey =
    previewItem?.item_type === "AVATAR_FRAME"
      ? previewItem.asset_key
      : character?.equipped_frame || "default_frame";

  const previewBadgeKey =
    previewItem?.item_type === "BADGE"
      ? previewItem.asset_key
      : character?.equipped_badge || "default_badge";

  const previewThemeKey =
    previewItem?.item_type === "THEME"
      ? previewItem.asset_key
      : character?.equipped_theme || "default_dark";

  return (
    <div className="relative min-h-[calc(100vh-5rem)] rounded-3xl overflow-hidden border border-amber-500/40 p-4 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.85)]">
      {/* Real Fantasy Enchanted Night Bazaar Background */}
      <img
        src={GAME_ASSETS.backgrounds.shop}
        alt="Grand Realm Bazaar"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0 brightness-[1.02] contrast-[1.05] saturate-110 contrast-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1130]/60 via-[#0e163d]/20 to-[#0b1130]/35 pointer-events-none z-0" />

      <div className="relative z-10 space-y-6">
      {/* 1. Alchemist & Weaponsmith Counter Banner */}
      <section className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/20 p-5 sm:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6 text-amber-400" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
                Guild Bazaar & Curio Vault
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Exchange your earned guild gold for ceremonial frames, arcane leylines, and badges of honor.
            </p>
          </div>

          {/* Treasury Vault Counter */}
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] self-start sm:self-auto">
            <Coins className="h-6 w-6 text-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-amber-400/80 block">
                Vault Treasury
              </span>
              <span className="text-lg font-black font-mono text-amber-300">
                {formatGold(gold)} <span className="text-xs font-normal">Gold</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Avatar Fitting Room / Preview Stage if an item is inspected */}
      {previewItem && (
        <section className="relative p-4 sm:p-5 rounded-2xl border border-amber-500/50 bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2 text-xs font-display font-bold text-amber-300 uppercase tracking-wider">
              <Eye className="h-4 w-4 text-amber-400" />
              <span>Fitting Room Preview: &ldquo;{previewItem.name}&rdquo;</span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
              aria-label="Close Preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-4">
            <div className="flex items-center gap-4 shrink-0">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner">
                <CosmeticFrame
                  size="lg"
                  username={character?.username || "Adventurer"}
                  frameKey={previewFrameKey}
                  badgeKey={previewBadgeKey}
                />
              </div>
              <div className="hidden md:flex p-2 rounded-2xl bg-black/50 border border-slate-800">
                <HeroCharacter
                  heroId={character?.hero_class || "vanguard_male"}
                  equippedTheme={previewThemeKey}
                  state="READY"
                  size="sm"
                  showShadow={false}
                />
              </div>
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-sm font-bold text-slate-100 font-display">
                  {previewItem.name}
                </span>
                <Badge variant="outline" className="text-[10px] uppercase font-mono font-semibold">
                  {previewItem.item_type.replace("_", " ")}
                </Badge>
              </div>

              <p className="text-xs text-slate-400 max-w-md">
                {previewItem.description}
              </p>

              <div className="flex items-center gap-3 justify-center sm:justify-start pt-1">
                <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  {previewItem.cost_gold} Gold
                </span>

                {ownedShopItemIds.has(previewItem.id) ? (
                  <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Already Acquired
                  </span>
                ) : gold < previewItem.cost_gold ? (
                  <span className="text-xs font-mono font-semibold text-rose-400">
                    Requires {previewItem.cost_gold - gold} more Gold
                  </span>
                ) : (
                  <Button
                    variant="gold"
                    size="sm"
                    disabled={purchasingItemId === previewItem.id}
                    onClick={() => purchaseMutation.mutate(previewItem.id)}
                    className="h-8 text-xs font-bold gap-1.5"
                  >
                    {purchasingItemId === previewItem.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Coins className="h-3.5 w-3.5" />
                        <span>Unlock Now</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Purchase Success Notification Banner */}
      {purchaseSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="relative flex items-center justify-between p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 shadow-lg shadow-emerald-500/15 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-100 block font-display">
                Relic Claimed: {purchaseSuccess.inventory_item.shop_item.name}
              </span>
              <span className="text-xs text-emerald-300 font-mono">
                Spent {purchaseSuccess.gold_spent} G â€¢ Remaining Treasury:{" "}
                {formatGold(purchaseSuccess.remaining_gold)} G
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPurchaseSuccess(null)}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-md"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 text-slate-400 hover:text-slate-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 4. Category Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-mono text-xs transition-colors whitespace-nowrap cursor-pointer",
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

        <div className="relative flex-1 sm:w-64">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-500/70" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search relics..."
            aria-label="Search relics"
            className="h-8 pl-8 pr-7 text-xs bg-slate-900 border-slate-800 focus:border-amber-500 text-slate-200 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Item Catalog Grid on Velvet Pedestals */}
      {isCatalogLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/60">
          <Store className="h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-200 font-display">No Relics in this Chamber</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Check back later as new legendary themes and cosmetics are forged for the Guild Bazaar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isOwned = ownedShopItemIds.has(item.id);
            const canAfford = gold >= item.cost_gold;
            const isPurchasing = purchasingItemId === item.id;
            const isInspecting = previewItem?.id === item.id;
            const Icon = itemIcons[item.item_type] || Shield;

            return (
              <div
                key={item.id}
                className={cn(
                  "relative rounded-xl border transition-all duration-300 overflow-hidden flex flex-col justify-between backdrop-blur-md",
                  isOwned
                    ? "bg-slate-950/60 border-slate-800/80"
                    : isInspecting
                    ? "bg-slate-900/90 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-400"
                    : "bg-slate-900/80 border-slate-800 hover:border-amber-500/50 hover:shadow-[0_4px_25px_rgba(245,158,11,0.1)]"
                )}
              >
                {/* Velvet Pedestal Accent Line */}
                <div
                  className={cn(
                    "h-1.5 w-full",
                    isOwned
                      ? "bg-emerald-500/40"
                      : canAfford
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                      : "bg-slate-800"
                  )}
                />

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Category & Status Header */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono font-semibold text-slate-400">
                        {item.item_type.replace("_", " ")}
                      </Badge>

                      {isOwned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Acquired
                        </span>
                      )}
                    </div>

                    {/* Icon & Details */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={cn(
                          "p-3 rounded-xl border flex items-center justify-center shrink-0",
                          isOwned
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-inner"
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

                  {/* Actions & Cost */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300 text-sm">
                      <Coins className="h-4 w-4 text-amber-400" />
                      <span>{item.cost_gold} G</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Preview / Inspect Button */}
                      {(item.item_type === "AVATAR_FRAME" || item.item_type === "BADGE") && (
                        <button
                          type="button"
                          onClick={() => setPreviewItem(isInspecting ? null : item)}
                          className={cn(
                            "h-8 px-2.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer",
                            isInspecting
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800"
                          )}
                          title="Preview on avatar"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Inspect</span>
                        </button>
                      )}

                      {/* Buy / Owned Button */}
                      {isOwned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="h-8 text-xs text-emerald-400 border-emerald-500/20 bg-emerald-950/20 cursor-default font-mono"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Owned
                        </Button>
                      ) : !canAfford ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="h-8 text-xs text-slate-500 border-slate-800 bg-slate-900/50 cursor-not-allowed font-mono"
                          title="Insufficient Gold balance"
                        >
                          <Lock className="h-3 w-3 mr-1" /> Need Gold
                        </Button>
                      ) : (
                        <Button
                          variant="gold"
                          size="sm"
                          disabled={isPurchasing}
                          onClick={() => purchaseMutation.mutate(item.id)}
                          className="h-8 text-xs font-display font-bold uppercase tracking-wider gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                        >
                          {isPurchasing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Coins className="h-3.5 w-3.5" />
                              <span>Unlock</span>
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
    </div>
  );
}
