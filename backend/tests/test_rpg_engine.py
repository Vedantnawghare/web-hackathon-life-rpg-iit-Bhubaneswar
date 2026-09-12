import pytest
from app.services.rpg_engine import (
    calculate_xp_required,
    apply_xp_gain,
    get_difficulty_rewards,
    resolve_primary_attribute,
    ProgressionResult,
)
from app.models.enums import QuestDifficulty, CharacterAttribute


def test_level_1_formula_and_behavior():
    # Level 1 formula: floor(100 * 1^1.6) == 100
    req = calculate_xp_required(1)
    assert req == 100


def test_level_progression_curve_non_linear():
    req1 = calculate_xp_required(1)  # 100
    req2 = calculate_xp_required(2)  # 303
    req3 = calculate_xp_required(3)  # 579
    req4 = calculate_xp_required(4)  # 918
    req5 = calculate_xp_required(5)  # 1313

    assert req1 == 100
    assert req2 == 303
    assert req3 == 579
    assert req4 == 918
    assert req5 == 1313

    # Ensure strictly increasing requirement
    assert req1 < req2 < req3 < req4 < req5


def test_invalid_level_raises():
    with pytest.raises(ValueError):
        calculate_xp_required(0)
    with pytest.raises(ValueError):
        calculate_xp_required(-1)


def test_normal_xp_gain_no_level_up():
    # Level 1: 0 XP into level, 100 needed. Gain 50 XP.
    result = apply_xp_gain(
        lifetime_xp=0,
        current_level=1,
        xp_into_current_level=0,
        xp_gained=50,
    )
    assert result.lifetime_xp == 50
    assert result.current_level == 1
    assert result.xp_into_current_level == 50
    assert result.xp_required_for_next_level == 100
    assert result.has_leveled_up is False
    assert result.levels_gained == 0
    assert result.level_ups == []


def test_exact_threshold_level_up():
    # Level 1: 0 XP into level, 100 needed. Gain exactly 100 XP.
    # Should level up to Level 2 with exactly 0 XP into Level 2.
    result = apply_xp_gain(
        lifetime_xp=0,
        current_level=1,
        xp_into_current_level=0,
        xp_gained=100,
    )
    assert result.lifetime_xp == 100
    assert result.current_level == 2
    assert result.xp_into_current_level == 0
    assert result.xp_required_for_next_level == 303
    assert result.has_leveled_up is True
    assert result.levels_gained == 1
    assert result.level_ups == [2]


def test_one_level_up_with_remainder():
    # Level 1: 75 XP into level, 100 needed (25 more to Lv 2). Gain 50 XP.
    # 75 + 50 = 125 -> 125 - 100 = 25 into Level 2.
    result = apply_xp_gain(
        lifetime_xp=75,
        current_level=1,
        xp_into_current_level=75,
        xp_gained=50,
    )
    assert result.lifetime_xp == 125
    assert result.current_level == 2
    assert result.xp_into_current_level == 25
    assert result.xp_required_for_next_level == 303
    assert result.has_leveled_up is True
    assert result.levels_gained == 1
    assert result.level_ups == [2]


def test_multi_level_rollover():
    # Level 1 requires 100 XP. Level 2 requires 303 XP. Level 3 requires 579 XP.
    # Total to reach Level 3 = 100 + 303 = 403 XP.
    # If starting at Level 1 with 0 XP, and gaining 500 XP:
    # 500 >= 100 -> Lv 2, 400 remaining.
    # 400 >= 303 -> Lv 3, 97 remaining.
    # 97 < 579 -> Remains Lv 3 with 97 XP into level.
    result = apply_xp_gain(
        lifetime_xp=0,
        current_level=1,
        xp_into_current_level=0,
        xp_gained=500,
    )
    assert result.lifetime_xp == 500
    assert result.current_level == 3
    assert result.xp_into_current_level == 97
    assert result.xp_required_for_next_level == 579
    assert result.has_leveled_up is True
    assert result.levels_gained == 2
    assert result.level_ups == [2, 3]


def test_large_xp_gain_massive_rollover():
    # Gain 2500 XP at Level 1
    # Lv 1 (100) -> Lv 2 (303) -> Lv 3 (579) -> Lv 4 (918)
    # Cumulative: 100 + 303 + 579 + 918 = 1900 to reach Lv 5.
    # 2500 - 1900 = 600 remaining into Lv 5 (which requires 1313 XP).
    result = apply_xp_gain(
        lifetime_xp=1000,
        current_level=1,
        xp_into_current_level=0,
        xp_gained=2500,
    )
    assert result.lifetime_xp == 3500
    assert result.current_level == 5
    assert result.xp_into_current_level == 600
    assert result.xp_required_for_next_level == 1313
    assert result.has_leveled_up is True
    assert result.levels_gained == 4
    assert result.level_ups == [2, 3, 4, 5]


def test_xp_boundary_zero_gain():
    result = apply_xp_gain(
        lifetime_xp=500,
        current_level=2,
        xp_into_current_level=150,
        xp_gained=0,
    )
    assert result.lifetime_xp == 500
    assert result.current_level == 2
    assert result.xp_into_current_level == 150
    assert result.has_leveled_up is False


def test_negative_xp_raises():
    with pytest.raises(ValueError):
        apply_xp_gain(
            lifetime_xp=100,
            current_level=1,
            xp_into_current_level=50,
            xp_gained=-25,
        )


def test_difficulty_rewards():
    easy = get_difficulty_rewards(QuestDifficulty.EASY)
    assert easy["base_xp"] == 25
    assert easy["base_gold"] == 10
    assert easy["attribute_gain"] == 1

    medium = get_difficulty_rewards(QuestDifficulty.MEDIUM)
    assert medium["base_xp"] == 50
    assert medium["base_gold"] == 25
    assert medium["attribute_gain"] == 2

    hard = get_difficulty_rewards(QuestDifficulty.HARD)
    assert hard["base_xp"] == 100
    assert hard["base_gold"] == 60
    assert hard["attribute_gain"] == 4

    epic = get_difficulty_rewards(QuestDifficulty.EPIC)
    assert epic["base_xp"] == 250
    assert epic["base_gold"] == 150
    assert epic["attribute_gain"] == 8


def test_category_attribute_mapping():
    assert resolve_primary_attribute("Gym") == CharacterAttribute.STRENGTH
    assert resolve_primary_attribute("Athletics") == CharacterAttribute.STRENGTH
    assert resolve_primary_attribute("Coding") == CharacterAttribute.INTELLECT
    assert resolve_primary_attribute("Reading") == CharacterAttribute.INTELLECT
    assert resolve_primary_attribute("Meditation") == CharacterAttribute.DISCIPLINE
    assert resolve_primary_attribute("Chores") == CharacterAttribute.DISCIPLINE
    assert resolve_primary_attribute("Running") == CharacterAttribute.VITALITY
    assert resolve_primary_attribute("Hydration") == CharacterAttribute.VITALITY
    assert resolve_primary_attribute("Drawing") == CharacterAttribute.CREATIVITY
    assert resolve_primary_attribute("Design") == CharacterAttribute.CREATIVITY

    # Explicit attribute overrides category
    assert resolve_primary_attribute("Coding", CharacterAttribute.CREATIVITY) == CharacterAttribute.CREATIVITY
