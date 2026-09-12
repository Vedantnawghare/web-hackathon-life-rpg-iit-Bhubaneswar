from datetime import date, timedelta
import pytest
from app.models.streak import Streak
from app.services.streak_service import (
    calculate_streak_multiplier,
    evaluate_streak_activity,
    get_local_date_for_timezone,
    get_local_iso_calendar,
)


def test_streak_multiplier():
    assert calculate_streak_multiplier(0) == 1.0
    assert calculate_streak_multiplier(1) == 1.02
    assert calculate_streak_multiplier(5) == 1.10
    assert calculate_streak_multiplier(7) == 1.14
    assert calculate_streak_multiplier(10) == 1.20
    assert calculate_streak_multiplier(15) == 1.30
    assert calculate_streak_multiplier(20) == 1.30  # capped at +30%
    assert calculate_streak_multiplier(100) == 1.30


def test_timezone_safe_date_resolution():
    utc_date = get_local_date_for_timezone("UTC")
    assert isinstance(utc_date, date)

    # Invalid timezone should fallback to UTC without error
    fallback_date = get_local_date_for_timezone("Invalid/MadeUp_TZ")
    assert isinstance(fallback_date, date)
    assert fallback_date == utc_date

    # None / empty fallback
    assert get_local_date_for_timezone(None) == utc_date
    assert get_local_date_for_timezone("") == utc_date


def test_get_local_iso_calendar():
    year, week = get_local_iso_calendar("UTC")
    assert isinstance(year, int)
    assert isinstance(week, int)
    assert 1 <= week <= 53


def test_streak_evaluation_lifecycle():
    today = date(2026, 9, 12)
    streak = Streak(current_streak=0, longest_streak=0, last_activity_date=None)

    # 1. First activity
    cur, extended = evaluate_streak_activity(streak, today)
    assert cur == 1
    assert extended is True
    assert streak.current_streak == 1
    assert streak.longest_streak == 1
    assert streak.last_activity_date == today

    # 2. Same-day second activity
    cur, extended = evaluate_streak_activity(streak, today)
    assert cur == 1
    assert extended is False
    assert streak.current_streak == 1
    assert streak.longest_streak == 1

    # 3. Next consecutive day (Day 2)
    day2 = today + timedelta(days=1)
    cur, extended = evaluate_streak_activity(streak, day2)
    assert cur == 2
    assert extended is True
    assert streak.current_streak == 2
    assert streak.longest_streak == 2

    # 4. Next consecutive day (Day 3)
    day3 = today + timedelta(days=2)
    cur, extended = evaluate_streak_activity(streak, day3)
    assert cur == 3
    assert extended is True
    assert streak.current_streak == 3
    assert streak.longest_streak == 3

    # 5. Missed day: gap from day3 to day5 (skipping day4)
    day5 = today + timedelta(days=4)
    cur, extended = evaluate_streak_activity(streak, day5)
    assert cur == 1
    assert extended is True
    assert streak.current_streak == 1
    # Longest streak remains preserved
    assert streak.longest_streak == 3
    assert streak.last_activity_date == day5
