import uuid
import pytest
from httpx import AsyncClient
from app.models.enums import QuestDifficulty, QuestRecurrence
from app.schemas.quest import QuestCreate
from tests.test_auth import generate_test_jwt


@pytest.mark.asyncio
async def test_onboard_with_hero_selection(client: AsyncClient):
    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    # Create character specifying hero_class="mage_female"
    resp = await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={
            "username": "SpellWeaver",
            "title": "Arcane Adept",
            "timezone": "UTC",
            "hero_class": "mage_female",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "SpellWeaver"
    assert data["hero_class"] == "mage_female"

    # Check GET /me returns hero_class
    get_resp = await client.get("/api/v1/characters/me", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["hero_class"] == "mage_female"


@pytest.mark.asyncio
async def test_swap_hero_archetype(client: AsyncClient):
    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Onboard initial hero as vanguard_male
    await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={
            "username": "Swapper",
            "title": "Novice Adventurer",
            "timezone": "UTC",
            "hero_class": "vanguard_male",
        },
    )

    # 2. Update hero to ranger_female via /me/equip
    patch_resp = await client.patch(
        "/api/v1/characters/me/equip",
        headers=headers,
        json={"hero_class": "ranger_female"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["hero_class"] == "ranger_female"

    # 3. Verify persisted on re-fetch
    get_resp = await client.get("/api/v1/characters/me", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["hero_class"] == "ranger_female"


@pytest.mark.asyncio
async def test_quest_due_time_scheduling(client: AsyncClient):
    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    # Onboard character
    await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={
            "username": "ScheduleHero",
            "title": "Novice Adventurer",
            "timezone": "UTC",
            "hero_class": "rogue_male",
        },
    )

    # Create quest with due_time
    create_resp = await client.post(
        "/api/v1/quests",
        headers=headers,
        json={
            "title": "Morning Training",
            "category": "Strength",
            "difficulty": "MEDIUM",
            "recurrence": "DAILY",
            "due_time": "08:30",
        },
    )
    assert create_resp.status_code == 201
    q_data = create_resp.json()
    assert q_data["due_time"] == "08:30"
    quest_id = q_data["id"]

    # List quests and verify due_time is present
    list_resp = await client.get("/api/v1/quests", headers=headers)
    assert list_resp.status_code == 200
    quests = list_resp.json()
    matched = [q for q in quests if q["id"] == quest_id]
    assert len(matched) == 1
    assert matched[0]["due_time"] == "08:30"

    # Update due_time
    update_resp = await client.patch(
        f"/api/v1/quests/{quest_id}",
        headers=headers,
        json={"due_time": "09:15"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["due_time"] == "09:15"


@pytest.mark.asyncio
async def test_quest_invalid_due_time_fails():
    with pytest.raises(ValueError, match="due_time must be in 24-hour HH:MM format"):
        QuestCreate(
            title="Late Session",
            category="Intellect",
            difficulty=QuestDifficulty.EASY,
            due_time="25:99",
        )
