import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    BigInteger,
    DateTime,
    UUID,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Character(Base):
    __tablename__ = "characters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # 1:1 relationship with Supabase Auth user UUID
    user_id = Column(UUID(as_uuid=True), unique=True, index=True, nullable=False)
    username = Column(String(50), nullable=False)
    title = Column(String(100), default="Novice Adventurer", nullable=False)

    # Authoritative progression fields
    current_level = Column(Integer, default=1, nullable=False)
    lifetime_xp = Column(BigInteger, default=0, nullable=False)
    xp_into_current_level = Column(BigInteger, default=0, nullable=False)
    xp_required_for_next_level = Column(BigInteger, default=100, nullable=False)
    gold = Column(BigInteger, default=0, nullable=False)

    # 5 Core Attributes
    strength = Column(Integer, default=10, nullable=False)
    intellect = Column(Integer, default=10, nullable=False)
    discipline = Column(Integer, default=10, nullable=False)
    vitality = Column(Integer, default=10, nullable=False)
    creativity = Column(Integer, default=10, nullable=False)

    # Visual Cosmetics
    equipped_theme = Column(String(50), default="default_slate", nullable=False)
    equipped_frame = Column(String(50), default="default_frame", nullable=False)
    equipped_badge = Column(String(50), default="novice_badge", nullable=False)

    timezone = Column(String(50), default="UTC", nullable=False)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    quests = relationship("Quest", back_populates="character", cascade="all, delete-orphan")
    completions = relationship(
        "QuestCompletion", back_populates="character", cascade="all, delete-orphan"
    )
    streak = relationship(
        "Streak", back_populates="character", uselist=False, cascade="all, delete-orphan"
    )
    inventory = relationship(
        "InventoryItem", back_populates="character", cascade="all, delete-orphan"
    )
    achievements = relationship(
        "CharacterAchievement", back_populates="character", cascade="all, delete-orphan"
    )
