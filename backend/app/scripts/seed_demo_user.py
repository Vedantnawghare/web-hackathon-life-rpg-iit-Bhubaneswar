"""
Authoritative Hackathon Demo User Seeder.
Creates or resets a dedicated demo user in Supabase Auth & PostgreSQL with:
- 7 days of realistic multi-day historical quest activity + today
- Authoritative XP progression, level rollovers, and attribute gains
- Real streak (8 consecutive active days)
- Realistic inventory items and equipped cosmetics
- Unlocked achievements
- Today's active boss battle state (4 daily tasks, 2 completed, Boss at 50/100 HP)
"""

import asyncio
import math
import uuid
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo
from sqlalchemy import select, delete, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.enums import QuestDifficulty, CharacterAttribute, QuestStatus, QuestRecurrence
from app.models.character import Character
from app.models.quest import Quest
from app.models.quest_completion import QuestCompletion
from app.models.streak import Streak
from app.models.shop_item import ShopItem
from app.models.inventory_item import InventoryItem
from app.models.achievement import Achievement
from app.models.character_achievement import CharacterAchievement
from app.services.rpg_engine import apply_xp_gain, get_difficulty_rewards
from app.services.streak_service import calculate_streak_multiplier
from app.services.seed import seed_initial_catalog

import os

DEMO_EMAIL = os.getenv("DEMO_USER_EMAIL", "demo_hero@liferpg.dev")
DEMO_PASS = os.getenv("DEMO_USER_PASSWORD", "DemoHero2026!")
DEMO_USERNAME = "ValenIronheart"
DEMO_TITLE = "The Unbroken Vanguard"
DEMO_HERO_CLASS = "vanguard_male"
DEMO_TIMEZONE = "Asia/Kolkata"

