import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Date,
    DateTime,
    ForeignKey,
    Index,
    UUID,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class QuestCompletion(Base):
    __tablename__ = "quest_completions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quest_id = Column(
        UUID(as_uuid=True),
        ForeignKey("quests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    character_id = Column(
        UUID(as_uuid=True),
        ForeignKey("characters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    completion_date = Column(Date, nullable=False, index=True)
    completion_period_iso_year = Column(Integer, nullable=True)
    completion_period_iso_week = Column(Integer, nullable=True)

    earned_xp = Column(Integer, nullable=False)
    earned_gold = Column(Integer, nullable=False)
    attribute_gain = Column(Integer, nullable=False)

    idempotency_key = Column(String(120), unique=True, index=True, nullable=False)

    completed_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    quest = relationship("Quest", back_populates="completions")
    character = relationship("Character", back_populates="completions")

    __table_args__ = (
        Index("ix_quest_completions_character_date", "character_id", "completion_date"),
    )
