"""Initial schema migration

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-12 11:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Characters Table
    op.create_table(
        "characters",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", sa.UUID(as_uuid=True), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False, server_default="Novice Adventurer"),
        sa.Column("current_level", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("lifetime_xp", sa.BigInteger(), nullable=False, server_default="0"),
        sa.Column("xp_into_current_level", sa.BigInteger(), nullable=False, server_default="0"),
        sa.Column("xp_required_for_next_level", sa.BigInteger(), nullable=False, server_default="100"),
        sa.Column("gold", sa.BigInteger(), nullable=False, server_default="0"),
        sa.Column("strength", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("intellect", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("discipline", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("vitality", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("creativity", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("equipped_theme", sa.String(length=50), nullable=False, server_default="default_slate"),
        sa.Column("equipped_frame", sa.String(length=50), nullable=False, server_default="default_frame"),
        sa.Column("equipped_badge", sa.String(length=50), nullable=False, server_default="novice_badge"),
        sa.Column("timezone", sa.String(length=50), nullable=False, server_default="UTC"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_characters_user_id", "characters", ["user_id"], unique=True)

    # 2. Quests Table
    op.create_table(
        "quests",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("character_id", sa.UUID(as_uuid=True), sa.ForeignKey("characters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("description", sa.String(length=1000), nullable=True),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column(
            "difficulty",
            sa.Enum("EASY", "MEDIUM", "HARD", "EPIC", name="quest_difficulty"),
            nullable=False,
        ),
        sa.Column(
            "primary_attribute",
            sa.Enum("STRENGTH", "INTELLECT", "DISCIPLINE", "VITALITY", "CREATIVITY", name="character_attribute"),
            nullable=False,
        ),
        sa.Column("base_xp", sa.Integer(), nullable=False),
        sa.Column("base_gold", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("ACTIVE", "ARCHIVED", name="quest_status"),
            nullable=False,
            server_default="ACTIVE",
        ),
        sa.Column(
            "recurrence",
            sa.Enum("NONE", "DAILY", "WEEKLY", name="quest_recurrence"),
            nullable=False,
            server_default="NONE",
        ),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_quests_character_id", "quests", ["character_id"])
    op.create_index("ix_quests_status", "quests", ["status"])

    # 3. Quest Completions Table
    op.create_table(
        "quest_completions",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("quest_id", sa.UUID(as_uuid=True), sa.ForeignKey("quests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("character_id", sa.UUID(as_uuid=True), sa.ForeignKey("characters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("completion_date", sa.Date(), nullable=False),
        sa.Column("completion_period_iso_year", sa.Integer(), nullable=True),
        sa.Column("completion_period_iso_week", sa.Integer(), nullable=True),
        sa.Column("earned_xp", sa.Integer(), nullable=False),
        sa.Column("earned_gold", sa.Integer(), nullable=False),
        sa.Column("attribute_gain", sa.Integer(), nullable=False),
        sa.Column("idempotency_key", sa.String(length=120), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_quest_completions_quest_id", "quest_completions", ["quest_id"])
    op.create_index("ix_quest_completions_character_id", "quest_completions", ["character_id"])
    op.create_index("ix_quest_completions_completion_date", "quest_completions", ["completion_date"])
    op.create_index("ix_quest_completions_idempotency_key", "quest_completions", ["idempotency_key"], unique=True)
    op.create_index("ix_quest_completions_character_date", "quest_completions", ["character_id", "completion_date"])

    # 4. Streaks Table
    op.create_table(
        "streaks",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("character_id", sa.UUID(as_uuid=True), sa.ForeignKey("characters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("current_streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("longest_streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_activity_date", sa.Date(), nullable=True),
        sa.Column("freeze_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_streaks_character_id", "streaks", ["character_id"], unique=True)

    # 5. Shop Items Table
    op.create_table(
        "shop_items",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=False),
        sa.Column(
            "item_type",
            sa.Enum("THEME", "AVATAR_FRAME", "BADGE", "TITLE", "COSMETIC", name="shop_item_type"),
            nullable=False,
        ),
        sa.Column("cost_gold", sa.BigInteger(), nullable=False),
        sa.Column("asset_key", sa.String(length=100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_shop_items_code", "shop_items", ["code"], unique=True)

    # 6. Inventory Items Table
    op.create_table(
        "inventory_items",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("character_id", sa.UUID(as_uuid=True), sa.ForeignKey("characters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("shop_item_id", sa.UUID(as_uuid=True), sa.ForeignKey("shop_items.id", ondelete="CASCADE"), nullable=False),
        sa.Column("is_equipped", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("acquired_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("character_id", "shop_item_id", name="uq_character_shop_item"),
    )
    op.create_index("ix_inventory_items_character_id", "inventory_items", ["character_id"])
    op.create_index("ix_inventory_items_shop_item_id", "inventory_items", ["shop_item_id"])

    # 7. Achievements Table
    op.create_table(
        "achievements",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("icon_name", sa.String(length=50), nullable=False),
        sa.Column("condition_type", sa.String(length=50), nullable=False),
        sa.Column("condition_threshold", sa.BigInteger(), nullable=False),
        sa.Column("reward_xp", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reward_gold", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reward_title", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_achievements_code", "achievements", ["code"], unique=True)

    # 8. Character Achievements Table
    op.create_table(
        "character_achievements",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("character_id", sa.UUID(as_uuid=True), sa.ForeignKey("characters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("achievement_id", sa.UUID(as_uuid=True), sa.ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False),
        sa.Column("unlocked_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("character_id", "achievement_id", name="uq_character_achievement"),
    )
    op.create_index("ix_character_achievements_character_id", "character_achievements", ["character_id"])
    op.create_index("ix_character_achievements_achievement_id", "character_achievements", ["achievement_id"])


def downgrade() -> None:
    op.drop_table("character_achievements")
    op.drop_table("achievements")
    op.drop_table("inventory_items")
    op.drop_table("shop_items")
    op.drop_table("streaks")
    op.drop_table("quest_completions")
    op.drop_table("quests")
    op.drop_table("characters")
