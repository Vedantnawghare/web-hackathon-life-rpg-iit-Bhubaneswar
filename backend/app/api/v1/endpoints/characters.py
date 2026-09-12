import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user_id, get_current_character
from app.core.exceptions import ConflictException
from app.models.character import Character
from app.models.streak import Streak
from app.schemas.character import CharacterCreate, CharacterOut, CharacterEquip

router = APIRouter()


@router.get("/me", response_model=CharacterOut, summary="Get active character HUD profile")
async def get_my_character(
    current_character: Character = Depends(get_current_character),
):
    """
    Returns the authoritative Character profile for the authenticated Supabase user.
    """
    return current_character


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
