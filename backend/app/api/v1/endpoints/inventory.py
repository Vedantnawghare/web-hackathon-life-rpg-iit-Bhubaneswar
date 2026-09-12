import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_character
from app.models.character import Character
from app.schemas.shop import InventoryItemOut
from app.schemas.character import CharacterOut
from app.services import inventory_service

router = APIRouter()


@router.get("", response_model=List[InventoryItemOut], summary="List character inventory")
async def list_inventory(
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns inventory items owned by the authenticated character.
    """
    return await inventory_service.get_inventory(
        db=db,
        character_id=current_character.id,
    )


@router.post(
    "/items/{id}/equip",
    response_model=CharacterOut,
    status_code=status.HTTP_200_OK,
    summary="Equip an owned inventory item",
)
async def equip_inventory_item(
    id: uuid.UUID,
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Equips an owned inventory item into its corresponding cosmetic slot.
    Authoritatively checks ownership and rejects unowned items with 404/403.
    """
    return await inventory_service.equip_item(
        db=db,
        character_id=current_character.id,
        inventory_item_id=id,
    )


@router.post(
    "/items/{id}/unequip",
    response_model=CharacterOut,
    status_code=status.HTTP_200_OK,
    summary="Unequip an inventory item",
)
async def unequip_inventory_item(
    id: uuid.UUID,
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Unequips an inventory item and resets slot to default appearance.
    """
    return await inventory_service.unequip_item(
        db=db,
        character_id=current_character.id,
        inventory_item_id=id,
    )
