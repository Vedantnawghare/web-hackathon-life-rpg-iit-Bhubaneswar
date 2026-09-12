import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Date,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    UUID,
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import (
    QuestDifficulty,
    CharacterAttribute,
    QuestStatus,
    QuestRecurrence,
)


class Quest(Base):
    __tablename__ = "quests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    character_id = Column(
        UUID(as_uuid=True),
        ForeignKey("characters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = Column(String(120), nullable=False)
    description = Column(String(1000), nullable=True)
    category = Column(String(50), nullable=False)

    difficulty = Column(
        SQLEnum(QuestDifficulty, name="quest_difficulty"),
        nullable=False,
    )
    primary_attribute = Column(
        SQLEnum(CharacterAttribute, name="character_attribute"),
        nullable=False,
    )

    base_xp = Column(Integer, nullable=False)
    base_gold = Column(Integer, nullable=False)

    status = Column(
        SQLEnum(QuestStatus, name="quest_status"),
        default=QuestStatus.ACTIVE,
        nullable=False,
        index=True,
    )

    recurrence = Column(
        SQLEnum(QuestRecurrence, name="quest_recurrence"),
        default=QuestRecurrence.NONE,
        nullable=False,
    )

    due_date = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    character = relationship("Character", back_populates="quests")
    completions = relationship(
        "QuestCompletion", back_populates="quest", cascade="all, delete-orphan"
    )
