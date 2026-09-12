import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.enums import ShopItemType


class ShopItemOut(BaseModel):
    id: uuid.UUID
    code: str
    name: str
    description: str
    item_type: ShopItemType
    cost_gold: int
    asset_key: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InventoryItemOut(BaseModel):
    id: uuid.UUID
    character_id: uuid.UUID
    shop_item_id: uuid.UUID
    is_equipped: bool
    acquired_at: datetime
    shop_item: ShopItemOut

    model_config = ConfigDict(from_attributes=True)


class PurchaseResponse(BaseModel):
    inventory_item: InventoryItemOut
    previous_gold: int
    gold_spent: int
    remaining_gold: int
    newly_owned: bool = True
    already_owned: bool = False
    detail: str = "Item purchased successfully."
