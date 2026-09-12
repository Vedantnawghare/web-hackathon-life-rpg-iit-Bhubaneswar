from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_character
from app.models.character import Character
from app.schemas.achievement import AchievementOut
from app.services import achievement_service

router = APIRouter()


@router.get("", response_model=List[AchievementOut], summary="List all achievements with unlock status and progress")
async def list_achievements(
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Evaluates pending achievements, then returns full catalog of achievements
    annotated with unlock status and current numerical progress for the character.
    """
    return await achievement_service.get_achievements_with_progress(
        db=db,
        character=current_character,
    )
