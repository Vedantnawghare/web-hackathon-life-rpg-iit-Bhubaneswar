from typing import List, Tuple
from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.character import Character
from app.models.achievement import Achievement
from app.models.character_achievement import CharacterAchievement
from app.models.quest_completion import QuestCompletion
from app.models.streak import Streak
from app.schemas.achievement import AchievementOut
from app.services.rpg_engine import apply_xp_gain


async def evaluate_and_unlock_achievements(
    db: AsyncSession,
    character: Character,
) -> List[Achievement]:
    """
    Authoritative, idempotent evaluation of achievement milestones.
    Inspects database state for quest counts, level, streak, and lifetime XP.
    Unlocks achievements, grants authoritative XP & Gold rewards, and commits safely.
    """
    # 1. Fetch total quest completion count for character
    count_stmt = select(func.count(QuestCompletion.id)).where(
        QuestCompletion.character_id == character.id
    )
    quest_count = (await db.execute(count_stmt)).scalar_one() or 0

    # 2. Fetch current streak
    streak_stmt = select(Streak).where(Streak.character_id == character.id)
    streak_res = await db.execute(streak_stmt)
    streak_record = streak_res.scalar_one_or_none()
    current_streak = streak_record.current_streak if streak_record else 0
    longest_streak = streak_record.longest_streak if streak_record else 0
    effective_streak = max(current_streak, longest_streak)

    # 3. Fetch all catalog achievements
    all_ach_stmt = select(Achievement).order_by(Achievement.condition_threshold.asc())
    all_achievements = (await db.execute(all_ach_stmt)).scalars().all()

    # 4. Fetch currently unlocked achievement IDs
    unlock_stmt = select(CharacterAchievement.achievement_id).where(
        CharacterAchievement.character_id == character.id
    )
    existing_unlocked_ids = set((await db.execute(unlock_stmt)).scalars().all())

    newly_unlocked: List[Achievement] = []

    for ach in all_achievements:
        if ach.id in existing_unlocked_ids:
            continue

        condition_met = False

        if ach.condition_type == "QUEST_COUNT":
            if quest_count >= ach.condition_threshold:
                condition_met = True
        elif ach.condition_type == "LEVEL":
            if character.current_level >= ach.condition_threshold:
                condition_met = True
        elif ach.condition_type == "STREAK":
            if effective_streak >= ach.condition_threshold:
                condition_met = True
        elif ach.condition_type == "XP":
            if character.lifetime_xp >= ach.condition_threshold:
                condition_met = True

        if condition_met:
            # Unlock achievement
            char_ach = CharacterAchievement(
                character_id=character.id,
                achievement_id=ach.id,
                unlocked_at=datetime.utcnow(),
            )
            db.add(char_ach)
            existing_unlocked_ids.add(ach.id)
            newly_unlocked.append(ach)

            # Grant rewards
            if ach.reward_gold > 0:
                character.gold += ach.reward_gold

            if ach.reward_xp > 0:
                progression = apply_xp_gain(
                    lifetime_xp=character.lifetime_xp,
                    current_level=character.current_level,
                    xp_into_current_level=character.xp_into_current_level,
                    xp_gained=ach.reward_xp,
                )
                character.lifetime_xp = progression.lifetime_xp
                character.current_level = progression.current_level
                character.xp_into_current_level = progression.xp_into_current_level
                character.xp_required_for_next_level = progression.xp_required_for_next_level

    if newly_unlocked:
        try:
            await db.commit()
            await db.refresh(character)
        except Exception:
            await db.rollback()
            raise

    return newly_unlocked


async def get_achievements_with_progress(
    db: AsyncSession,
    character: Character,
) -> List[AchievementOut]:
    """
    Evaluates pending achievements, then returns all catalog achievements
    annotated with unlock state and current progress toward completion.
    """
    # Run evaluation first to ensure fresh state
    await evaluate_and_unlock_achievements(db, character)

    # Re-fetch stats
    count_stmt = select(func.count(QuestCompletion.id)).where(
        QuestCompletion.character_id == character.id
    )
    quest_count = (await db.execute(count_stmt)).scalar_one() or 0

    streak_stmt = select(Streak).where(Streak.character_id == character.id)
    streak_res = await db.execute(streak_stmt)
    streak_record = streak_res.scalar_one_or_none()
    current_streak = streak_record.current_streak if streak_record else 0
    longest_streak = streak_record.longest_streak if streak_record else 0
    effective_streak = max(current_streak, longest_streak)

    # Fetch all achievements
    all_ach_stmt = select(Achievement).order_by(Achievement.created_at.asc())
    all_achievements = (await db.execute(all_ach_stmt)).scalars().all()

    # Fetch unlocks
    unlock_stmt = select(CharacterAchievement).where(
        CharacterAchievement.character_id == character.id
    )
    unlock_res = await db.execute(unlock_stmt)
    unlocks_map = {u.achievement_id: u.unlocked_at for u in unlock_res.scalars().all()}

    output: List[AchievementOut] = []

    for ach in all_achievements:
        is_unlocked = ach.id in unlocks_map
        progress = 0

        if ach.condition_type == "QUEST_COUNT":
            progress = min(quest_count, ach.condition_threshold)
        elif ach.condition_type == "LEVEL":
            progress = min(character.current_level, ach.condition_threshold)
        elif ach.condition_type == "STREAK":
            progress = min(effective_streak, ach.condition_threshold)
        elif ach.condition_type == "XP":
            progress = min(character.lifetime_xp, ach.condition_threshold)

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
                unlocked_at=unlocks_map.get(ach.id),
                current_progress=progress,
            )
        )

    return output