# Multi-day quest specification: 7 historical days + today
# Each day contains varying difficulties, categories, attributes, and completion statuses
HISTORICAL_SCHEDULE = [
    {
        "day_offset": -7,  # 7 days ago (Sunday)
        "tasks": [
            {
                "title": "Morning 30m Zone-2 Cardio Run",
                "category": "Health",
                "attribute": CharacterAttribute.VITALITY,
                "difficulty": QuestDifficulty.MEDIUM,
                "completed": True,
                "time": time(7, 30),
            },
            {
                "title": "Deep Focus Reading — Computer Systems Architecture",
                "category": "Academics",
                "attribute": CharacterAttribute.INTELLECT,
                "difficulty": QuestDifficulty.HARD,
                "completed": True,
                "time": time(11, 15),
            },
            {
                "title": "Evening Room Tidying & Workspace Reset",
                "category": "Discipline",
                "attribute": CharacterAttribute.DISCIPLINE,
                "difficulty": QuestDifficulty.EASY,
                "completed": True,
                "time": time(20, 0),
            },
            {
                "title": "Sketch 3 Character Silhouette Thumbnails",
                "category": "Creative",
                "attribute": CharacterAttribute.CREATIVITY,
                "difficulty": QuestDifficulty.MEDIUM,
                "completed": False,
            },
        ],
    },
    {
        "day_offset": -6,  # 6 days ago (Monday)
        "tasks": [
            {
                "title": "LeetCode Dynamic Programming & Trees (3 Problems)",
                "category": "Academics",
                "attribute": CharacterAttribute.INTELLECT,
                "difficulty": QuestDifficulty.HARD,
                "completed": True,
                "time": time(9, 45),
            },
            {
                "title": "Gym Heavy Upper Body Push Session",
                "category": "Health",
                "attribute": CharacterAttribute.STRENGTH,
                "difficulty": QuestDifficulty.HARD,
                "completed": True,
                "time": time(14, 30),
            },
            {
                "title": "Prepare High-Protein Mediterranean Lunch",
                "category": "Health",
                "attribute": CharacterAttribute.VITALITY,
                "difficulty": QuestDifficulty.EASY,
                "completed": True,
                "time": time(12, 45),
            },
            {
                "title": "Inbox Zero & Project Sprint Prioritization",
                "category": "Discipline",
                "attribute": CharacterAttribute.DISCIPLINE,
                "difficulty": QuestDifficulty.EASY,
                "completed": True,
                "time": time(17, 10),
            },
            {
                "title": "Draft RPG Character Lore & Backstory Snippet",
                "category": "Creative",
                "attribute": CharacterAttribute.CREATIVITY,
                "difficulty": QuestDifficulty.MEDIUM,
                "completed": True,
                "time": time(21, 30),
            },
        ],
    },
    {
        "day_offset": -5,  # 5 days ago (Tuesday)
        "tasks": [
            {
                "title": "PostgreSQL Query Optimization & Indexing Deep Dive",
                "category": "Academics",
                "attribute": CharacterAttribute.INTELLECT,
                "difficulty": QuestDifficulty.HARD,
                "completed": True,
                "time": time(10, 30),
            },
            {
                "title": "Core Stability & Hip Mobility Routine",
                "category": "Health",
                "attribute": CharacterAttribute.VITALITY,
                "difficulty": QuestDifficulty.MEDIUM,
                "completed": True,
                "time": time(16, 0),
            },
            {
                "title": "Draw Boss Arena Environmental Concept Art",
                "category": "Creative",
                "attribute": CharacterAttribute.CREATIVITY,
                "difficulty": QuestDifficulty.HARD,
                "completed": False,
            },
        ],
    },
    {
        "day_offset": -4,  # 4 days ago (Wednesday)
        "tasks": [
            {
                "title": "Full Body Deadlift & Compound Pull Workout",
                "category": "Health",
                "attribute": CharacterAttribute.STRENGTH,
                "difficulty": QuestDifficulty.EPIC,
                "completed": True,
                "time": time(8, 0),
            },
            {
                "title": "Study Distributed Consensus Protocols (Raft & Paxos)",
                "category": "Academics",
                "attribute": CharacterAttribute.INTELLECT,
                "difficulty": QuestDifficulty.HARD,
                "completed": True,
                "time": time(13, 15),
            },
            {
                "title": "Mindful 20m Vipassana Meditation",
                "category": "Discipline",
                "attribute": CharacterAttribute.DISCIPLINE,
                "difficulty": QuestDifficulty.EASY,
                "completed": True,
                "time": time(18, 45),
            },
            {
                "title": "Drink 3.5 Liters Water Throughout the Day",
                "category": "Health",
                "attribute": CharacterAttribute.VITALITY,
                "difficulty": QuestDifficulty.EASY,
                "completed": True,
                "time": time(21, 0),
            },
        ],
    },
    {
        "day_offset": -3,  # 3 days ago (Thursday)
        "tasks": [
            {
                "title": "Build Async Fast-API Pipeline with WebSockets",
                "category": "Academics",
                "attribute": CharacterAttribute.INTELLECT,
                "difficulty": QuestDifficulty.HARD,
                "completed": True,
                "time": time(9, 30),
            },
            {
                "title": "5-Mile Interval Track Sprint Workout",
                "category": "Health",
                "attribute": CharacterAttribute.STRENGTH,
                "difficulty": QuestDifficulty.HARD,
                "completed": True,
                "time": time(15, 0),
            },
            {
                "title": "Strict 16/8 Intermittent Fasting Window",
                "category": "Discipline",
                "attribute": CharacterAttribute.DISCIPLINE,
                "difficulty": QuestDifficulty.MEDIUM,
                "completed": True,
                "time": time(12, 0),
            },
            {
                "title": "Cold Shower & Wim Hof Breathing Reset",
                "category": "Health",
                "attribute": CharacterAttribute.VITALITY,
                "difficulty": QuestDifficulty.EASY,
                "completed": True,
                "time": time(7, 45),
            },
            {
                "title": "Write Interactive NPC Dialogue Branching Tree",
                "category": "Creative",
                "attribute": CharacterAttribute.CREATIVITY,
                "difficulty": QuestDifficulty.MEDIUM,
                "completed": True,
                "time": time(20, 30),
            },
            {
                "title": "Read 2 Research Papers on Multi-Agent Reasoning",
                "category": "Academics",
                "attribute": CharacterAttribute.INTELLECT,
                "difficulty": QuestDifficulty.HARD,
                "completed": False,
            },
        ],
    },
    {
        "day_offset": -2,  # 2 days ago (Friday)
        "tasks": [
            {
                "title": "Heavy Kettlebell Swings & Turkish Get-ups (5 Sets)",
                "category": "Health",
                "attribute": CharacterAttribute.STRENGTH,
                "difficulty": QuestDifficulty.MEDIUM,
                "completed": True,
                "time": time(8, 30),
            },
            {
                "title": "Study Three.js Custom GLSL Shaders & PBR Lighting",
                "category": "Academics",
                "attribute": CharacterAttribute.INTELLECT,
                "difficulty": QuestDifficulty.HARD,
                "completed": True,
                "time": time(14, 0),
            },
            {
                "title": "Evening Screen-Free Wind Down at 10 PM",
                "category": "Discipline",
                "attribute": CharacterAttribute.DISCIPLINE,
                "difficulty": QuestDifficulty.EASY,
                "completed": True,
                "time": time(22, 0),
            },
            {
                "title": "Compose Ambient Dungeon Synth Audio Track",
                "category": "Creative",
                "attribute": CharacterAttribute.CREATIVITY,
                "difficulty": QuestDifficulty.HARD,
                "completed": False,
            },
        ],
    },
    {
        "day_offset": -1,  # 1 day ago (Saturday)
        "tasks": [
            {
                "title": "System Architecture & Security Audit Review",
                "category": "Academics",
                "attribute": CharacterAttribute.INTELLECT,
                "difficulty": QuestDifficulty.HARD,
                "completed": True,
                "time": time(10, 0),
            },
            {
                "title": "High-Volume Calisthenics & Weighted Pull-ups",
                "category": "Health",
                "attribute": CharacterAttribute.STRENGTH,
                "difficulty": QuestDifficulty.HARD,
                "completed": True,
                "time": time(12, 30),
            },
            {
                "title": "Clean Cooking & Micronutrient-Dense Meal Prep",
                "category": "Health",
                "attribute": CharacterAttribute.VITALITY,
                "difficulty": QuestDifficulty.MEDIUM,
                "completed": True,
                "time": time(16, 45),
            },
            {
                "title": "Daily Reflection & Hackathon Milestone Journaling",
                "category": "Discipline",
                "attribute": CharacterAttribute.DISCIPLINE,
                "difficulty": QuestDifficulty.EASY,
                "completed": True,
                "time": time(19, 15),
            },
            {
                "title": "Synthesize Boss Laser & Impact SFX Audio Effects",
                "category": "Creative",
                "attribute": CharacterAttribute.CREATIVITY,
                "difficulty": QuestDifficulty.MEDIUM,
                "completed": True,
                "time": time(21, 0),
            },
        ],
    },
    {
        "day_offset": 0,  # Today (Sunday)
        # 4 Daily recurring quests: 2 completed, 2 incomplete -> Boss at 50 / 100 HP!
        "tasks": [
            {
                "title": "Study Deep Learning & Transformers (1 Hour)",
                "category": "Academics",
                "attribute": CharacterAttribute.INTELLECT,
                "difficulty": QuestDifficulty.HARD,
                "recurrence": QuestRecurrence.DAILY,
                "completed": True,
                "time": time(10, 0),
            },
            {
                "title": "Gym Heavy Squat & Core Circuit",
                "category": "Health",
                "attribute": CharacterAttribute.STRENGTH,
                "difficulty": QuestDifficulty.HARD,
                "recurrence": QuestRecurrence.DAILY,
                "completed": True,
                "time": time(14, 0),
            },
            {
                "title": "Drink 3 Liters Mineral Water & Electrolytes",
                "category": "Health",
                "attribute": CharacterAttribute.VITALITY,
                "difficulty": QuestDifficulty.MEDIUM,
                "recurrence": QuestRecurrence.DAILY,
                "completed": False,
            },
            {
                "title": "Deep Focus Code Review & Refactoring",
                "category": "Engineering",
                "attribute": CharacterAttribute.DISCIPLINE,
                "difficulty": QuestDifficulty.MEDIUM,
                "recurrence": QuestRecurrence.DAILY,
                "completed": False,
            },
        ],
    },
]


