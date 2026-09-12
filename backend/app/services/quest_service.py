import math
import uuid
from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    EntityNotFoundException,
    ConflictException,
    ForbiddenException,
)
from app.models.character import Character
from app.models.quest import Quest
from app.models.quest_completion import QuestCompletion
from app.models.streak import Streak
from app.models.enums import QuestStatus, QuestRecurrence, CharacterAttribute
from app.schemas.quest import (
    QuestCreate,
    QuestUpdate,
    QuestOut,
    QuestCompleteResponse,
    QuestHistoryItem,
    QuestHistoryResponse,
)
from app.schemas.character import CharacterOut
from app.schemas.achievement import AchievementOut
from app.services.rpg_engine import (
    get_difficulty_rewards,
    resolve_primary_attribute,
    apply_xp_gain,
)
from app.services.streak_service import (
    get_local_date_for_timezone,
    get_local_iso_calendar,
    calculate_streak_multiplier,
    evaluate_streak_activity,
)


async def create_quest(
    db: AsyncSession,
    character: Character,
    payload: QuestCreate,
) -> Quest:
    """
    Creates a new quest authoritatively bound to the character.
    Calculates base rewards and resolves the primary attribute server-side.
    """
    primary_attr = resolve_primary_attribute(payload.category, payload.primary_attribute)
    rewards = get_difficulty_rewards(payload.difficulty)

    new_quest = Quest(
        character_id=character.id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        difficulty=payload.difficulty,
        primary_attribute=primary_attr,
        base_xp=rewards["base_xp"],
        base_gold=rewards["base_gold"],
        recurrence=payload.recurrence,
        due_date=payload.due_date,
        due_time=payload.due_time,
        status=QuestStatus.ACTIVE,
    )

    db.add(new_quest)
    await db.commit()
    await db.refresh(new_quest)
    return new_quest


async def get_quest(
    db: AsyncSession,
    character_id: uuid.UUID,
    quest_id: uuid.UUID,
) -> Quest:
    """
    Retrieves a quest strictly scoped to the character.
    Raises 404 if not found or belongs to another user.
    """
    stmt = select(Quest).where(
        Quest.id == quest_id,
        Quest.character_id == character_id,
    )
    result = await db.execute(stmt)
    quest = result.scalar_one_or_none()
    if not quest:
        raise EntityNotFoundException("Quest not found.", code="QUEST_NOT_FOUND")
    return quest


async def list_quests(
    db: AsyncSession,
    character: Character,
    status_filter: Optional[QuestStatus] = None,
    category_filter: Optional[str] = None,
) -> List[QuestOut]:
    """
    Lists quests for the character, annotated with period completion status.
    Evaluates whether daily or weekly quests are completed for the current period.
    """
    stmt = select(Quest).where(Quest.character_id == character.id)

    if status_filter is not None:
        stmt = stmt.where(Quest.status == status_filter)
    if category_filter is not None and category_filter.strip():
        stmt = stmt.where(Quest.category == category_filter.strip())

    stmt = stmt.order_by(Quest.created_at.desc())
    result = await db.execute(stmt)
    quests = result.scalars().all()

    if not quests:
        return []

    # Determine user's current local date and week
    local_date = get_local_date_for_timezone(character.timezone)
    iso_year, iso_week = get_local_iso_calendar(character.timezone)

    # Fetch relevant completions for this character
    comp_stmt = select(QuestCompletion).where(
        QuestCompletion.character_id == character.id,
    )
    comp_result = await db.execute(comp_stmt)
    all_completions = comp_result.scalars().all()

    # Index completions by quest_id
    completions_by_quest = {}
    for comp in all_completions:
        completions_by_quest.setdefault(comp.quest_id, []).append(comp)

    annotated_quests: List[QuestOut] = []

    for quest in quests:
        quest_comps = completions_by_quest.get(quest.id, [])
        is_completed = False
        last_completed_at = None

        if quest_comps:
            # Sort newest first
            quest_comps.sort(key=lambda c: c.completed_at, reverse=True)
            last_completed_at = quest_comps[0].completed_at

            if quest.recurrence == QuestRecurrence.NONE:
                # One-off quest completed if any completion exists
                is_completed = True
            elif quest.recurrence == QuestRecurrence.DAILY:
                # Daily quest completed if completion exists for today
                is_completed = any(c.completion_date == local_date for c in quest_comps)
            elif quest.recurrence == QuestRecurrence.WEEKLY:
                # Weekly quest completed if completion exists for this ISO week
                is_completed = any(
                    c.completion_period_iso_year == iso_year
                    and c.completion_period_iso_week == iso_week
                    for c in quest_comps
                )

        q_dict = {
            "id": quest.id,
            "character_id": quest.character_id,
            "title": quest.title,
            "description": quest.description,
            "category": quest.category,
            "difficulty": quest.difficulty,
            "primary_attribute": quest.primary_attribute,
            "base_xp": quest.base_xp,
            "base_gold": quest.base_gold,
            "status": quest.status,
            "recurrence": quest.recurrence,
            "due_date": quest.due_date,
            "due_time": quest.due_time,
            "created_at": quest.created_at,
            "updated_at": quest.updated_at,
            "is_completed_for_period": is_completed,
            "last_completed_at": last_completed_at,
        }
        annotated_quests.append(QuestOut.model_validate(q_dict))

    return annotated_quests


