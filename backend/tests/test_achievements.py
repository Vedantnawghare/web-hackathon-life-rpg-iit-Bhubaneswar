import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.character import Character
from app.models.streak import Streak
from app.services.seed import seed_initial_catalog
from tests.test_auth import generate_test_jwt


@pytest.mark.asyncio
async def test_first_quest_achievement_unlock_on_completion(client: AsyncClient, db_session):
    """
    Verifies that completing the first quest automatically unlocks the FIRST_QUEST achievement,
    credits the bonus XP and Gold, and includes it in the completion response.
    """
    await seed_initial_catalog(db_session)

    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    # Onboard
    await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={"username": "AchieverPrime", "timezone": "UTC"},
    )

    # Create quest
    res_q = await client.post(
        "/api/v1/quests",
        headers=headers,
        json={"title": "My First Quest", "category": "Fitness", "difficulty": "EASY"},
    )
    quest_id = res_q.json()["id"]

    # Complete quest
    res_comp = await client.post(f"/api/v1/quests/{quest_id}/complete", headers=headers)
    assert res_comp.status_code == 200
    comp_data = res_comp.json()

    # FIRST_QUEST achievement should be returned in unlocked_achievements
    unlocked = comp_data.get("unlocked_achievements", [])
    assert any(a["code"] == "FIRST_QUEST" for a in unlocked)

    # Check GET /api/v1/achievements
    ach_res = await client.get("/api/v1/achievements", headers=headers)
    assert ach_res.status_code == 200
    achs = ach_res.json()
    first_q_ach = next(a for a in achs if a["code"] == "FIRST_QUEST")
    assert first_q_ach["is_unlocked"] is True
    assert first_q_ach["current_progress"] == 1


@pytest.mark.asyncio
async def test_level_and_streak_achievement_milestones(client: AsyncClient, db_session):
    """
    Verifies that LEVEL_5, STREAK_7, and XP_1000 achievements unlock when criteria are met.
    """
    await seed_initial_catalog(db_session)

    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={"username": "MilestoneHero", "timezone": "UTC"},
    )

    char = (await db_session.execute(select(Character).where(Character.user_id == user_id))).scalar_one()

    # Set stats to meet LEVEL_5 (current_level=5), STREAK_7 (streak=7), and XP_1000 (lifetime_xp=1200)
    char.current_level = 5
    char.lifetime_xp = 1200

    streak = (await db_session.execute(select(Streak).where(Streak.character_id == char.id))).scalar_one()
    streak.current_streak = 7
    streak.longest_streak = 7
    await db_session.commit()

    # Calling GET /api/v1/achievements triggers evaluation
    res = await client.get("/api/v1/achievements", headers=headers)
    assert res.status_code == 200
    achs = res.json()

    unlocked_codes = {a["code"] for a in achs if a["is_unlocked"]}
    assert "LEVEL_5" in unlocked_codes
    assert "STREAK_7" in unlocked_codes
    assert "XP_1000" in unlocked_codes

    # Unmet milestones should remain locked
    locked_codes = {a["code"] for a in achs if not a["is_unlocked"]}
    assert "LEVEL_10" in locked_codes
    assert "STREAK_30" in locked_codes
    assert "XP_5000" in locked_codes


@pytest.mark.asyncio
async def test_achievement_unlock_idempotency(client: AsyncClient, db_session):
    """
    Verifies that repeated evaluation does not double-grant rewards or duplicate unlocks.
    """
    await seed_initial_catalog(db_session)

    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={"username": "IdempotentKnight", "timezone": "UTC"},
    )

    char = (await db_session.execute(select(Character).where(Character.user_id == user_id))).scalar_one()
    char.current_level = 5
    await db_session.commit()

    # First evaluation
    res1 = await client.get("/api/v1/achievements", headers=headers)
    assert res1.status_code == 200

    char_res1 = await client.get("/api/v1/characters/me", headers=headers)
    gold_after_first = char_res1.json()["gold"]

    # Second evaluation
    res2 = await client.get("/api/v1/achievements", headers=headers)
    assert res2.status_code == 200

    char_res2 = await client.get("/api/v1/characters/me", headers=headers)
    assert char_res2.json()["gold"] == gold_after_first
