import uuid
from datetime import date, datetime
import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.character import Character
from app.models.quest import Quest
from app.models.quest_completion import QuestCompletion
from app.models.streak import Streak
from app.models.shop_item import ShopItem
from app.models.inventory_item import InventoryItem
from app.models.achievement import Achievement
from app.models.character_achievement import CharacterAchievement
from app.models.enums import (
    QuestDifficulty,
    CharacterAttribute,
    QuestStatus,
    QuestRecurrence,
    ShopItemType,
)


@pytest.mark.asyncio
async def test_character_creation_authoritative_fields(db_session: AsyncSession):
    user_id = uuid.uuid4()
    character = Character(
        user_id=user_id,
        username="HeroTester",
        title="Novice Adventurer",
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
        timezone="UTC",
    )
    db_session.add(character)
    await db_session.commit()
    await db_session.refresh(character)

    assert character.id is not None
    assert character.user_id == user_id
    assert character.username == "HeroTester"
    assert character.current_level == 1
    assert character.lifetime_xp == 0
    assert character.xp_into_current_level == 0
    assert character.xp_required_for_next_level == 100
    assert character.gold == 0
    assert character.strength == 10
    assert character.intellect == 10
    assert character.discipline == 10
    assert character.vitality == 10
    assert character.creativity == 10


@pytest.mark.asyncio
async def test_character_user_id_unique_constraint(db_session: AsyncSession):
    shared_user_id = uuid.uuid4()
    char1 = Character(
        user_id=shared_user_id,
        username="Char1",
    )
    db_session.add(char1)
    await db_session.commit()

    # Attempt to create second character with same user_id
    char2 = Character(
        user_id=shared_user_id,
        username="Char2",
    )
    db_session.add(char2)
    with pytest.raises(IntegrityError):
        await db_session.commit()

    await db_session.rollback()


@pytest.mark.asyncio
async def test_inventory_item_unique_constraint(db_session: AsyncSession):
    # Setup character and shop item
    char = Character(user_id=uuid.uuid4(), username="Collector")
    shop_item = ShopItem(
        code="test_theme",
        name="Test Theme",
        description="Theme for testing",
        item_type=ShopItemType.THEME,
        cost_gold=100,
        asset_key="theme_test",
    )
    db_session.add_all([char, shop_item])
    await db_session.commit()

    # Add first inventory item
    inv1 = InventoryItem(character_id=char.id, shop_item_id=shop_item.id)
    db_session.add(inv1)
    await db_session.commit()

    # Attempt to add duplicate inventory item for same character and shop item
    inv2 = InventoryItem(character_id=char.id, shop_item_id=shop_item.id)
    db_session.add(inv2)
    with pytest.raises(IntegrityError):
        await db_session.commit()

    await db_session.rollback()


@pytest.mark.asyncio
async def test_character_achievement_unique_constraint(db_session: AsyncSession):
    char = Character(user_id=uuid.uuid4(), username="Achiever")
    ach = Achievement(
        code="test_ach",
        title="Test Achievement",
        description="Achieve testing",
        category="Test",
        icon_name="star",
        condition_type="TEST",
        condition_threshold=1,
    )
    db_session.add_all([char, ach])
    await db_session.commit()

    ca1 = CharacterAchievement(character_id=char.id, achievement_id=ach.id)
    db_session.add(ca1)
    await db_session.commit()

    # Duplicate unlock must fail
    ca2 = CharacterAchievement(character_id=char.id, achievement_id=ach.id)
    db_session.add(ca2)
    with pytest.raises(IntegrityError):
        await db_session.commit()

    await db_session.rollback()


@pytest.mark.asyncio
async def test_quest_completion_idempotency_key_constraint(db_session: AsyncSession):
    char = Character(user_id=uuid.uuid4(), username="Quester")
    db_session.add(char)
    await db_session.commit()

    quest = Quest(
        character_id=char.id,
        title="Workout",
        category="Fitness",
        difficulty=QuestDifficulty.MEDIUM,
        primary_attribute=CharacterAttribute.STRENGTH,
        base_xp=50,
        base_gold=25,
        recurrence=QuestRecurrence.DAILY,
    )
    db_session.add(quest)
    await db_session.commit()

    idempotency_key = f"daily_{quest.id}_{char.id}_{date.today().isoformat()}"

    qc1 = QuestCompletion(
        quest_id=quest.id,
        character_id=char.id,
        completion_date=date.today(),
        earned_xp=50,
        earned_gold=25,
        attribute_gain=2,
        idempotency_key=idempotency_key,
    )
    db_session.add(qc1)
    await db_session.commit()

    # Attempting duplicate completion with same idempotency key must fail
    qc2 = QuestCompletion(
        quest_id=quest.id,
        character_id=char.id,
        completion_date=date.today(),
        earned_xp=50,
        earned_gold=25,
        attribute_gain=2,
        idempotency_key=idempotency_key,
    )
    db_session.add(qc2)
    with pytest.raises(IntegrityError):
        await db_session.commit()

    await db_session.rollback()


@pytest.mark.asyncio
async def test_character_cascade_delete(db_session: AsyncSession):
    char = Character(user_id=uuid.uuid4(), username="Doomed")
    db_session.add(char)
    await db_session.commit()

    quest = Quest(
        character_id=char.id,
        title="To be deleted",
        category="Chores",
        difficulty=QuestDifficulty.EASY,
        primary_attribute=CharacterAttribute.DISCIPLINE,
        base_xp=25,
        base_gold=10,
    )
    streak = Streak(character_id=char.id, current_streak=3)
    db_session.add_all([quest, streak])
    await db_session.commit()

    # Delete character
    await db_session.delete(char)
    await db_session.commit()

    # Verify quests and streaks are cascaded
    q_result = await db_session.execute(select(Quest).where(Quest.character_id == char.id))
    assert q_result.scalar_one_or_none() is None

    s_result = await db_session.execute(select(Streak).where(Streak.character_id == char.id))
    assert s_result.scalar_one_or_none() is None
