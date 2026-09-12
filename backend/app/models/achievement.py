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


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    icon_name = Column(String(50), nullable=False)

    condition_type = Column(String(50), nullable=False)
    condition_threshold = Column(BigInteger, nullable=False)

    reward_xp = Column(Integer, default=0, nullable=False)
    reward_gold = Column(Integer, default=0, nullable=False)
    reward_title = Column(String(100), nullable=True)

    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    character_achievements = relationship(
        "CharacterAchievement",
        back_populates="achievement",
        cascade="all, delete-orphan",
    )
