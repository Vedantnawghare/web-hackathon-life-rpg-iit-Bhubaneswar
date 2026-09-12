from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_character
from app.models.character import Character
from app.models.inventory_item import InventoryItem
from app.schemas.shop import InventoryItemOut

router = APIRouter()


@router.get("", response_model=List[InventoryItemOut], summary="List character inventory")
async def list_inventory(
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns inventory items owned by the authenticated character.
    """
    stmt = (
        select(InventoryItem)
        .where(InventoryItem.character_id == current_character.id)
        .options(selectinload(InventoryItem.shop_item))
    )
    result = await db.execute(stmt)
    return result.scalars().all()
