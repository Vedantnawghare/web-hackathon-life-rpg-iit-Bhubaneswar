import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    UUID,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    character_id = Column(
        UUID(as_uuid=True),
        ForeignKey("characters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    shop_item_id = Column(
        UUID(as_uuid=True),
        ForeignKey("shop_items.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    is_equipped = Column(Boolean, default=False, nullable=False)
    acquired_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    character = relationship("Character", back_populates="inventory")
    shop_item = relationship("ShopItem", back_populates="inventory_items")

    __table_args__ = (
        UniqueConstraint(
            "character_id", "shop_item_id", name="uq_character_shop_item"
        ),
    )
