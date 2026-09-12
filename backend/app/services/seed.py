from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.enums import ShopItemType
from app.models.shop_item import ShopItem
from app.models.achievement import Achievement

INITIAL_SHOP_ITEMS: List[Dict[str, Any]] = [
    # Themes
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
        "code": "theme_emerald_forest",
        "name": "Emerald Wilds Theme",
        "description": "Lush verdant aesthetic humming with ancient forest magic.",
        "item_type": ShopItemType.THEME,
        "cost_gold": 150,
        "asset_key": "theme_emerald_forest",
        "is_active": True,
    },
    {
        "code": "theme_arcane_violet",
        "name": "Arcane Void Theme",
        "description": "Deep ethereal purple styling reserved for master enchanters.",
        "item_type": ShopItemType.THEME,
        "cost_gold": 300,
        "asset_key": "theme_arcane_violet",
        "is_active": True,
    },
    # Avatar Frames
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
        "code": "frame_celestial_gold",
        "name": "Celestial Sun Crest",
        "description": "A golden halo of light forged from solar fragments.",
        "item_type": ShopItemType.AVATAR_FRAME,
        "cost_gold": 350,
        "asset_key": "frame_celestial_gold",
        "is_active": True,
    },
    # Badges
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
        "code": "badge_phoenix_crest",
        "name": "Phoenix Crest",
        "description": "Symbol of relentless rebirth and undefeated persistence.",
        "item_type": ShopItemType.BADGE,
        "cost_gold": 120,
        "asset_key": "badge_phoenix_crest",
        "is_active": True,
    },
    # Titles
    {
        "code": "title_scholar_of_arcana",
        "name": "Scholar of Arcana",
        "description": "Prefix bestowed upon relentless seekers of knowledge.",
        "item_type": ShopItemType.TITLE,
        "cost_gold": 150,
        "asset_key": "title_scholar_of_arcana",
        "is_active": True,
    },
    {
        "code": "title_shadow_walker",
        "name": "Shadow Walker",
        "description": "Title earned by silent masters of disciplined habits.",
        "item_type": ShopItemType.TITLE,
        "cost_gold": 220,
        "asset_key": "title_shadow_walker",
        "is_active": True,
    },
    # Cosmetics
    {
        "code": "cosmetic_mystic_cloak",
        "name": "Mystic Cloak of Will",
        "description": "Woven with silver thread to ward off procrastination.",
        "item_type": ShopItemType.COSMETIC,
        "cost_gold": 180,
        "asset_key": "cosmetic_mystic_cloak",
        "is_active": True,
    },
]

INITIAL_ACHIEVEMENTS: List[Dict[str, Any]] = [
    {
        "code": "FIRST_QUEST",
        "title": "First Step of the Journey",
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
        "code": "LEVEL_5",
        "title": "Path of Mastery",
        "description": "Attain Character Level 5 through disciplined dedication.",
        "category": "Progression",
        "icon_name": "crown",
        "condition_type": "LEVEL",
        "condition_threshold": 5,
        "reward_xp": 150,
        "reward_gold": 100,
        "reward_title": "Journeyman",
    },
    {
        "code": "LEVEL_10",
        "title": "Paragon of Will",
        "description": "Ascend to Character Level 10 among the realm's elites.",
        "category": "Progression",
        "icon_name": "sparkles",
        "condition_type": "LEVEL",
        "condition_threshold": 10,
        "reward_xp": 400,
        "reward_gold": 250,
        "reward_title": "Paragon",
    },
    {
        "code": "STREAK_7",
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
        "code": "STREAK_30",
        "title": "Iron Resolve",
        "description": "Achieve an extraordinary 30-day streak of relentless consistency.",
        "category": "Streaks",
        "icon_name": "zap",
        "condition_type": "STREAK",
        "condition_threshold": 30,
        "reward_xp": 800,
        "reward_gold": 500,
        "reward_title": "Ironclad",
    },
    {
        "code": "QUESTS_10",
        "title": "Tenacious Slayer",
        "description": "Complete 10 total quests across your adventures.",
        "category": "Quests",
        "icon_name": "shield",
        "condition_type": "QUEST_COUNT",
        "condition_threshold": 10,
        "reward_xp": 100,
        "reward_gold": 50,
        "reward_title": "Adventurer",
    },
    {
        "code": "QUESTS_50",
        "title": "Dungeon Sweeper",
        "description": "Complete 50 total quests across your adventures.",
        "category": "Quests",
        "icon_name": "target",
        "condition_type": "QUEST_COUNT",
        "condition_threshold": 50,
        "reward_xp": 500,
        "reward_gold": 350,
        "reward_title": "Veteran",
    },
    {
        "code": "QUESTS_100",
        "title": "Legendary Conqueror",
        "description": "Complete 100 total quests, cementing your immortal status.",
        "category": "Quests",
        "icon_name": "trophy",
        "condition_type": "QUEST_COUNT",
        "condition_threshold": 100,
        "reward_xp": 1500,
        "reward_gold": 1000,
        "reward_title": "Legend",
    },
    {
        "code": "XP_1000",
        "title": "Novice Awakening",
        "description": "Accumulate 1,000 total lifetime Experience Points.",
        "category": "Progression",
        "icon_name": "compass",
        "condition_type": "XP",
        "condition_threshold": 1000,
        "reward_xp": 100,
        "reward_gold": 75,
        "reward_title": None,
    },
    {
        "code": "XP_5000",
        "title": "Ascended Soul",
        "description": "Accumulate 5,000 total lifetime Experience Points.",
        "category": "Progression",
        "icon_name": "star",
        "condition_type": "XP",
        "condition_threshold": 5000,
        "reward_xp": 600,
        "reward_gold": 400,
        "reward_title": "Ascended",
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
