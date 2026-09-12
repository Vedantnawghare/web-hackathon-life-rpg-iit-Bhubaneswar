import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class CharacterBase(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    title: str = Field(default="Novice Adventurer", max_length=100)
    timezone: str = Field(default="UTC", max_length=50)
    hero_class: Optional[str] = Field(default="vanguard_male", max_length=50)

    @field_validator("username", mode="before")
    @classmethod
    def strip_and_clean_username(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Username cannot be empty or blank")
        return v


class CharacterCreate(CharacterBase):
    pass


class CharacterEquip(BaseModel):
    hero_class: Optional[str] = Field(None, max_length=50)
    equipped_theme: Optional[str] = Field(None, max_length=50)
    equipped_frame: Optional[str] = Field(None, max_length=50)
    equipped_badge: Optional[str] = Field(None, max_length=50)
    title: Optional[str] = Field(None, max_length=100)


class CharacterOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    username: str
    title: str

    # Authoritative progression fields
    current_level: int
    lifetime_xp: int
    xp_into_current_level: int
    xp_required_for_next_level: int
    gold: int
    current_streak: int = 0
    longest_streak: int = 0

    # 5 Attributes
    strength: int
    intellect: int
    discipline: int
    vitality: int
    creativity: int

    # Visual Cosmetics & Hero Archetype
    hero_class: str = "vanguard_male"
    equipped_theme: str
    equipped_frame: str
    equipped_badge: str

    timezone: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DailyProgressOut(BaseModel):
    date: date
    daily_xp_earned: int
    daily_xp_goal: int
    is_goal_reached: bool
    remaining_xp: int
    progress_percentage: int
