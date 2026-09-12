import pytest
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.shop_item import ShopItem
from app.models.achievement import Achievement
from app.services.seed import seed_initial_catalog


@pytest.mark.asyncio
async def test_seed_initial_catalog_idempotency(db_session: AsyncSession):
    # First seed run
    result1 = await seed_initial_catalog(db_session)
    assert result1["seeded_shop_items"] > 0
    assert result1["seeded_achievements"] > 0

    # Count rows in database
    shop_count_res = await db_session.execute(select(func.count(ShopItem.id)))
    shop_count = shop_count_res.scalar_one()
    assert shop_count == result1["seeded_shop_items"]

    ach_count_res = await db_session.execute(select(func.count(Achievement.id)))
    ach_count = ach_count_res.scalar_one()
    assert ach_count == result1["seeded_achievements"]

    # Second seed run (idempotent)
    result2 = await seed_initial_catalog(db_session)
    assert result2["seeded_shop_items"] == 0
    assert result2["seeded_achievements"] == 0
