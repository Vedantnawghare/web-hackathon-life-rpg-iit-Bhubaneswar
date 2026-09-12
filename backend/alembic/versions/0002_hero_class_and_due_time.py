"""Add hero_class and due_time

Revision ID: 0002_hero_class_and_due_time
Revises: 0001_initial_schema
Create Date: 2026-09-12 15:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0002_hero_class_and_due_time"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add hero_class to characters
    op.add_column(
        "characters",
        sa.Column(
            "hero_class",
            sa.String(length=50),
            nullable=False,
            server_default="vanguard_male",
        ),
    )

    # 2. Add due_time to quests
    op.add_column(
        "quests",
        sa.Column(
            "due_time",
            sa.String(length=5),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("quests", "due_time")
    op.drop_column("characters", "hero_class")
