import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    UUID,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class CharacterAchievement(Base):
    __tablename__ = "character_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    character_id = Column(
        UUID(as_uuid=True),
        ForeignKey("characters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    achievement_id = Column(
        UUID(as_uuid=True),
        ForeignKey("achievements.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    unlocked_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    character = relationship("Character", back_populates="achievements")
    achievement = relationship(
        "Achievement", back_populates="character_achievements"
    )

    __table_args__ = (
        UniqueConstraint(
            "character_id", "achievement_id", name="uq_character_achievement"
        ),
    )