async def update_quest(
    db: AsyncSession,
    character_id: uuid.UUID,
    quest_id: uuid.UUID,
    payload: QuestUpdate,
) -> Quest:
    """
    Updates quest fields with server-side validation and recalculations.
    """
    quest = await get_quest(db, character_id, quest_id)

    if payload.title is not None:
        quest.title = payload.title
    if payload.description is not None:
        quest.description = payload.description
    if payload.category is not None:
        quest.category = payload.category
        if payload.primary_attribute is None:
            quest.primary_attribute = resolve_primary_attribute(payload.category)
    if payload.primary_attribute is not None:
        quest.primary_attribute = payload.primary_attribute
    if payload.difficulty is not None:
        quest.difficulty = payload.difficulty
        rewards = get_difficulty_rewards(payload.difficulty)
        quest.base_xp = rewards["base_xp"]
        quest.base_gold = rewards["base_gold"]
    if payload.recurrence is not None:
        quest.recurrence = payload.recurrence
    if payload.due_date is not None:
        quest.due_date = payload.due_date
    if payload.due_time is not None:
        quest.due_time = payload.due_time
    if payload.status is not None:
        quest.status = payload.status

    await db.commit()
    await db.refresh(quest)
    return quest


async def archive_quest(
    db: AsyncSession,
    character_id: uuid.UUID,
    quest_id: uuid.UUID,
) -> None:
    """
    Soft-deletes/archives a quest.
    """
    quest = await get_quest(db, character_id, quest_id)
    quest.status = QuestStatus.ARCHIVED
    await db.commit()


