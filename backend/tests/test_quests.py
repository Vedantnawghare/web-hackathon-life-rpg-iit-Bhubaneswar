import uuid
import pytest
from httpx import AsyncClient
from tests.test_auth import generate_test_jwt
from app.models.enums import QuestDifficulty, QuestRecurrence, CharacterAttribute


@pytest.fixture
async def authenticated_hero(client: AsyncClient):
    """Sets up an authenticated character profile."""
    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    # Onboard
    await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={"username": "QuestHero", "title": "Novice Adventurer", "timezone": "UTC"},
    )
    return {"user_id": user_id, "token": token, "headers": headers}


@pytest.fixture
async def second_hero(client: AsyncClient):
    """Sets up a second independent user for multi-tenant isolation tests."""
    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={"username": "ForeignHero", "title": "Rival", "timezone": "UTC"},
    )
    return {"user_id": user_id, "token": token, "headers": headers}


@pytest.mark.asyncio
async def test_quest_creation_authoritative_rewards(client: AsyncClient, authenticated_hero):
    headers = authenticated_hero["headers"]

    payload = {
        "title": "Gym Heavy Deadlifts",
        "description": "5 sets of 5 reps",
        "category": "Gym",
        "difficulty": "HARD",
        "recurrence": "DAILY",
    }

    response = await client.post("/api/v1/quests", headers=headers, json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["title"] == "Gym Heavy Deadlifts"
    assert data["description"] == "5 sets of 5 reps"
    assert data["category"] == "Gym"
    assert data["difficulty"] == "HARD"
    assert data["primary_attribute"] == "STRENGTH"  # Authoritative category mapping
    assert data["base_xp"] == 100  # Authoritative HARD reward
    assert data["base_gold"] == 60  # Authoritative HARD reward
    assert data["recurrence"] == "DAILY"
    assert data["status"] == "ACTIVE"
    assert data["is_completed_for_period"] is False


@pytest.mark.asyncio
async def test_quest_list_and_filters(client: AsyncClient, authenticated_hero):
    headers = authenticated_hero["headers"]

    # Create two quests with different categories
    await client.post(
        "/api/v1/quests",
        headers=headers,
        json={"title": "Study Algorithms", "category": "Coding", "difficulty": "MEDIUM"},
    )
    await client.post(
        "/api/v1/quests",
        headers=headers,
        json={"title": "Morning Run", "category": "Running", "difficulty": "EASY"},
    )

    # List all
    res_all = await client.get("/api/v1/quests", headers=headers)
    assert res_all.status_code == 200
    assert len(res_all.json()) == 2

    # Filter by category
    res_code = await client.get("/api/v1/quests?category=Coding", headers=headers)
    assert res_code.status_code == 200
    assert len(res_code.json()) == 1
    assert res_code.json()[0]["title"] == "Study Algorithms"


@pytest.mark.asyncio
async def test_quest_multi_tenant_isolation(client: AsyncClient, authenticated_hero, second_hero):
    headers1 = authenticated_hero["headers"]
    headers2 = second_hero["headers"]

    # Hero 1 creates quest
    res = await client.post(
        "/api/v1/quests",
        headers=headers1,
        json={"title": "Secret Quest", "category": "Habits", "difficulty": "EASY"},
    )
    quest_id = res.json()["id"]

    # Hero 2 attempts to get Hero 1's quest -> MUST be 404
    res_get = await client.get(f"/api/v1/quests/{quest_id}", headers=headers2)
    assert res_get.status_code == 404

    # Hero 2 attempts to update Hero 1's quest -> MUST be 404
    res_update = await client.patch(
        f"/api/v1/quests/{quest_id}",
        headers=headers2,
        json={"title": "Hijacked"},
    )
    assert res_update.status_code == 404

    # Hero 2 attempts to complete Hero 1's quest -> MUST be 404
    res_comp = await client.post(f"/api/v1/quests/{quest_id}/complete", headers=headers2)
    assert res_comp.status_code == 404


@pytest.mark.asyncio
async def test_quest_update_and_archive(client: AsyncClient, authenticated_hero):
    headers = authenticated_hero["headers"]

    res_create = await client.post(
        "/api/v1/quests",
        headers=headers,
        json={"title": "Draft Quest", "category": "Art", "difficulty": "EASY"},
    )
    quest_id = res_create.json()["id"]
    assert res_create.json()["base_xp"] == 25

    # Update difficulty to EPIC -> rewards authoritatively recalculate
    res_update = await client.patch(
        f"/api/v1/quests/{quest_id}",
        headers=headers,
        json={"difficulty": "EPIC", "title": "Masterpiece Painting"},
    )
    assert res_update.status_code == 200
    data = res_update.json()
    assert data["title"] == "Masterpiece Painting"
    assert data["difficulty"] == "EPIC"
    assert data["base_xp"] == 250
    assert data["base_gold"] == 150

    # Archive quest
    res_arch = await client.delete(f"/api/v1/quests/{quest_id}", headers=headers)
    assert res_arch.status_code == 204

    # Verify archived quest returns 409 if trying to complete
    res_comp = await client.post(f"/api/v1/quests/{quest_id}/complete", headers=headers)
    assert res_comp.status_code == 409
    assert res_comp.json()["code"] == "QUEST_ARCHIVED"


@pytest.mark.asyncio
async def test_one_off_quest_completion_and_idempotency(client: AsyncClient, authenticated_hero):
    headers = authenticated_hero["headers"]

    res_create = await client.post(
        "/api/v1/quests",
        headers=headers,
        json={
            "title": "Set Up Home Server",
            "category": "Coding",
            "difficulty": "HARD",
            "recurrence": "NONE",
        },
    )
    quest_id = res_create.json()["id"]

    # Initial completion
    res_complete = await client.post(f"/api/v1/quests/{quest_id}/complete", headers=headers)
    assert res_complete.status_code == 200
    data = res_complete.json()

    assert data["quest_id"] == quest_id
    assert data["quest_title"] == "Set Up Home Server"
    assert data["earned_xp"] == 102  # 100 * 1.02 streak bonus (day 1 streak)
    assert data["earned_gold"] == 60
    assert data["attribute_increased"] == "INTELLECT"
    assert data["attribute_gain"] == 4
    assert data["current_streak"] == 1
    assert data["character"]["gold"] == 60
    assert data["character"]["intellect"] == 14  # Started at 10, +4 -> 14

    # Duplicate completion attempt for one-off quest must fail with 409 Conflict
    res_duplicate = await client.post(f"/api/v1/quests/{quest_id}/complete", headers=headers)
    assert res_duplicate.status_code == 409
    assert res_duplicate.json()["code"] == "QUEST_ALREADY_COMPLETED"


@pytest.mark.asyncio
async def test_daily_quest_completion_and_period_idempotency(client: AsyncClient, authenticated_hero):
    headers = authenticated_hero["headers"]

    res_create = await client.post(
        "/api/v1/quests",
        headers=headers,
        json={
            "title": "Daily Meditation",
            "category": "Meditation",
            "difficulty": "EASY",
            "recurrence": "DAILY",
        },
    )
    quest_id = res_create.json()["id"]

    # Complete for today
    res_comp = await client.post(f"/api/v1/quests/{quest_id}/complete", headers=headers)
    assert res_comp.status_code == 200
    assert res_comp.json()["attribute_increased"] == "DISCIPLINE"
    assert res_comp.json()["attribute_gain"] == 1

    # Check that quest list now marks this daily quest as is_completed_for_period == True
    res_list = await client.get("/api/v1/quests", headers=headers)
    assert res_list.status_code == 200
    quest_data = next(q for q in res_list.json() if q["id"] == quest_id)
    assert quest_data["is_completed_for_period"] is True
    assert quest_data["last_completed_at"] is not None

    # Immediate second completion attempt for today must fail with 409 Conflict
    res_dup = await client.post(f"/api/v1/quests/{quest_id}/complete", headers=headers)
    assert res_dup.status_code == 409
    assert res_dup.json()["code"] == "QUEST_ALREADY_COMPLETED"


@pytest.mark.asyncio
async def test_level_up_progression_during_quest_completion(client: AsyncClient, authenticated_hero):
    headers = authenticated_hero["headers"]

    # Create an EPIC quest (250 base XP)
    res_create = await client.post(
        "/api/v1/quests",
        headers=headers,
        json={
            "title": "Build Web Application",
            "category": "Coding",
            "difficulty": "EPIC",
            "recurrence": "NONE",
        },
    )
    quest_id = res_create.json()["id"]

    # Initial state: Level 1, 0 XP, 100 needed for Lv 2.
    # 250 XP * 1.02 = 255 XP.
    # 255 >= 100 -> Reaches Level 2, with 155 XP remaining into Level 2.
    res_comp = await client.post(f"/api/v1/quests/{quest_id}/complete", headers=headers)
    assert res_comp.status_code == 200
    data = res_comp.json()

    assert data["has_leveled_up"] is True
    assert data["old_level"] == 1
    assert data["new_level"] == 2
    assert data["levels_gained"] == 1
    assert data["character"]["current_level"] == 2
    assert data["character"]["lifetime_xp"] == 255
    assert data["character"]["xp_into_current_level"] == 155
    assert data["character"]["xp_required_for_next_level"] == 303


@pytest.mark.asyncio
async def test_quest_history_pagination(client: AsyncClient, authenticated_hero):
    headers = authenticated_hero["headers"]

    # Create and complete 3 quests
    for i in range(3):
        res = await client.post(
            "/api/v1/quests",
            headers=headers,
            json={"title": f"Quest {i}", "category": "Fitness", "difficulty": "EASY"},
        )
        qid = res.json()["id"]
        await client.post(f"/api/v1/quests/{qid}/complete", headers=headers)

    # Fetch history limit=2
    res_hist = await client.get("/api/v1/quests/history?limit=2&offset=0", headers=headers)
    assert res_hist.status_code == 200
    data = res_hist.json()
    assert data["total"] == 3
    assert len(data["items"]) == 2
    assert data["limit"] == 2
    assert data["offset"] == 0

    # Fetch offset=2
    res_hist2 = await client.get("/api/v1/quests/history?limit=2&offset=2", headers=headers)
    assert res_hist2.status_code == 200
    assert len(res_hist2.json()["items"]) == 1
