from datetime import date
from sqlalchemy import delete
from app.models.quest_completion import QuestCompletion
from app.models.enums import QuestDifficulty, CharacterAttribute, QuestRecurrence
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_character
from app.models.character import Character
from app.models.enums import QuestStatus
from app.schemas.quest import (
    QuestCreate,
    QuestUpdate,
    QuestOut,
    QuestCompleteResponse,
    QuestHistoryResponse,
)
from app.services import quest_service

router = APIRouter()


@router.get("", response_model=List[QuestOut], summary="List quests for current character")
async def list_quests(
    status: Optional[QuestStatus] = Query(None, description="Filter by status (ACTIVE/ARCHIVED)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns all quests belonging to the authenticated character.
    Includes dynamic period completion status for recurring quests.
    """
    return await quest_service.list_quests(
        db=db,
        character=current_character,
        status_filter=status,
        category_filter=category,
    )


@router.post(
    "",
    response_model=QuestOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new quest",
)
async def create_quest(
    payload: QuestCreate,
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a new quest for the authenticated character.
    Authoritatively assigns base XP and base Gold from difficulty.
    """
    quest = await quest_service.create_quest(
        db=db,
        character=current_character,
        payload=payload,
    )
    return QuestOut.model_validate(quest)


@router.get("/history", response_model=QuestHistoryResponse, summary="Get paginated completion history")
async def get_quest_history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns paginated quest completion audit history for the authenticated character.
    """
    return await quest_service.get_quest_history(
        db=db,
        character_id=current_character.id,
        limit=limit,
        offset=offset,
    )


@router.get("/{id}", response_model=QuestOut, summary="Get quest details")
async def get_quest(
    id: uuid.UUID,
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns a single quest by ID if it belongs to the authenticated character.
    """
    quest = await quest_service.get_quest(
        db=db,
        character_id=current_character.id,
        quest_id=id,
    )
    return QuestOut.model_validate(quest)


@router.patch("/{id}", response_model=QuestOut, summary="Update quest details")
async def update_quest(
    id: uuid.UUID,
    payload: QuestUpdate,
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Updates quest fields. Authoritatively recalculates rewards if difficulty changes.
    """
    quest = await quest_service.update_quest(
        db=db,
        character_id=current_character.id,
        quest_id=id,
        payload=payload,
    )
    return QuestOut.model_validate(quest)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Archive quest")
async def archive_quest(
    id: uuid.UUID,
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Soft deletes/archives a quest.
    """
    await quest_service.archive_quest(
        db=db,
        character_id=current_character.id,
        quest_id=id,
    )
    return None


@router.post(
    "/{id}/complete",
    response_model=QuestCompleteResponse,
    summary="Clear quest and claim authoritative rewards",
)
async def complete_quest(
    id: uuid.UUID,
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Clears a quest inside an ACID transaction.
    - Locks character, quest, and streak rows
    - Prevents double claims with period idempotency keys
    - Authoritatively updates XP, level, attributes, gold, and streaks
    - Returns detailed completion and celebration response
    """
    return await quest_service.complete_quest(
        db=db,
        character_id=current_character.id,
        quest_id=id,
    )


@router.post("/demo-seed", response_model=List[QuestOut], summary="Seed realistic demo daily quests")
async def seed_demo_quests(
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a safe, realistic 4-task demo day for the current character in the database.
    """
    demo_tasks = [
        QuestCreate(
            title="Study Deep Learning & Transformers (1 Hour)",
            description="Deep focus study session mastering self-attention mechanisms and neural architectures.",
            category="Academics",
            difficulty=QuestDifficulty.HARD,
            primary_attribute=CharacterAttribute.INTELLECT,
            recurrence=QuestRecurrence.DAILY,
            due_time="10:00",
        ),
        QuestCreate(
            title="Gym Heavy Squat & Core Circuit",
            description="High-intensity compound lift training for physical fortitude and explosive strength.",
            category="Health",
            difficulty=QuestDifficulty.HARD,
            primary_attribute=CharacterAttribute.STRENGTH,
            recurrence=QuestRecurrence.DAILY,
            due_time="14:00",
        ),
        QuestCreate(
            title="Drink 3 Liters Mineral Water & Electrolytes",
            description="Maintain peak hydration and biological stamina throughout the daily campaign.",
            category="Health",
            difficulty=QuestDifficulty.MEDIUM,
            primary_attribute=CharacterAttribute.VITALITY,
            recurrence=QuestRecurrence.DAILY,
            due_time="17:00",
        ),
        QuestCreate(
            title="Deep Focus Code Review & Refactoring",
            description="Systematic code architecture audit and unit test verification with zero distractions.",
            category="Engineering",
            difficulty=QuestDifficulty.MEDIUM,
            primary_attribute=CharacterAttribute.DISCIPLINE,
            recurrence=QuestRecurrence.DAILY,
            due_time="20:00",
        ),
    ]

    created = []
    for task in demo_tasks:
        q = await quest_service.create_quest(db=db, character=current_character, payload=task)
        created.append(q)
    return created


@router.post("/demo-reset", summary="Reset today's demo boss HP to 100")
async def reset_demo_boss(
    current_character: Character = Depends(get_current_character),
    db: AsyncSession = Depends(get_db),
):
    """
    Deletes today's completion records for this character so all daily tasks are incomplete,
    resetting the Daily Boss HP back to 100/100 for hackathon demonstrations.
    """
    stmt = delete(QuestCompletion).where(
        QuestCompletion.character_id == current_character.id,
    )
    await db.execute(stmt)
    await db.commit()
    return {"message": "Daily Boss HP reset to 100/100"}
