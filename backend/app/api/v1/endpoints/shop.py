import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_character
from app.models.character import Character
from app.models.shop_item import ShopItem
from app.schemas.shop import ShopItemOut, PurchaseResponse
from app.services import shop_service

router = APIRouter()


@router.get("/items", response_model=List[ShopItemOut], summary="List available shop items")
async def list_shop_items(
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns active Guild Shop catalog items.
    """
    stmt = select(ShopItem).where(ShopItem.is_active == True).order_by(ShopItem.cost_gold.asc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/items/{id}/purchase",
    response_model=PurchaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Purchase a relic from the Guild Shop",
)
async def purchase_shop_item(
    id: uuid.UUID,
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Executes an ACID-compliant relic purchase.
    - Pessimistically locks character
    - Validates authoritative item price and active state
    - Prevents negative gold balance (400 Bad Request)
    - Prevents duplicate ownership (409 Conflict)
    - Deducts gold and provisions inventory item
    """
    return await shop_service.purchase_item(
        db=db,
        character_id=current_character.id,
        shop_item_id=id,
    )
