import uuid
import pytest
from httpx import AsyncClient
from app.core.config import settings
from tests.test_auth import generate_test_jwt


@pytest.mark.asyncio
async def test_daily_progress_lifecycle(client: AsyncClient):
    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Onboard character
    onboard_res = await client.post(
        "/api/v1/characters/me/onboarding",
        json={
            "username": "AriaShadow",
            "title": "Novice Adventurer",
            "timezone": "UTC",
        },
        headers=headers,
    )
    assert onboard_res.status_code == 201

    # 2. Check initial daily progress (0 earned XP)
    prog_res = await client.get("/api/v1/characters/me/daily-progress", headers=headers)
    assert prog_res.status_code == 200
    prog_data = prog_res.json()
    assert prog_data["daily_xp_earned"] == 0
    assert prog_data["daily_xp_goal"] > 0
    assert prog_data["is_goal_reached"] is False
    assert prog_data["remaining_xp"] == prog_data["daily_xp_goal"]

    # 3. Create and complete a quest
    quest_res = await client.post(
        "/api/v1/quests",
        json={
            "title": "Defeat the Code Golem",
            "category": "Coding",
            "difficulty": "HARD",
            "recurrence": "DAILY",
        },
        headers=headers,
    )
    assert quest_res.status_code == 201
    quest_id = quest_res.json()["id"]

    # Complete the quest
    comp_res = await client.post(f"/api/v1/quests/{quest_id}/complete", headers=headers)
    assert comp_res.status_code == 200
    earned_xp = comp_res.json()["earned_xp"]
    assert earned_xp > 0

    # 4. Check updated daily progress
    prog_res_after = await client.get("/api/v1/characters/me/daily-progress", headers=headers)
    assert prog_res_after.status_code == 200
    prog_after = prog_res_after.json()
    assert prog_after["daily_xp_earned"] == earned_xp
    assert prog_after["remaining_xp"] == max(0, prog_after["daily_xp_goal"] - earned_xp)
    assert prog_after["progress_percentage"] == min(100, int((earned_xp / prog_after["daily_xp_goal"]) * 100))
