from datetime import date, datetime, timedelta, timezone
from typing import Tuple
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from app.models.streak import Streak


def get_local_date_for_timezone(tz_name: str) -> date:
    """
    Safely resolves the current calendar date in the character's local timezone.
    Falls back to UTC if the timezone identifier is invalid or empty.
    """
    if not tz_name or not isinstance(tz_name, str):
        return datetime.now(timezone.utc).date()

    try:
        tz = ZoneInfo(tz_name.strip())
        return datetime.now(tz).date()
    except ZoneInfoNotFoundError:
        return datetime.now(timezone.utc).date()


def get_local_iso_calendar(tz_name: str) -> Tuple[int, int]:
    """
    Returns (iso_year, iso_week) for the user's current local date.
    Used for weekly quest idempotency keys.
    """
    local_date = get_local_date_for_timezone(tz_name)
    iso_cal = local_date.isocalendar()
    return iso_cal.year, iso_cal.week


def calculate_streak_multiplier(current_streak: int) -> float:
    """
    Authoritative formula:
    XP Multiplier = 1.0 + min(0.30, current_streak * 0.02)
    Yields up to a +30% XP bonus for consistency.
    """
    if current_streak <= 0:
        return 1.0
    bonus = min(0.30, current_streak * 0.02)
    return round(1.0 + bonus, 4)


def evaluate_streak_activity(streak: Streak, activity_date: date) -> Tuple[int, bool]:
    """
    Evaluates quest activity against the streak state.
    Updates the streak in place.
    Returns:
      (new_current_streak, streak_extended: bool)
    """
    last_date = streak.last_activity_date

    if last_date is None:
        # First activity recorded
        streak.current_streak = 1
        streak.longest_streak = max(streak.longest_streak, 1)
        streak.last_activity_date = activity_date
        return streak.current_streak, True

    if last_date == activity_date:
        # Same calendar day: activity already counted, streak remains unchanged
        return streak.current_streak, False

    if last_date == activity_date - timedelta(days=1):
        # Consecutive calendar day: streak increments
        streak.current_streak += 1
        streak.longest_streak = max(streak.longest_streak, streak.current_streak)
        streak.last_activity_date = activity_date
        return streak.current_streak, True

    # Skipped one or more days: streak reset to 1
    streak.current_streak = 1
    streak.longest_streak = max(streak.longest_streak, 1)
    streak.last_activity_date = activity_date
    return streak.current_streak, True
