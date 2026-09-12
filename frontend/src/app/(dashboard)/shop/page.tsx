"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ShopItem } from "@/types/shop";
import { Store, Coins } from "lucide-react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatGold } from "@/lib/utils";

export default function ShopPage() {
  const { data: shopItems, isLoading } = useQuery<ShopItem[]>({
    queryKey: ["shop", "items"],
    queryFn: () => apiClient<ShopItem[]>("/shop/items"),
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <Store className="h-6 w-6 text-amber-400" /> Guild Shop
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Invest hard-earned quest gold into themes, avatar frames, titles, and prestige cosmetics.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
          <div className="h-48 bg-slate-900 rounded-lg border border-slate-800"></div>
          <div className="h-48 bg-slate-900 rounded-lg border border-slate-800"></div>
          <div className="h-48 bg-slate-900 rounded-lg border border-slate-800"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopItems?.map((item) => (
            <Card key={item.id} className="flex flex-col justify-between bg-slate-900/80">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {item.item_type.replace("_", " ")}
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-300 font-mono font-bold text-xs">
                    <Coins className="h-3.5 w-3.5 text-amber-400" />
                    <span>{formatGold(item.cost_gold)} G</span>
                  </div>
                </div>
                <CardTitle className="text-base mt-2">{item.name}</CardTitle>
                <CardDescription className="text-xs">{item.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button variant="gold" size="sm" className="w-full">
                  Acquire Item
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
