import uuid
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.character import Character
from app.models.inventory_item import InventoryItem
from app.models.enums import ShopItemType
from app.core.exceptions import EntityNotFoundException


async def get_inventory(
    db: AsyncSession,
    character_id: uuid.UUID,
) -> List[InventoryItem]:
    """
    Returns all inventory items owned by the character, with shop item metadata loaded.
    """
    stmt = (
        select(InventoryItem)
        .where(InventoryItem.character_id == character_id)
        .options(selectinload(InventoryItem.shop_item))
        .order_by(InventoryItem.acquired_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def equip_item(
    db: AsyncSession,
    character_id: uuid.UUID,
    inventory_item_id: uuid.UUID,
) -> Character:
    """
    Equips an owned inventory item.
    - Strictly verifies that the inventory item is owned by the character.
    - Replaces any previously equipped item of the same item type.
    - Updates character's cosmetic slot authoritatively.
    """
    # 1. Fetch character
    char_stmt = select(Character).where(Character.id == character_id)
    character = (await db.execute(char_stmt)).scalar_one_or_none()
    if not character:
        raise EntityNotFoundException("Character not found.", code="CHARACTER_NOT_FOUND")

    # 2. Fetch inventory item with shop item metadata
    inv_stmt = (
        select(InventoryItem)
        .where(
            InventoryItem.id == inventory_item_id,
            InventoryItem.character_id == character_id,
        )
        .options(selectinload(InventoryItem.shop_item))
    )
    inv_item = (await db.execute(inv_stmt)).scalar_one_or_none()
    if not inv_item:
        raise EntityNotFoundException(
            detail="Item not found in your inventory or not owned.",
            code="ITEM_NOT_OWNED",
        )

    shop_item = inv_item.shop_item

    # 3. Unequip any existing equipped items of the same type for this character
    all_owned_stmt = (
        select(InventoryItem)
        .where(InventoryItem.character_id == character_id)
        .options(selectinload(InventoryItem.shop_item))
    )
    all_owned = (await db.execute(all_owned_stmt)).scalars().all()

    for item in all_owned:
        if item.shop_item.item_type == shop_item.item_type:
            item.is_equipped = False

    # 4. Equip the requested item
    inv_item.is_equipped = True

    # 5. Apply cosmetic asset to character slot
    if shop_item.item_type == ShopItemType.THEME:
        character.equipped_theme = shop_item.asset_key
    elif shop_item.item_type == ShopItemType.AVATAR_FRAME:
        character.equipped_frame = shop_item.asset_key
    elif shop_item.item_type == ShopItemType.BADGE:
        character.equipped_badge = shop_item.asset_key
    elif shop_item.item_type == ShopItemType.TITLE:
        character.title = shop_item.name

    await db.commit()
    await db.refresh(character)
    return character


async def unequip_item(
    db: AsyncSession,
    character_id: uuid.UUID,
    inventory_item_id: uuid.UUID,
) -> Character:
    """
    Unequips an inventory item and reverts the corresponding slot to its default cosmetic.
    """
    char_stmt = select(Character).where(Character.id == character_id)
    character = (await db.execute(char_stmt)).scalar_one_or_none()
    if not character:
        raise EntityNotFoundException("Character not found.", code="CHARACTER_NOT_FOUND")

    inv_stmt = (
        select(InventoryItem)
        .where(
            InventoryItem.id == inventory_item_id,
            InventoryItem.character_id == character_id,
        )
        .options(selectinload(InventoryItem.shop_item))
    )
    inv_item = (await db.execute(inv_stmt)).scalar_one_or_none()
    if not inv_item:
        raise EntityNotFoundException(
            detail="Item not found in your inventory.",
            code="ITEM_NOT_OWNED",
        )

    shop_item = inv_item.shop_item
    inv_item.is_equipped = False

    # Revert to defaults
    if shop_item.item_type == ShopItemType.THEME:
        character.equipped_theme = "default_slate"
    elif shop_item.item_type == ShopItemType.AVATAR_FRAME:
        character.equipped_frame = "default_frame"
    elif shop_item.item_type == ShopItemType.BADGE:
        character.equipped_badge = "novice_badge"
    elif shop_item.item_type == ShopItemType.TITLE:
        character.title = "Novice Adventurer"

    await db.commit()
    await db.refresh(character)
    return character
