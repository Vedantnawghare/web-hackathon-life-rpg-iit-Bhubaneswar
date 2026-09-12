import math
from typing import List, NamedTuple
from app.models.enums import QuestDifficulty, CharacterAttribute


class ProgressionResult(NamedTuple):
    lifetime_xp: int
    current_level: int
    xp_into_current_level: int
    xp_required_for_next_level: int
    has_leveled_up: bool
    levels_gained: int
    level_ups: List[int]


# Authoritative difficulty reward matrix
DIFFICULTY_REWARDS = {
    QuestDifficulty.EASY: {
        "base_xp": 25,
        "base_gold": 10,
        "attribute_gain": 1,
    },
    QuestDifficulty.MEDIUM: {
        "base_xp": 50,
        "base_gold": 25,
        "attribute_gain": 2,
    },
    QuestDifficulty.HARD: {
        "base_xp": 100,
        "base_gold": 60,
        "attribute_gain": 4,
    },
    QuestDifficulty.EPIC: {
        "base_xp": 250,
        "base_gold": 150,
        "attribute_gain": 8,
    },
}

# Category to primary attribute mapping (matches PRODUCT_SPEC.md)
CATEGORY_ATTRIBUTE_MAP = {
    # Strength
    "fitness": CharacterAttribute.STRENGTH,
    "athletics": CharacterAttribute.STRENGTH,
    "gym": CharacterAttribute.STRENGTH,
    "workout": CharacterAttribute.STRENGTH,
    "weightlifting": CharacterAttribute.STRENGTH,
    "strength": CharacterAttribute.STRENGTH,

    # Intellect
    "academic": CharacterAttribute.INTELLECT,
    "reading": CharacterAttribute.INTELLECT,
    "work": CharacterAttribute.INTELLECT,
    "coding": CharacterAttribute.INTELLECT,
    "study": CharacterAttribute.INTELLECT,
    "studying": CharacterAttribute.INTELLECT,
    "intellect": CharacterAttribute.INTELLECT,

    # Discipline
    "habits": CharacterAttribute.DISCIPLINE,
    "organization": CharacterAttribute.DISCIPLINE,
    "meditation": CharacterAttribute.DISCIPLINE,
    "journaling": CharacterAttribute.DISCIPLINE,
    "chores": CharacterAttribute.DISCIPLINE,
    "routine": CharacterAttribute.DISCIPLINE,
    "discipline": CharacterAttribute.DISCIPLINE,

    # Vitality
    "health": CharacterAttribute.VITALITY,
    "running": CharacterAttribute.VITALITY,
    "sleep": CharacterAttribute.VITALITY,
    "nutrition": CharacterAttribute.VITALITY,
    "hydration": CharacterAttribute.VITALITY,
    "recovery": CharacterAttribute.VITALITY,
    "vitality": CharacterAttribute.VITALITY,

    # Creativity
    "art": CharacterAttribute.CREATIVITY,
    "drawing": CharacterAttribute.CREATIVITY,
    "writing": CharacterAttribute.CREATIVITY,
    "music": CharacterAttribute.CREATIVITY,
    "design": CharacterAttribute.CREATIVITY,
    "creative work": CharacterAttribute.CREATIVITY,
    "creativity": CharacterAttribute.CREATIVITY,
}


def calculate_xp_required(level: int) -> int:
    """
    Authoritative formula: XP required to transition from level L to L+1.
    Formula: xp_required_for_next_level(L) = floor(100 * (L ^ 1.6))
    """
    if level < 1:
        raise ValueError("Level must be >= 1")
    return math.floor(100 * (level ** 1.6))


def calculate_next_level_requirement(current_level: int) -> int:
    """Convenience alias for the next level requirement."""
    return calculate_xp_required(current_level)


def resolve_primary_attribute(category: str, explicit_attribute: CharacterAttribute = None) -> CharacterAttribute:
    """
    Resolves the primary attribute deterministically based on category,
    or validates an explicitly provided attribute.
    """
    if explicit_attribute is not None:
        return explicit_attribute

    normalized = category.strip().lower()
    return CATEGORY_ATTRIBUTE_MAP.get(normalized, CharacterAttribute.DISCIPLINE)


def get_difficulty_rewards(difficulty: QuestDifficulty) -> dict:
    """
    Returns authoritative base rewards for a given quest difficulty.
    """
    if difficulty not in DIFFICULTY_REWARDS:
        raise ValueError(f"Unknown quest difficulty: {difficulty}")
    return DIFFICULTY_REWARDS[difficulty]


def apply_xp_gain(
    lifetime_xp: int,
    current_level: int,
    xp_into_current_level: int,
    xp_gained: int,
) -> ProgressionResult:
    """
    Authoritative progression engine calculation.
    Handles single level ups, exact threshold boundaries, and multi-level rollovers.
    Guarantees lifetime_xp is strictly monotonic.
    """
    if xp_gained < 0:
        raise ValueError("XP gained cannot be negative.")
    if current_level < 1:
        raise ValueError("Current level must be >= 1.")

    new_lifetime_xp = lifetime_xp + xp_gained
    new_xp_into_level = xp_into_current_level + xp_gained
    new_level = current_level
    current_threshold = calculate_xp_required(new_level)
    level_ups: List[int] = []

    # Rollover loop: subtract requirement each time threshold is reached or exceeded
    while new_xp_into_level >= current_threshold:
        new_xp_into_level -= current_threshold
        new_level += 1
        level_ups.append(new_level)
        current_threshold = calculate_xp_required(new_level)

    return ProgressionResult(
        lifetime_xp=new_lifetime_xp,
        current_level=new_level,
        xp_into_current_level=new_xp_into_level,
        xp_required_for_next_level=current_threshold,
        has_leveled_up=len(level_ups) > 0,
        levels_gained=len(level_ups),
        level_ups=level_ups,
    )
