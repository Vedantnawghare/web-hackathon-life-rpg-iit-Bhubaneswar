import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AchievementOut(BaseModel):
    id: uuid.UUID
    code: str
    title: str
    description: str
    category: str
    icon_name: str
    condition_type: str
    condition_threshold: int
    reward_xp: int
    reward_gold: int
    reward_title: Optional[str] = None
    is_unlocked: bool = False
    unlocked_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
