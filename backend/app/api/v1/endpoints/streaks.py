from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_character
from app.models.character import Character
from app.models.streak import Streak

router = APIRouter()


@router.get("/me", summary="Get character streak metrics")
async def get_streak(
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns streak data for the authenticated character.
    """
    stmt = select(Streak).where(Streak.character_id == current_character.id)
    result = await db.execute(stmt)
    streak = result.scalar_one_or_none()
    if not streak:
        return {"current_streak": 0, "longest_streak": 0, "last_activity_date": None}
    return {
        "current_streak": streak.current_streak,
        "longest_streak": streak.longest_streak,
        "last_activity_date": streak.last_activity_date,
        "freeze_count": streak.freeze_count,
    }
