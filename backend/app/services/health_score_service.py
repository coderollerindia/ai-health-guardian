"""Computes the current health score. Persistence/history reads happen in the
health_score router; this module holds the scoring logic only."""
from datetime import date

from app.database.supabase_client import get_supabase

DEFAULT_NEUTRAL_SCORE = 70.0


def compute_current_health_score(user_id: str) -> dict:
    """Computes today's health score components for a user.

    NON-OBVIOUS ASSUMPTION: the current schema has no "dose taken" event log
    (no table records whether a reminder was actually acted on at its
    scheduled time) - only a reminders table with a static `active` flag. Real
    adherence tracking would need a `reminder_logs`-style table. Until that
    exists, we APPROXIMATE adherence as the percentage of the user's reminders
    that are currently `active` (i.e. they're still keeping up a reminder
    schedule rather than having abandoned/disabled it), defaulting to a
    neutral 70 when the user has no reminders at all yet. This is a
    placeholder proxy, not a measurement of actual medicine-taking behavior.
    """
    supabase = get_supabase()

    reminders_resp = (
        supabase.table("reminders").select("id, active").eq("user_id", user_id).execute()
    )
    reminders = reminders_resp.data or []

    if reminders:
        active_count = sum(1 for r in reminders if r.get("active"))
        adherence = round((active_count / len(reminders)) * 100, 1)
    else:
        adherence = DEFAULT_NEUTRAL_SCORE

    # Nutrition/hydration/activity/sleep have no dedicated logging table in
    # the current schema either, so we return neutral defaults until
    # user-entered settings/logs exist for these dimensions.
    nutrition = DEFAULT_NEUTRAL_SCORE
    hydration = DEFAULT_NEUTRAL_SCORE
    activity = DEFAULT_NEUTRAL_SCORE
    sleep = DEFAULT_NEUTRAL_SCORE

    overall = round((adherence + nutrition + hydration + activity + sleep) / 5, 1)
    # Risk is inversely weighted towards adherence, since missed medication is
    # the single biggest controllable risk factor being tracked today.
    risk = round(
        100
        - (adherence * 0.4 + nutrition * 0.15 + hydration * 0.15 + activity * 0.15 + sleep * 0.15),
        1,
    )

    return {
        "score_date": date.today().isoformat(),
        "adherence": adherence,
        "nutrition": nutrition,
        "hydration": hydration,
        "activity": activity,
        "sleep": sleep,
        "risk": risk,
        "overall": overall,
    }
