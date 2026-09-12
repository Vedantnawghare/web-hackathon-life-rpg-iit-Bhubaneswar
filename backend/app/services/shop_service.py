import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.character import Character
from app.models.shop_item import ShopItem
from app.models.inventory_item import InventoryItem
from app.schemas.shop import PurchaseResponse, InventoryItemOut
from app.core.exceptions import (
    EntityNotFoundException,
    BadRequestException,
    ConflictException,
)


async def purchase_item(
    db: AsyncSession,
    character_id: uuid.UUID,
    shop_item_id: uuid.UUID,
) -> PurchaseResponse:
    """
    Authoritative, transaction-safe Shop Item Purchase.
    - Pessimistically locks the character row to prevent double-spending race conditions.
    - Checks item availability and authoritative server price.
    - Prevents negative gold balance.
    - Enforces uniqueness to prevent duplicate ownership of non-stackable cosmetics.
    - Atomically updates gold and provisions inventory item.
    """
    # 1. Pessimistic row lock on Character
    char_stmt = (
        select(Character)
        .where(Character.id == character_id)
        .with_for_update()
    )
    char_result = await db.execute(char_stmt)
    character = char_result.scalar_one_or_none()
    if not character:
        raise EntityNotFoundException("Character not found.", code="CHARACTER_NOT_FOUND")

    # 2. Fetch ShopItem
    item_stmt = select(ShopItem).where(ShopItem.id == shop_item_id)
    item_result = await db.execute(item_stmt)
    shop_item = item_result.scalar_one_or_none()
    if not shop_item:
        raise EntityNotFoundException("Shop item not found.", code="ITEM_NOT_FOUND")

    # 3. Check active status
    if not shop_item.is_active:
        raise BadRequestException(
            detail="This relic is currently not available for purchase.",
            code="ITEM_NOT_ACTIVE",
        )

    # 4. Check duplicate ownership
    inv_stmt = select(InventoryItem).where(
        InventoryItem.character_id == character.id,
        InventoryItem.shop_item_id == shop_item.id,
    )
    inv_result = await db.execute(inv_stmt)
    if inv_result.scalar_one_or_none():
        raise ConflictException(
            detail=f"You already possess the item '{shop_item.name}'.",
            code="ITEM_ALREADY_OWNED",
        )

    # 5. Check authoritative gold balance
    if character.gold < shop_item.cost_gold:
        raise BadRequestException(
            detail=(
                f"Insufficient gold to purchase '{shop_item.name}'. "
                f"Cost: {shop_item.cost_gold} Gold, Current Balance: {character.gold} Gold."
            ),
            code="INSUFFICIENT_GOLD",
        )

    # 6. Deduct gold and grant item
    previous_gold = character.gold
    gold_spent = shop_item.cost_gold
    character.gold -= gold_spent

    inventory_item = InventoryItem(
        character_id=character.id,
        shop_item_id=shop_item.id,
        is_equipped=False,
        acquired_at=datetime.utcnow(),
    )
    db.add(inventory_item)

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        err_str = str(e).lower()
        if "unique" in err_str or "uq_character_shop_item" in err_str:
            raise ConflictException(
                detail=f"You already possess the item '{shop_item.name}'.",
                code="ITEM_ALREADY_OWNED",
            )
        raise

    await db.refresh(character)

    # 7. Reload inventory item with shop_item relationship loaded
    reload_stmt = (
        select(InventoryItem)
        .where(InventoryItem.id == inventory_item.id)
        .options(selectinload(InventoryItem.shop_item))
    )
    reloaded_inv = (await db.execute(reload_stmt)).scalar_one()

    return PurchaseResponse(
        inventory_item=InventoryItemOut.model_validate(reloaded_inv),
        previous_gold=previous_gold,
        gold_spent=gold_spent,
        remaining_gold=character.gold,
        newly_owned=True,
        already_owned=False,
        detail=f"Successfully acquired '{shop_item.name}' for {gold_spent} Gold.",
    )
