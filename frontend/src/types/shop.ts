export type ShopItemType = "THEME" | "AVATAR_FRAME" | "BADGE" | "TITLE" | "COSMETIC";

export interface ShopItem {
  id: string;
  code: string;
  name: string;
  description: string;
  item_type: ShopItemType;
  cost_gold: number;
  asset_key: string;
  is_active: boolean;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  character_id: string;
  shop_item_id: string;
  is_equipped: boolean;
  acquired_at: string;
  shop_item: ShopItem;
}

export interface PurchaseResponse {
  inventory_item: InventoryItem;
  remaining_gold: number;
  detail: string;
}
