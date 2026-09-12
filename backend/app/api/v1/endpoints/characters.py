import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user_id, get_current_character
from app.core.exceptions import ConflictException
from app.models.character import Character
from app.models.streak import Streak
from app.models.quest_completion import QuestCompletion
from app.schemas.character import CharacterCreate, CharacterOut, CharacterEquip, DailyProgressOut
from app.services.streak_service import get_local_date_for_timezone

router = APIRouter()


@router.get("/me", response_model=CharacterOut, summary="Get active character HUD profile")
async def get_my_character(
    current_character: Character = Depends(get_current_character),
):
    """
    Returns the authoritative Character profile for the authenticated Supabase user.
    """
    return current_character


@router.get(
    "/me/daily-progress",
    response_model=DailyProgressOut,
    summary="Get authoritative daily XP progress and goal",
)
async def get_my_daily_progress(
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the authoritative Daily XP progress and goal for today in the user's timezone.
    Calculates sum of earned_xp from quest_completions for today.
    """
    local_date = get_local_date_for_timezone(current_character.timezone)
    stmt = (
        select(func.coalesce(func.sum(QuestCompletion.earned_xp), 0))
        .where(
            QuestCompletion.character_id == current_character.id,
            QuestCompletion.completion_date == local_date,
        )
    )
    result = await db.execute(stmt)
    daily_xp_earned = int(result.scalar_one())

    # Daily XP goal (baseline 200 XP scaled with current level)
    daily_xp_goal = max(100, min(600, 150 + (current_character.current_level - 1) * 25))
    is_goal_reached = daily_xp_earned >= daily_xp_goal
    remaining_xp = max(0, daily_xp_goal - daily_xp_earned)
    progress_percentage = (
        min(100, int((daily_xp_earned / daily_xp_goal) * 100)) if daily_xp_goal > 0 else 100
    )

    return DailyProgressOut(
        date=local_date,
        daily_xp_earned=daily_xp_earned,
        daily_xp_goal=daily_xp_goal,
        is_goal_reached=is_goal_reached,
        remaining_xp=remaining_xp,
        progress_percentage=progress_percentage,
    )


@router.post(
    "/me/onboarding",
    response_model=CharacterOut,
    status_code=status.HTTP_201_CREATED,
    summary="Initialize character profile on onboarding",
)
async def onboard_character(
    payload: CharacterCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Provisions a Level 1 Character for the authenticated user.
    Enforces the 1:1 uniqueness constraint between Supabase User and Character.
    """
    stmt = select(Character).where(Character.user_id == user_id)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise ConflictException(
            detail="Character profile already exists for this account.",
            code="CHARACTER_ALREADY_EXISTS",
        )

    # Create character with authoritative default progression
    new_character = Character(
        user_id=user_id,
        username=payload.username,
        title=payload.title,
        timezone=payload.timezone,
        hero_class=payload.hero_class or "vanguard_male",
        current_level=1,
        lifetime_xp=0,
        xp_into_current_level=0,
        xp_required_for_next_level=100,
        gold=0,
        strength=10,
        intellect=10,
        discipline=10,
        vitality=10,
        creativity=10,
    )
    db.add(new_character)
    await db.flush()

    # Initialize streak record
    new_streak = Streak(character_id=new_character.id, current_streak=0, longest_streak=0)
    db.add(new_streak)

    await db.commit()
    await db.refresh(new_character)
    return new_character


@router.patch(
    "/me/equip",
    response_model=CharacterOut,
    summary="Update character equipped cosmetics or hero archetype",
)
async def update_character_cosmetics(
    payload: CharacterEquip,
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Allows the user to update their equipped hero_class, theme, frame, badge, or title.
    """
    if payload.hero_class is not None:
        current_character.hero_class = payload.hero_class
    if payload.equipped_theme is not None:
        current_character.equipped_theme = payload.equipped_theme
    if payload.equipped_frame is not None:
        current_character.equipped_frame = payload.equipped_frame
    if payload.equipped_badge is not None:
        current_character.equipped_badge = payload.equipped_badge
    if payload.title is not None:
        current_character.title = payload.title

    await db.commit()
    await db.refresh(current_character)
    return current_character

