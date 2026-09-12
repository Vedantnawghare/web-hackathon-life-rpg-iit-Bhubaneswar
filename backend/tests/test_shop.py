import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.core.database import Base
from app.models.character import Character
from app.models.shop_item import ShopItem
from app.services.seed import seed_initial_catalog
from tests.test_auth import generate_test_jwt


@pytest.mark.asyncio
async def test_shop_catalog_listing_and_successful_purchase(client: AsyncClient, db_session):
    """
    Verifies that active shop items are returned and can be purchased when funds are sufficient.
    """
    # Seed initial items
    await seed_initial_catalog(db_session)

    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    # Onboard
    await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={"username": "WealthyPaladin", "timezone": "UTC"},
    )

    # Credit gold directly to character for test
    char_stmt = select(Character).where(Character.user_id == user_id)
    char = (await db_session.execute(char_stmt)).scalar_one()
    char.gold = 500
    await db_session.commit()

    # 1. Fetch catalog
    res_catalog = await client.get("/api/v1/shop/items", headers=headers)
    assert res_catalog.status_code == 200
    items = res_catalog.json()
    assert len(items) > 0

    # Pick bronze laurel frame (costs 50 Gold)
    target_item = next(i for i in items if i["code"] == "frame_bronze_laurel")
    item_id = target_item["id"]
    cost = target_item["cost_gold"]

    # 2. Purchase item
    res_purchase = await client.post(f"/api/v1/shop/items/{item_id}/purchase", headers=headers)
    assert res_purchase.status_code == 200
    p_data = res_purchase.json()

    assert p_data["previous_gold"] == 500
    assert p_data["gold_spent"] == cost
    assert p_data["remaining_gold"] == 500 - cost
    assert p_data["newly_owned"] is True
    assert p_data["inventory_item"]["shop_item"]["code"] == "frame_bronze_laurel"

    # 3. Verify character profile reflects new authoritative gold
    char_res = await client.get("/api/v1/characters/me", headers=headers)
    assert char_res.json()["gold"] == 500 - cost

    # 4. Verify item is in inventory
    inv_res = await client.get("/api/v1/inventory", headers=headers)
    assert inv_res.status_code == 200
    inv_items = inv_res.json()
    assert any(i["shop_item_id"] == item_id for i in inv_items)


@pytest.mark.asyncio
async def test_shop_purchase_insufficient_gold_fails(client: AsyncClient, db_session):
    """
    Verifies that attempting to purchase without sufficient gold returns 400 Bad Request
    and prevents negative gold balances.
    """
    await seed_initial_catalog(db_session)

    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    # Onboard (starts with 0 gold)
    await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={"username": "PennilessRogue", "timezone": "UTC"},
    )

    # Fetch catalog
    res_catalog = await client.get("/api/v1/shop/items", headers=headers)
    target_item = res_catalog.json()[0]

    # Attempt purchase with 0 gold
    res_purchase = await client.post(
        f"/api/v1/shop/items/{target_item['id']}/purchase",
        headers=headers,
    )
    assert res_purchase.status_code == 400
    assert res_purchase.json()["code"] == "INSUFFICIENT_GOLD"

    # Gold remains 0
    char_res = await client.get("/api/v1/characters/me", headers=headers)
    assert char_res.json()["gold"] == 0


@pytest.mark.asyncio
async def test_shop_duplicate_purchase_rejected(client: AsyncClient, db_session):
    """
    Verifies that purchasing a cosmetic already owned returns 409 Conflict.
    """
    await seed_initial_catalog(db_session)

    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={"username": "DuplicateCollector", "timezone": "UTC"},
    )

    # Give gold
    char = (await db_session.execute(select(Character).where(Character.user_id == user_id))).scalar_one()
    char.gold = 1000
    await db_session.commit()

    res_catalog = await client.get("/api/v1/shop/items", headers=headers)
    item_id = res_catalog.json()[0]["id"]
    cost = res_catalog.json()[0]["cost_gold"]

    # First purchase succeeds
    res1 = await client.post(f"/api/v1/shop/items/{item_id}/purchase", headers=headers)
    assert res1.status_code == 200

    # Second purchase fails with 409 Conflict
    res2 = await client.post(f"/api/v1/shop/items/{item_id}/purchase", headers=headers)
    assert res2.status_code == 409
    assert res2.json()["code"] == "ITEM_ALREADY_OWNED"

    # Gold was only deducted once
    char_res = await client.get("/api/v1/characters/me", headers=headers)
    assert char_res.json()["gold"] == 1000 - cost


@pytest.mark.asyncio
async def test_shop_unauthorized_nonexistent_item_fails(client: AsyncClient):
    """
    Verifies that purchasing a non-existent item returns 404 Not Found.
    """
    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={"username": "LostShopper", "timezone": "UTC"},
    )

    fake_id = uuid.uuid4()
    res = await client.post(f"/api/v1/shop/items/{fake_id}/purchase", headers=headers)
    assert res.status_code == 404
    assert res.json()["code"] == "ITEM_NOT_FOUND"


@pytest.mark.asyncio
async def test_concurrent_shop_purchases_no_duplicate_item(concurrency_client: AsyncClient):
    """
    Simulates concurrent purchase attempts fired at the exact same moment.
    Verifies that pessimistic locking & unique constraints guarantee:
    1. Exactly ONE purchase succeeds (200 OK).
    2. The second attempt fails with 409 Conflict (ITEM_ALREADY_OWNED).
    3. Gold is deducted exactly once.
    """
    import asyncio

    client = concurrency_client
    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    # Onboard
    await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={"username": "ConcurrentBuyer", "timezone": "UTC"},
    )

    # Seed catalog via API / directly
    # Earn gold through HARD quest completion
    res_quest = await client.post(
        "/api/v1/quests",
        headers=headers,
        json={
            "title": "Conquer Grand Trial",
            "category": "Coding",
            "difficulty": "EPIC",
            "recurrence": "DAILY",
        },
    )
    # Complete quest -> earns 150 gold
    await client.post(f"/api/v1/quests/{res_quest.json()['id']}/complete", headers=headers)

    # Fetch catalog items
    res_cat = await client.get("/api/v1/shop/items", headers=headers)
    items = res_cat.json()
    # Founder Sigil costs 25 gold
    sigil = next(i for i in items if i["code"] == "badge_founder_sigil")
    sigil_id = sigil["id"]
    sigil_cost = sigil["cost_gold"]

    # Initial gold before purchases
    char_before = (await client.get("/api/v1/characters/me", headers=headers)).json()
    initial_gold = char_before["gold"]

    # Fire 2 concurrent purchase requests
    async def attempt_buy():
        return await client.post(f"/api/v1/shop/items/{sigil_id}/purchase", headers=headers)

    responses = await asyncio.gather(attempt_buy(), attempt_buy())
    status_codes = [r.status_code for r in responses]

    successes = [s for s in status_codes if s == 200]
    conflicts = [c for c in status_codes if c == 409]

    assert len(successes) == 1, f"Expected 1 success, got statuses: {status_codes}"
    assert len(conflicts) == 1, f"Expected 1 conflict, got statuses: {status_codes}"

    # Verify authoritative gold
    char_after = (await client.get("/api/v1/characters/me", headers=headers)).json()
    assert char_after["gold"] == initial_gold - sigil_cost

    # Verify inventory has exactly 1 entry for this item
    inv_res = await client.get("/api/v1/inventory", headers=headers)
    owned = [i for i in inv_res.json() if i["shop_item_id"] == sigil_id]
    assert len(owned) == 1
