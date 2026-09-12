import enum


class QuestDifficulty(str, enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"
    EPIC = "EPIC"


class CharacterAttribute(str, enum.Enum):
    STRENGTH = "STRENGTH"
    INTELLECT = "INTELLECT"
    DISCIPLINE = "DISCIPLINE"
    VITALITY = "VITALITY"
    CREATIVITY = "CREATIVITY"


class QuestStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ARCHIVED = "ARCHIVED"


class QuestRecurrence(str, enum.Enum):
    NONE = "NONE"
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"


class ShopItemType(str, enum.Enum):
    THEME = "THEME"
    AVATAR_FRAME = "AVATAR_FRAME"
    BADGE = "BADGE"
    TITLE = "TITLE"
    COSMETIC = "COSMETIC"
