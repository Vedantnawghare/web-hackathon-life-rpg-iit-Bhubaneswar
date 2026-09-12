"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ShopItem, ShopItemType, InventoryItem, PurchaseResponse } from "@/types/shop";
import { Character } from "@/types/character";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  // Character query for authoritative gold
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
      // Refresh gold in HUD and dashboard
      queryClient.invalidateQueries({ queryKey: ["character", "me"] });
      // Refresh inventory
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Store className="h-6 w-6 text-amber-400" /> Guild Bazaar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Exchange your hard-earned gold for cosmetic themes, avatar crests, titles, and relics.
          </p>
        </div>

        {/* Vault Balance Display */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/40 border border-amber-500/30 shadow-md self-start sm:self-auto">
          <Coins className="h-5 w-5 text-amber-400" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
              Your Treasury
            </span>
            <span className="text-base font-black font-mono text-amber-300">
              {formatGold(gold)} Gold
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {purchaseSuccess && (
        <div className="relative flex items-center justify-between p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 shadow-lg shadow-emerald-500/10 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-100 block">
                Relic Claimed: {purchaseSuccess.inventory_item.shop_item.name}
              </span>
              <span className="text-xs text-emerald-300/90 font-mono">
                Spent {purchaseSuccess.gold_spent} G • Remaining Treasury:{" "}
                {formatGold(purchaseSuccess.remaining_gold)} G
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPurchaseSuccess(null)}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-md"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
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

      {/* Category Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap",
                  isSelected
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="relative flex-1 sm:w-56">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search relics..."
            className="h-8 pl-8 text-xs bg-slate-900 border-slate-800 focus:border-amber-500 text-slate-200"
          />
        </div>
      </div>

      {/* Item Catalog Grid */}
      {isCatalogLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
          <Store className="h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No wares available in this category</h3>
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
            const Icon = itemIcons[item.item_type] || Shield;

            return (
              <Card
                key={item.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-200 flex flex-col justify-between",
                  isOwned
                    ? "bg-slate-900/40 border-slate-800/60"
                    : "bg-slate-900/80 border-slate-800 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5"
                )}
              >
                {/* Top Accent line */}
                <div
                  className={cn(
                    "h-1 w-full",
                    isOwned
                      ? "bg-emerald-500/40"
                      : canAfford
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                      : "bg-slate-800"
                  )}
                />

                <CardContent className="p-5 space-y-4">
                  {/* Category & Type Header */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold text-slate-400">
                      {item.item_type.replace("_", " ")}
                    </Badge>

                    {isOwned && (
                      <Badge
                        variant="outline"
                        className="bg-emerald-950/40 text-emerald-300 border-emerald-500/30 gap-1 text-[10px]"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Claimed
                      </Badge>
                    )}
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={cn(
                        "p-3 rounded-xl border flex items-center justify-center shrink-0",
                        isOwned
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h3 className="font-bold text-sm text-slate-100 leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Cost & Purchase Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300 text-sm">
                      <Coins className="h-4 w-4 text-amber-400" />
                      <span>{item.cost_gold} G</span>
                    </div>

                    <div>
                      {isOwned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="h-8 text-xs text-emerald-400 border-emerald-500/20 bg-emerald-950/20 cursor-default"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Owned
                        </Button>
                      ) : !canAfford ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="h-8 text-xs text-slate-500 border-slate-800 bg-slate-900/50 cursor-not-allowed"
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
                          className="h-8 text-xs font-bold gap-1.5 shadow-sm hover:shadow-amber-500/20"
                        >
                          {isPurchasing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Coins className="h-3.5 w-3.5" />
                              <span>Purchase</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
