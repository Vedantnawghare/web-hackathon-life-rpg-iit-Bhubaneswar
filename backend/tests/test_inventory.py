import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.character import Character
from app.services.seed import seed_initial_catalog
from tests.test_auth import generate_test_jwt


@pytest.mark.asyncio
async def test_inventory_equipment_flow_and_slot_switching(client: AsyncClient, db_session):
    """
    Verifies that a character can view inventory, equip an owned item, switch items,
    and have the cosmetic slots updated on their character profile.
    """
    await seed_initial_catalog(db_session)

    user_id = uuid.uuid4()
    token = generate_test_jwt(user_id)
    headers = {"Authorization": f"Bearer {token}"}

    # Onboard
    await client.post(
        "/api/v1/characters/me/onboarding",
        headers=headers,
        json={"username": "FashionKnight", "timezone": "UTC"},
    )

    # Fund character
    char = (await db_session.execute(select(Character).where(Character.user_id == user_id))).scalar_one()
    char.gold = 1000
    await db_session.commit()

    # Purchase two different themes: abyssal dark (100g) and sunfire gold (250g)
    cat = (await client.get("/api/v1/shop/items", headers=headers)).json()
    abyssal = next(i for i in cat if i["code"] == "theme_abyssal_dark")
    sunfire = next(i for i in cat if i["code"] == "theme_sunfire_gold")

    p1 = await client.post(f"/api/v1/shop/items/{abyssal['id']}/purchase", headers=headers)
    inv_item1_id = p1.json()["inventory_item"]["id"]

    p2 = await client.post(f"/api/v1/shop/items/{sunfire['id']}/purchase", headers=headers)
    inv_item2_id = p2.json()["inventory_item"]["id"]

    # 1. Equip theme 1
    equip_res1 = await client.post(f"/api/v1/inventory/items/{inv_item1_id}/equip", headers=headers)
    assert equip_res1.status_code == 200
    assert equip_res1.json()["equipped_theme"] == "theme_abyssal_dark"

    # Verify inventory shows item 1 as equipped and item 2 as unequipped
    inv_res = await client.get("/api/v1/inventory", headers=headers)
    items_map = {i["id"]: i["is_equipped"] for i in inv_res.json()}
    assert items_map[inv_item1_id] is True
    assert items_map[inv_item2_id] is False

    # 2. Switch to theme 2
    equip_res2 = await client.post(f"/api/v1/inventory/items/{inv_item2_id}/equip", headers=headers)
    assert equip_res2.status_code == 200
    assert equip_res2.json()["equipped_theme"] == "theme_sunfire_gold"

    # Verify inventory updated
    inv_res2 = await client.get("/api/v1/inventory", headers=headers)
    items_map2 = {i["id"]: i["is_equipped"] for i in inv_res2.json()}
    assert items_map2[inv_item1_id] is False
    assert items_map2[inv_item2_id] is True

    # 3. Unequip item 2 -> reverts to default_slate
    unequip_res = await client.post(f"/api/v1/inventory/items/{inv_item2_id}/unequip", headers=headers)
    assert unequip_res.status_code == 200
    assert unequip_res.json()["equipped_theme"] == "default_slate"


@pytest.mark.asyncio
async def test_equipping_unowned_or_foreign_item_fails(client: AsyncClient, db_session):
    """
    Verifies that a user cannot equip an item they do not own (e.g. random UUID or foreign user's item).
    """
    await seed_initial_catalog(db_session)

    # User 1
    u1 = uuid.uuid4()
    h1 = {"Authorization": f"Bearer {generate_test_jwt(u1)}"}
    await client.post("/api/v1/characters/me/onboarding", headers=h1, json={"username": "UserOne"})
    c1 = (await db_session.execute(select(Character).where(Character.user_id == u1))).scalar_one()
    c1.gold = 500
    await db_session.commit()

    # User 2
    u2 = uuid.uuid4()
    h2 = {"Authorization": f"Bearer {generate_test_jwt(u2)}"}
    await client.post("/api/v1/characters/me/onboarding", headers=h2, json={"username": "UserTwo"})

    # User 1 purchases item
    cat = (await client.get("/api/v1/shop/items", headers=h1)).json()
    p = await client.post(f"/api/v1/shop/items/{cat[0]['id']}/purchase", headers=h1)
    u1_inv_id = p.json()["inventory_item"]["id"]

    # User 2 attempts to equip User 1's inventory item -> 404 Not Found
    res = await client.post(f"/api/v1/inventory/items/{u1_inv_id}/equip", headers=h2)
    assert res.status_code == 404
    assert res.json()["code"] == "ITEM_NOT_OWNED"

    # User 2 attempts to equip random UUID -> 404 Not Found
    res_fake = await client.post(f"/api/v1/inventory/items/{uuid.uuid4()}/equip", headers=h2)
    assert res_fake.status_code == 404
