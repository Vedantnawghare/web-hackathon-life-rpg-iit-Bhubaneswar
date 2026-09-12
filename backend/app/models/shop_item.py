import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    BigInteger,
    Boolean,
    DateTime,
    Enum as SQLEnum,
    UUID,
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import ShopItemType


class ShopItem(Base):
    __tablename__ = "shop_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    item_type = Column(
        SQLEnum(ShopItemType, name="shop_item_type"),
        nullable=False,
    )
    cost_gold = Column(BigInteger, nullable=False)
    asset_key = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    # Relationships
    inventory_items = relationship(
        "InventoryItem", back_populates="shop_item", cascade="all, delete-orphan"
    )
