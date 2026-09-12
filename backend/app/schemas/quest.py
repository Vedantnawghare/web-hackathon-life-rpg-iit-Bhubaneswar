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


def validate_plain_text(value: Optional[str], field_name: str) -> Optional[str]:
    """Ensures input is clean plain text without null bytes or control characters."""
    if value is None:
        return None
    cleaned = value.strip()
    # Reject null characters and ASCII control characters except standard whitespace
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
    pass


class QuestUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=1000)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    difficulty: Optional[QuestDifficulty] = None
    recurrence: Optional[QuestRecurrence] = None
    due_date: Optional[date] = None
    status: Optional[QuestStatus] = None

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
    created_at: datetime
    updated_at: datetime

    # Dynamic period evaluation fields
    is_completed_for_period: bool = False
    last_completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class QuestCompleteResponse(BaseModel):
    quest_id: uuid.UUID
    earned_xp: int
    earned_gold: int
    xp_multiplier: float
    attribute_increased: CharacterAttribute
    attribute_gain: int
    level_ups: List[int]
    unlocked_achievement_ids: List[uuid.UUID]
    character: CharacterOut
