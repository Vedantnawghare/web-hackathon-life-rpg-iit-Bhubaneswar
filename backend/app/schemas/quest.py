import re
import uuid
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.models.enums import (
    QuestDifficulty,
    CharacterAttribute,
    QuestStatus,
    QuestRecurrence,
)
from app.schemas.character import CharacterOut
from app.schemas.achievement import AchievementOut


def validate_plain_text(value: Optional[str], field_name: str) -> Optional[str]:
    """Ensures input is clean plain text without null bytes or control characters."""
    if value is None:
        return None
    cleaned = value.strip()
    if "\x00" in cleaned or bool(re.search(r"[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]", cleaned)):
        raise ValueError(f"{field_name} must contain printable text without control characters.")
    return cleaned


class QuestBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=1000)
    category: str = Field(..., min_length=1, max_length=50)
    difficulty: QuestDifficulty
    recurrence: QuestRecurrence = Field(default=QuestRecurrence.NONE)
    due_date: Optional[date] = None
    due_time: Optional[str] = Field(None, max_length=5)

    @field_validator("due_time")
    @classmethod
    def validate_due_time(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        cleaned = v.strip()
        if not re.match(r"^([01]\d|2[0-3]):([0-5]\d)$", cleaned):
            raise ValueError("due_time must be in 24-hour HH:MM format (e.g. 09:00 or 14:30)")
        return cleaned

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        cleaned = validate_plain_text(v, "Title")
        if not cleaned:
            raise ValueError("Title cannot be empty or whitespace only.")
        return cleaned

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        return validate_plain_text(v, "Description")

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        cleaned = validate_plain_text(v, "Category")
        if not cleaned:
            raise ValueError("Category cannot be empty.")
        return cleaned


class QuestCreate(QuestBase):
    primary_attribute: Optional[CharacterAttribute] = None


class QuestUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=1000)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    difficulty: Optional[QuestDifficulty] = None
    primary_attribute: Optional[CharacterAttribute] = None
    recurrence: Optional[QuestRecurrence] = None
    due_date: Optional[date] = None
    due_time: Optional[str] = Field(None, max_length=5)
    status: Optional[QuestStatus] = None

    @field_validator("due_time")
    @classmethod
    def validate_due_time(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        cleaned = v.strip()
        if not re.match(r"^([01]\d|2[0-3]):([0-5]\d)$", cleaned):
            raise ValueError("due_time must be in 24-hour HH:MM format (e.g. 09:00 or 14:30)")
        return cleaned

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = validate_plain_text(v, "Title")
            if not cleaned:
                raise ValueError("Title cannot be empty.")
            return cleaned
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        return validate_plain_text(v, "Description")


class QuestOut(BaseModel):
    id: uuid.UUID
    character_id: uuid.UUID
    title: str
    description: Optional[str]
    category: str
    difficulty: QuestDifficulty
    primary_attribute: CharacterAttribute
    base_xp: int
    base_gold: int
    status: QuestStatus
    recurrence: QuestRecurrence
    due_date: Optional[date]
    due_time: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Dynamic period evaluation fields
    is_completed_for_period: bool = False
    last_completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class QuestCompleteResponse(BaseModel):
    quest_id: uuid.UUID
    quest_title: str
    earned_xp: int
    earned_gold: int
    xp_multiplier: float
    attribute_increased: CharacterAttribute
    attribute_gain: int
    old_level: int
    new_level: int
    has_leveled_up: bool
    levels_gained: int
    current_streak: int
    streak_extended: bool
    unlocked_achievements: List[AchievementOut] = []
    character: CharacterOut


class QuestHistoryItem(BaseModel):
    id: uuid.UUID
    quest_id: uuid.UUID
    quest_title: str
    category: str
    difficulty: QuestDifficulty
    primary_attribute: CharacterAttribute
    earned_xp: int
    earned_gold: int
    attribute_gain: int
    completion_date: date
    completed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuestHistoryResponse(BaseModel):
    items: List[QuestHistoryItem]
    total: int
    limit: int
    offset: int