async def complete_quest(
    db: AsyncSession,
    character_id: uuid.UUID,
    quest_id: uuid.UUID,
) -> QuestCompleteResponse:
    """
    Authoritative, transaction-safe Quest Completion.
    Locks the character, quest, and streak records to prevent race conditions.
    Constructs period-specific idempotency keys to prevent duplicate rewards.
    """
    # 1. Pessimistic row lock on Character
    char_stmt = (
        select(Character)
        .where(Character.id == character_id)
        .with_for_update()
    )
    char_result = await db.execute(char_stmt)
    character = char_result.scalar_one_or_none()
    if not character:
        raise EntityNotFoundException("Character not found.", code="CHARACTER_NOT_FOUND")

    # 2. Pessimistic row lock on Quest
    quest_stmt = (
        select(Quest)
        .where(Quest.id == quest_id, Quest.character_id == character_id)
        .with_for_update()
    )
    quest_result = await db.execute(quest_stmt)
    quest = quest_result.scalar_one_or_none()
    if not quest:
        raise EntityNotFoundException("Quest not found.", code="QUEST_NOT_FOUND")

    # 3. Verify quest status is ACTIVE
    if quest.status == QuestStatus.ARCHIVED:
        raise ConflictException(
            detail="Archived quests cannot be cleared.",
            code="QUEST_ARCHIVED",
        )

    # 4. Determine user's local date and ISO week
    local_date = get_local_date_for_timezone(character.timezone)
    iso_year, iso_week = get_local_iso_calendar(character.timezone)

    # 5. Construct period idempotency key
    if quest.recurrence == QuestRecurrence.NONE:
        idempotency_key = f"oneoff_{quest.id}"
    elif quest.recurrence == QuestRecurrence.DAILY:
        idempotency_key = f"daily_{quest.id}_{character.id}_{local_date.isoformat()}"
    elif quest.recurrence == QuestRecurrence.WEEKLY:
        idempotency_key = f"weekly_{quest.id}_{character.id}_{iso_year}_W{iso_week}"
    else:
        idempotency_key = f"oneoff_{quest.id}"

    # 6. Check for duplicate completion
    dup_stmt = select(QuestCompletion).where(
        QuestCompletion.idempotency_key == idempotency_key
    )
    dup_result = await db.execute(dup_stmt)
    if dup_result.scalar_one_or_none():
        raise ConflictException(
            detail="Quest has already been cleared for the current period.",
            code="QUEST_ALREADY_COMPLETED",
        )

    # 7. Lock & update streak
    streak_stmt = (
        select(Streak)
        .where(Streak.character_id == character.id)
        .with_for_update()
    )
    streak_result = await db.execute(streak_stmt)
    streak = streak_result.scalar_one_or_none()
    if not streak:
        streak = Streak(character_id=character.id, current_streak=0, longest_streak=0)
        db.add(streak)
        await db.flush()

    new_streak, streak_extended = evaluate_streak_activity(streak, local_date)
    multiplier = calculate_streak_multiplier(new_streak)

    # 8. Calculate authoritative final rewards
    final_xp = math.floor(quest.base_xp * multiplier)
    final_gold = quest.base_gold
    diff_rewards = get_difficulty_rewards(quest.difficulty)
    attr_gain = diff_rewards["attribute_gain"]

    old_level = character.current_level

    # 9. Apply XP progression via rpg_engine
    progression = apply_xp_gain(
        lifetime_xp=character.lifetime_xp,
        current_level=character.current_level,
        xp_into_current_level=character.xp_into_current_level,
        xp_gained=final_xp,
    )

    character.lifetime_xp = progression.lifetime_xp
    character.current_level = progression.current_level
    character.xp_into_current_level = progression.xp_into_current_level
    character.xp_required_for_next_level = progression.xp_required_for_next_level

    # 10. Apply primary attribute gain
    if quest.primary_attribute == CharacterAttribute.STRENGTH:
        character.strength += attr_gain
    elif quest.primary_attribute == CharacterAttribute.INTELLECT:
        character.intellect += attr_gain
    elif quest.primary_attribute == CharacterAttribute.DISCIPLINE:
        character.discipline += attr_gain
    elif quest.primary_attribute == CharacterAttribute.VITALITY:
        character.vitality += attr_gain
    elif quest.primary_attribute == CharacterAttribute.CREATIVITY:
        character.creativity += attr_gain

    # 11. Add authoritative Gold
    character.gold += final_gold

    # 12. Record QuestCompletion audit record
    completion = QuestCompletion(
        quest_id=quest.id,
        character_id=character.id,
        completion_date=local_date,
        completion_period_iso_year=iso_year,
        completion_period_iso_week=iso_week,
        earned_xp=final_xp,
        earned_gold=final_gold,
        attribute_gain=attr_gain,
        idempotency_key=idempotency_key,
        completed_at=datetime.utcnow(),
    )
    db.add(completion)

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        # If an integrity error occurred due to concurrent commit of same idempotency key
        if "UNIQUE constraint failed" in str(e) or "idempotency_key" in str(e).lower() or "IntegrityError" in type(e).__name__:
            raise ConflictException(
                detail="Quest has already been cleared for the current period.",
                code="QUEST_ALREADY_COMPLETED",
            )
        raise

    await db.refresh(character)

    # 13. Evaluate and unlock any eligible achievements
    from app.services.achievement_service import evaluate_and_unlock_achievements
    unlocked_achs = await evaluate_and_unlock_achievements(db, character)
    unlocked_out = [
        AchievementOut(
            id=a.id,
            code=a.code,
            title=a.title,
            description=a.description,
            category=a.category,
            icon_name=a.icon_name,
            condition_type=a.condition_type,
            condition_threshold=a.condition_threshold,
            reward_xp=a.reward_xp,
            reward_gold=a.reward_gold,
            reward_title=a.reward_title,
            is_unlocked=True,
            unlocked_at=datetime.utcnow(),
            current_progress=a.condition_threshold,
        )
        for a in unlocked_achs
    ]

    return QuestCompleteResponse(
        quest_id=quest.id,
        quest_title=quest.title,
        earned_xp=final_xp,
        earned_gold=final_gold,
        xp_multiplier=multiplier,
        attribute_increased=quest.primary_attribute,
        attribute_gain=attr_gain,
        old_level=old_level,
        new_level=character.current_level,
        has_leveled_up=progression.has_leveled_up,
        levels_gained=progression.levels_gained,
        current_streak=new_streak,
        streak_extended=streak_extended,
        unlocked_achievements=unlocked_out,
        character=CharacterOut.model_validate(character),
    )


async def get_quest_history(
    db: AsyncSession,
    character_id: uuid.UUID,
    limit: int = 20,
    offset: int = 0,
) -> QuestHistoryResponse:
    """
    Returns paginated completion audit records for the character.
    """
    # Count total
    count_stmt = select(func.count(QuestCompletion.id)).where(
        QuestCompletion.character_id == character_id
    )
    total_count = (await db.execute(count_stmt)).scalar_one()

    # Query items with joined quest
    stmt = (
        select(QuestCompletion, Quest)
        .join(Quest, QuestCompletion.quest_id == Quest.id)
        .where(QuestCompletion.character_id == character_id)
        .order_by(QuestCompletion.completed_at.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(stmt)
    rows = result.all()

    items = []
    for comp, quest in rows:
        items.append(
            QuestHistoryItem(
                id=comp.id,
                quest_id=comp.quest_id,
                quest_title=quest.title,
                category=quest.category,
                difficulty=quest.difficulty,
                primary_attribute=quest.primary_attribute,
                earned_xp=comp.earned_xp,
                earned_gold=comp.earned_gold,
                attribute_gain=comp.attribute_gain,
                completion_date=comp.completion_date,
                completed_at=comp.completed_at,
            )
        )

    return QuestHistoryResponse(
        items=items,
        total=total_count,
        limit=limit,
        offset=offset,
    )
