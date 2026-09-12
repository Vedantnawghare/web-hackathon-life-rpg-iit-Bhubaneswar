from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_character
from app.models.character import Character
from app.models.enums import QuestStatus
from app.schemas.quest import QuestOut, QuestCreate

router = APIRouter()


@router.get("", response_model=List[QuestOut], summary="List quests for current character")
async def list_quests(
    status: Optional[QuestStatus] = Query(QuestStatus.ACTIVE),
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns quests strictly scoped to current_character.id.
    """
    # Scoped query placeholder for Phase 1 router structure
    return []
