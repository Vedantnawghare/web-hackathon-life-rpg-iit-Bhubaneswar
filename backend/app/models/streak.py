import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    Date,
    DateTime,
    ForeignKey,
    UUID,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Streak(Base):
    __tablename__ = "streaks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    character_id = Column(
        UUID(as_uuid=True),
        ForeignKey("characters.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_activity_date = Column(Date, nullable=True)
    freeze_count = Column(Integer, default=0, nullable=False)

    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    character = relationship("Character", back_populates="streak")