async def seed_demo_account():
    print("=" * 60)
    print("STARTING HACKATHON DEMO USER AUTHORITATIVE SEEDING")
    print("=" * 60)

    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    # 1. Ensure Demo Auth User exists in Supabase auth.users FIRST
    print("[1/8] Setting up Supabase Auth user:", DEMO_EMAIL, flush=True)
    async with engine.begin() as raw_conn:
        res = await raw_conn.execute(
            text("SELECT id FROM auth.users WHERE email = :email"),
            {"email": DEMO_EMAIL},
        )
        auth_row = res.fetchone()
        if not auth_row:
            user_id = uuid.uuid4()
            await raw_conn.execute(
                text("""
                    INSERT INTO auth.users (
                        id, instance_id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at
                    ) VALUES (
                        :id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
                        :email, crypt(:pwd, gen_salt('bf')),
                        now(), '{"provider":"email","providers":["email"]}'::jsonb,
                        json_build_object('username', CAST(:username AS text), 'sub', CAST(:id_str AS text))::jsonb,
                        now(), now()
                    )
                """),
                {
                    "id": user_id,
                    "email": DEMO_EMAIL,
                    "pwd": DEMO_PASS,
                    "username": DEMO_USERNAME,
                    "id_str": str(user_id),
                },
            )
            print(f"  Created new auth user: {user_id}", flush=True)
        else:
            user_id = auth_row[0]
            await raw_conn.execute(
                text("""
                    UPDATE auth.users
                    SET encrypted_password = crypt(:pwd, gen_salt('bf')),
                        email_confirmed_at = COALESCE(email_confirmed_at, now()),
                        raw_user_meta_data = json_build_object('username', CAST(:username AS text), 'sub', CAST(:id_str AS text))::jsonb,
                        updated_at = now()
                    WHERE id = :id
                """),
                {
                    "id": user_id,
                    "pwd": DEMO_PASS,
                    "username": DEMO_USERNAME,
                    "id_str": str(user_id),
                },
            )
            print(f"  Updated existing auth user credentials: {user_id}", flush=True)

    async with async_session() as db:
        # 2. Ensure shop catalog and achievements catalog are seeded
        print("[2/8] Ensuring Shop & Achievement catalogs exist...", flush=True)
        await seed_initial_catalog(db)

        # 3. Lookup or create Character
        print("[3/8] Resolving Character row for user_id:", user_id, flush=True)
        stmt = select(Character).where(Character.user_id == user_id)
        char_res = await db.execute(stmt)
        character = char_res.scalar_one_or_none()

        if not character:
            character = Character(
                user_id=user_id,
                username=DEMO_USERNAME,
                title=DEMO_TITLE,
                hero_class=DEMO_HERO_CLASS,
                timezone=DEMO_TIMEZONE,
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
                equipped_theme="default_slate",
                equipped_frame="default_frame",
                equipped_badge="novice_badge",
            )
            db.add(character)
            await db.flush()
            print(f"  Created Character record: {character.id}")
        else:
            character.username = DEMO_USERNAME
            character.title = DEMO_TITLE
            character.hero_class = DEMO_HERO_CLASS
            character.timezone = DEMO_TIMEZONE
            # Reset progression stats to baseline before simulation
            character.current_level = 1
            character.lifetime_xp = 0
            character.xp_into_current_level = 0
            character.xp_required_for_next_level = 100
            character.gold = 0
            character.strength = 10
            character.intellect = 10
            character.discipline = 10
            character.vitality = 10
            character.creativity = 10
            print(f"  Reset existing Character baseline: {character.id}")

        char_id = character.id

        # 3. Clean existing child tables for clean idempotent re-seed
        print("[4/8] Purging existing completions, quests, inventory, and achievements...")
        await db.execute(delete(QuestCompletion).where(QuestCompletion.character_id == char_id))
        await db.execute(delete(Quest).where(Quest.character_id == char_id))
        await db.execute(delete(InventoryItem).where(InventoryItem.character_id == char_id))
        await db.execute(delete(CharacterAchievement).where(CharacterAchievement.character_id == char_id))
        await db.execute(delete(Streak).where(Streak.character_id == char_id))
        await db.commit()

        # Re-fetch character into session
        char_res = await db.execute(select(Character).where(Character.id == char_id))
        character = char_res.scalar_one()

        # 4. Simulate historical activity day by day
        print("[5/8] Simulating multi-day historical schedule with authoritative RPG engine...")
        # Ensure we use Asia/Kolkata timezone anchor
        tz = ZoneInfo(DEMO_TIMEZONE)
        now_tz = datetime.now(tz)
        today_local = now_tz.date()
        print(f"  Today in {DEMO_TIMEZONE} is: {today_local}")

        current_streak = 0
        longest_streak = 0
        last_activity_date = None
        total_completed_quests = 0

        created_today_quests = []

        for day_entry in HISTORICAL_SCHEDULE:
            day_offset = day_entry["day_offset"]
            target_date = today_local + timedelta(days=day_offset)
            iso_year, iso_week, _ = target_date.isocalendar()
            day_has_completion = False

            print(f"  Processing Day {day_offset} ({target_date}) with {len(day_entry['tasks'])} tasks...")

            for task_data in day_entry["tasks"]:
                diff = task_data["difficulty"]
                rewards = get_difficulty_rewards(diff)
                recurrence = task_data.get("recurrence", QuestRecurrence.DAILY if day_offset == 0 else QuestRecurrence.NONE)

                # Create the Quest row
                quest = Quest(
                    character_id=char_id,
                    title=task_data["title"],
                    description=f"Standard guild assignment for {task_data['category']} mastery.",
                    category=task_data["category"],
                    difficulty=diff,
                    primary_attribute=task_data["attribute"],
                    base_xp=rewards["base_xp"],
                    base_gold=rewards["base_gold"],
                    recurrence=recurrence,
                    status=QuestStatus.ACTIVE if day_offset == 0 else QuestStatus.ARCHIVED,
                    created_at=datetime.combine(target_date, time(6, 0), tzinfo=timezone.utc),
                )
                db.add(quest)
                await db.flush()

                if day_offset == 0:
                    created_today_quests.append(quest)

                # If task was completed on this day, apply authoritative rewards
                if task_data.get("completed", False):
                    day_has_completion = True
                    total_completed_quests += 1

                    # Streak calculation
                    if last_activity_date is None:
                        current_streak = 1
                    elif last_activity_date == target_date:
                        pass  # Same day activity maintains streak
                    elif last_activity_date == target_date - timedelta(days=1):
                        current_streak += 1
                    else:
                        current_streak = 1
                    longest_streak = max(longest_streak, current_streak)
                    last_activity_date = target_date

                    multiplier = calculate_streak_multiplier(current_streak)
                    earned_xp = math.floor(rewards["base_xp"] * multiplier)
                    earned_gold = rewards["base_gold"]
                    attr_gain = rewards["attribute_gain"]

                    # Progression
                    prog = apply_xp_gain(
                        lifetime_xp=character.lifetime_xp,
                        current_level=character.current_level,
                        xp_into_current_level=character.xp_into_current_level,
                        xp_gained=earned_xp,
                    )
                    character.lifetime_xp = prog.lifetime_xp
                    character.current_level = prog.current_level
                    character.xp_into_current_level = prog.xp_into_current_level
                    character.xp_required_for_next_level = prog.xp_required_for_next_level

                    # Attribute gains
                    if task_data["attribute"] == CharacterAttribute.STRENGTH:
                        character.strength += attr_gain
                    elif task_data["attribute"] == CharacterAttribute.INTELLECT:
                        character.intellect += attr_gain
                    elif task_data["attribute"] == CharacterAttribute.DISCIPLINE:
                        character.discipline += attr_gain
                    elif task_data["attribute"] == CharacterAttribute.VITALITY:
                        character.vitality += attr_gain
                    elif task_data["attribute"] == CharacterAttribute.CREATIVITY:
                        character.creativity += attr_gain

                    character.gold += earned_gold

                    task_time = task_data.get("time", time(12, 0))
                    completed_dt = datetime.combine(target_date, task_time, tzinfo=timezone.utc)

                    if recurrence == QuestRecurrence.DAILY:
                        idemp_key = f"daily_{quest.id}_{char_id}_{target_date.isoformat()}"
                    else:
                        idemp_key = f"oneoff_{quest.id}"

                    completion = QuestCompletion(
                        quest_id=quest.id,
                        character_id=char_id,
                        completion_date=target_date,
                        completion_period_iso_year=iso_year,
                        completion_period_iso_week=iso_week,
                        earned_xp=earned_xp,
                        earned_gold=earned_gold,
                        attribute_gain=attr_gain,
                        idempotency_key=idemp_key,
                        completed_at=completed_dt,
                    )
                    db.add(completion)

        # 5. Create Streak row
        print(f"[6/8] Establishing Streak: current={current_streak}, longest={longest_streak}, last={last_activity_date}")
        streak = Streak(
            character_id=char_id,
            current_streak=current_streak,
            longest_streak=longest_streak,
            last_activity_date=last_activity_date,
            freeze_count=0,
        )
        db.add(streak)

        # 6. Unlock Achievements matching milestones
        print("[7/8] Unlocking realistic achievements...")
        ach_codes = ["QUESTS_10", "STREAK_7", "XP_1000", "LEVEL_5"]
        stmt = select(Achievement).where(Achievement.code.in_(ach_codes))
        achs = (await db.execute(stmt)).scalars().all()

        for ach in achs:
            ca = CharacterAchievement(
                character_id=char_id,
                achievement_id=ach.id,
                unlocked_at=datetime.now(timezone.utc) - timedelta(hours=12),
            )
            db.add(ca)
            if ach.reward_gold > 0:
                character.gold += ach.reward_gold
            if ach.reward_xp > 0:
                prog = apply_xp_gain(
                    lifetime_xp=character.lifetime_xp,
                    current_level=character.current_level,
                    xp_into_current_level=character.xp_into_current_level,
                    xp_gained=ach.reward_xp,
                )
                character.lifetime_xp = prog.lifetime_xp
                character.current_level = prog.current_level
                character.xp_into_current_level = prog.xp_into_current_level
                character.xp_required_for_next_level = prog.xp_required_for_next_level
            print(f"  Unlocked Achievement: {ach.code} ({ach.title}) +{ach.reward_xp} XP, +{ach.reward_gold} G")

        # 7. Add Inventory Items & Equip Cosmetics
        print("[8/8] Purchasing and equipping cosmetics...")
        shop_codes = ["theme_abyssal_dark", "frame_bronze_laurel", "badge_founder_sigil", "badge_phoenix_crest"]
        shop_stmt = select(ShopItem).where(ShopItem.code.in_(shop_codes))
        shop_items = {item.code: item for item in (await db.execute(shop_stmt)).scalars().all()}

        # theme_abyssal_dark (equipped)
        if "theme_abyssal_dark" in shop_items:
            item = shop_items["theme_abyssal_dark"]
            inv = InventoryItem(character_id=char_id, shop_item_id=item.id, is_equipped=True)
            db.add(inv)
            character.equipped_theme = item.code
            character.gold = max(0, character.gold - item.cost_gold)

        # frame_bronze_laurel (equipped)
        if "frame_bronze_laurel" in shop_items:
            item = shop_items["frame_bronze_laurel"]
            inv = InventoryItem(character_id=char_id, shop_item_id=item.id, is_equipped=True)
            db.add(inv)
            character.equipped_frame = item.code
            character.gold = max(0, character.gold - item.cost_gold)

        # badge_founder_sigil (equipped)
        if "badge_founder_sigil" in shop_items:
            item = shop_items["badge_founder_sigil"]
            inv = InventoryItem(character_id=char_id, shop_item_id=item.id, is_equipped=True)
            db.add(inv)
            character.equipped_badge = item.code
            character.gold = max(0, character.gold - item.cost_gold)

        # badge_phoenix_crest (in inventory, not equipped)
        if "badge_phoenix_crest" in shop_items:
            item = shop_items["badge_phoenix_crest"]
            inv = InventoryItem(character_id=char_id, shop_item_id=item.id, is_equipped=False)
            db.add(inv)
            character.gold = max(0, character.gold - item.cost_gold)

        await db.commit()
        await db.refresh(character)

    await engine.dispose()

    print("=" * 60)
    print("DEMO USER SEEDING COMPLETED SUCCESSFULLY!")
    print(f"  Account: {DEMO_EMAIL} (Password: {DEMO_PASS})")
    print(f"  Hero: {character.username} ({character.hero_class})")
    print(f"  Title: {character.title}")
    print(f"  Level: {character.current_level} (XP: {character.lifetime_xp})")
    print(f"  Gold: {character.gold}")
    print(f"  Streak: {current_streak} days active")
    print(f"  Attributes: STR={character.strength}, INT={character.intellect}, DIS={character.discipline}, VIT={character.vitality}, CRE={character.creativity}")
    print(f"  Equipped Theme: {character.equipped_theme}")
    print(f"  Equipped Frame: {character.equipped_frame}")
    print(f"  Equipped Badge: {character.equipped_badge}")
    print(f"  Total Historical Completed Quests: {total_completed_quests}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed_demo_account())
