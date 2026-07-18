"""GET /api/health-score"""
from fastapi import APIRouter, Depends

from app.database.supabase_client import get_supabase
from app.models.schemas import HealthScoreResponse
from app.services.health_score_service import compute_current_health_score
from app.utils.security import get_current_user_id

router = APIRouter(prefix="/api", tags=["health-score"])


@router.get("/health-score", response_model=HealthScoreResponse)
async def get_health_score(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    current = compute_current_health_score(user_id)

    # Upsert today's score row so repeated calls in one day don't create dupes.
    existing = (
        supabase.table("health_scores")
        .select("id")
        .eq("user_id", user_id)
        .eq("score_date", current["score_date"])
        .execute()
        .data
    )
    if existing:
        supabase.table("health_scores").update(current).eq("id", existing[0]["id"]).execute()
    else:
        supabase.table("health_scores").insert({**current, "user_id": user_id}).execute()

    history_resp = (
        supabase.table("health_scores")
        .select("score_date, overall, adherence, nutrition, hydration, activity, sleep, risk")
        .eq("user_id", user_id)
        .order("score_date")
        .execute()
    )
    history = []
    for row in history_resp.data or []:
        row = dict(row)
        row["date"] = row.pop("score_date")
        history.append(row)

    return {"current": current, "history": history}
