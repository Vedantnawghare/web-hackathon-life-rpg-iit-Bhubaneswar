from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.enums import ShopItemType
from app.models.shop_item import ShopItem
from app.models.achievement import Achievement

INITIAL_SHOP_ITEMS: List[Dict[str, Any]] = [
    {
        "code": "theme_abyssal_dark",
        "name": "Abyssal Dark Theme",
        "description": "A deep obsidian theme glowing with subtle arcane runes.",
        "item_type": ShopItemType.THEME,
        "cost_gold": 100,
        "asset_key": "theme_abyssal_dark",
        "is_active": True,
    },
    {
        "code": "theme_sunfire_gold",
        "name": "Sunfire Gold Theme",
        "description": "A radiant theme illuminated by golden paladin light.",
        "item_type": ShopItemType.THEME,
        "cost_gold": 250,
        "asset_key": "theme_sunfire_gold",
        "is_active": True,
    },
    {
        "code": "frame_bronze_laurel",
        "name": "Bronze Laurel Frame",
        "description": "An adorned bronze wreath framing your avatar.",
        "item_type": ShopItemType.AVATAR_FRAME,
        "cost_gold": 50,
        "asset_key": "frame_bronze_laurel",
        "is_active": True,
    },
    {
        "code": "frame_obsidian_spikes",
        "name": "Obsidian Spikes Frame",
        "description": "Forged in dungeon depths with jagged obsidian shards.",
        "item_type": ShopItemType.AVATAR_FRAME,
        "cost_gold": 200,
        "asset_key": "frame_obsidian_spikes",
        "is_active": True,
    },
    {
        "code": "badge_founder_sigil",
        "name": "Founder Sigil",
        "description": "Exclusive emblem honoring pioneer adventurers.",
        "item_type": ShopItemType.BADGE,
        "cost_gold": 25,
        "asset_key": "badge_founder_sigil",
        "is_active": True,
    },
    {
        "code": "title_scholar_of_arcana",
        "name": "Title: Scholar of Arcana",
        "description": "Prefix bestowed upon relentless seekers of knowledge.",
        "item_type": ShopItemType.TITLE,
        "cost_gold": 150,
        "asset_key": "title_scholar_of_arcana",
        "is_active": True,
    },
]

INITIAL_ACHIEVEMENTS: List[Dict[str, Any]] = [
    {
        "code": "first_quest_cleared",
        "title": "First Blood",
        "description": "Successfully clear your very first real-world quest.",
        "category": "Quests",
        "icon_name": "sword",
        "condition_type": "QUEST_COUNT",
        "condition_threshold": 1,
        "reward_xp": 50,
        "reward_gold": 25,
        "reward_title": "Initiate",
    },
    {
        "code": "reach_level_5",
        "title": "Path of Mastery",
        "description": "Attain Character Level 5 through consistent discipline.",
        "category": "Progression",
        "icon_name": "crown",
        "condition_type": "LEVEL",
        "condition_threshold": 5,
        "reward_xp": 150,
        "reward_gold": 100,
        "reward_title": "Journeyman",
    },
    {
        "code": "streak_7_days",
        "title": "Unwavering Will",
        "description": "Maintain a 7-day uninterrupted quest streak.",
        "category": "Streaks",
        "icon_name": "flame",
        "condition_type": "STREAK",
        "condition_threshold": 7,
        "reward_xp": 200,
        "reward_gold": 150,
        "reward_title": "Steadfast",
    },
    {
        "code": "quests_cleared_25",
        "title": "Dungeon Sweeper",
        "description": "Complete 25 total quests across your journey.",
        "category": "Quests",
        "icon_name": "shield",
        "condition_type": "QUEST_COUNT",
        "condition_threshold": 25,
        "reward_xp": 300,
        "reward_gold": 200,
        "reward_title": "Veteran",
    },
]


async def seed_initial_catalog(db: AsyncSession) -> Dict[str, int]:
    """
    Idempotently seeds initial Shop items and Achievement milestones into PostgreSQL.
    """
    seeded_shop_count = 0
    seeded_achievement_count = 0

    # 1. Seed Shop Items
    for item_data in INITIAL_SHOP_ITEMS:
        stmt = select(ShopItem).where(ShopItem.code == item_data["code"])
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        if not existing:
            shop_item = ShopItem(**item_data)
            db.add(shop_item)
            seeded_shop_count += 1

    # 2. Seed Achievements
    for ach_data in INITIAL_ACHIEVEMENTS:
        stmt = select(Achievement).where(Achievement.code == ach_data["code"])
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        if not existing:
            achievement = Achievement(**ach_data)
            db.add(achievement)
            seeded_achievement_count += 1

    if seeded_shop_count > 0 or seeded_achievement_count > 0:
        await db.commit()

    return {
        "seeded_shop_items": seeded_shop_count,
        "seeded_achievements": seeded_achievement_count,
    }
