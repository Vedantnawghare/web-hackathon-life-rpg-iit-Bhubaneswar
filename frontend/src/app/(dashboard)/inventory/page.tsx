"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { InventoryItem, ShopItemType } from "@/types/shop";
import { Character } from "@/types/character";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  { id: "ALL", label: "All Items" },
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
        setErrorMessage("Failed to equip item.");
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
        setErrorMessage("Failed to unequip item.");
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Backpack className="h-6 w-6 text-amber-400" /> Relic Vault & Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage, inspect, and equip cosmetic themes, avatar crests, and titles earned across your journey.
          </p>
        </div>

        <Link href="/shop">
          <Button variant="gold" size="sm" className="gap-2 font-semibold">
            <Store className="h-4 w-4" /> Visit Guild Shop
          </Button>
        </Link>
      </div>

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

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-xs">
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

      {/* Inventory Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
          <Backpack className="h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">
            {items.length === 0 ? "You haven't claimed any relics yet" : "No relics in this category"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {items.length === 0
              ? "Visit the Guild Bazaar to acquire cosmetic avatar frames, themes, and badges with gold earned from quests."
              : "Acquire relics of this type from the Guild Bazaar to customize your champion."}
          </p>
          {items.length === 0 && (
            <Link href="/shop" className="mt-4">
              <Button variant="gold" size="sm" className="gap-2 font-semibold">
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
              <Card
                key={inv.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-200 flex flex-col justify-between",
                  isEquipped
                    ? "bg-slate-900/90 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                )}
              >
                {/* Top Accent Ribbon */}
                <div
                  className={cn(
                    "h-1 w-full",
                    isEquipped
                      ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"
                      : "bg-slate-800"
                  )}
                />

                <CardContent className="p-5 space-y-4">
                  {/* Category & Equipped Status */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold text-slate-400">
                      {item.item_type.replace("_", " ")}
                    </Badge>

                    {isEquipped && (
                      <Badge
                        variant="gold"
                        className="gap-1 text-[10px] font-bold uppercase tracking-wider"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Equipped
                      </Badge>
                    )}
                  </div>

                  {/* Icon & Details */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={cn(
                        "p-3 rounded-xl border flex items-center justify-center shrink-0",
                        isEquipped
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          : "bg-slate-800 border-slate-700 text-slate-300"
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
                          className="h-8 text-xs text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800"
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
                          className="h-8 text-xs font-semibold gap-1.5 shadow-sm hover:shadow-amber-500/20"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Equip</span>
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
