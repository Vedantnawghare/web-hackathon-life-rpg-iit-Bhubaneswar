from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_character
from app.models.character import Character
from app.models.shop_item import ShopItem
from app.schemas.shop import ShopItemOut

router = APIRouter()


@router.get("/items", response_model=List[ShopItemOut], summary="List available shop items")
async def list_shop_items(
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns active Guild Shop catalog items.
    """
    stmt = select(ShopItem).where(ShopItem.is_active == True)
    result = await db.execute(stmt)
    return result.scalars().all()
