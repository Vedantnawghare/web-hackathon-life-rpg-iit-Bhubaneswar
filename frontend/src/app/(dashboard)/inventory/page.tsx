"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { InventoryItem } from "@/types/shop";
import { Backpack } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function InventoryPage() {
  const { data: inventory, isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["inventory"],
    queryFn: () => apiClient<InventoryItem[]>("/inventory"),
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <Backpack className="h-6 w-6 text-amber-400" /> Adventurer Inventory
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your acquired cosmetics, avatar frames, themes, and badges.
        </p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Checking adventurer satchel...</div>
      ) : inventory && inventory.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {inventory.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{item.shop_item.item_type}</Badge>
                  {item.is_equipped && <Badge variant="emerald">Equipped</Badge>}
                </div>
                <CardTitle className="text-base">{item.shop_item.name}</CardTitle>
                <CardDescription className="text-xs">{item.shop_item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant={item.is_equipped ? "secondary" : "outline"} size="sm" className="w-full">
                  {item.is_equipped ? "Unequip" : "Equip"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Backpack className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-300 font-medium">Your inventory is currently empty</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Complete quests to earn gold, then visit the Guild Shop to unlock customized cosmetics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
