from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_character
from app.models.character import Character
from app.models.achievement import Achievement
from app.models.character_achievement import CharacterAchievement
from app.schemas.achievement import AchievementOut

router = APIRouter()


@router.get("", response_model=List[AchievementOut], summary="List all achievements with unlock status")
async def list_achievements(
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns full catalog of achievements annotated with unlock status for the character.
    """
    # 1. Fetch all achievements
    ach_stmt = select(Achievement).order_by(Achievement.created_at)
    ach_result = await db.execute(ach_stmt)
    achievements = ach_result.scalars().all()

    # 2. Fetch character unlocks
    unlock_stmt = select(CharacterAchievement).where(
        CharacterAchievement.character_id == current_character.id
    )
    unlock_result = await db.execute(unlock_stmt)
    unlocks = {u.achievement_id: u.unlocked_at for u in unlock_result.scalars().all()}

    output = []
    for ach in achievements:
        is_unlocked = ach.id in unlocks
        output.append(
            AchievementOut(
                id=ach.id,
                code=ach.code,
                title=ach.title,
                description=ach.description,
                category=ach.category,
                icon_name=ach.icon_name,
                condition_type=ach.condition_type,
                condition_threshold=ach.condition_threshold,
                reward_xp=ach.reward_xp,
                reward_gold=ach.reward_gold,
                reward_title=ach.reward_title,
                is_unlocked=is_unlocked,
                unlocked_at=unlocks.get(ach.id),
            )
        )
    return output
