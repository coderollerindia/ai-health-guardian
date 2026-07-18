"""GET /api/dashboard"""
from fastapi import APIRouter, Depends

from app.database.supabase_client import get_supabase
from app.models.schemas import DashboardResponse
from app.services.health_score_service import compute_current_health_score
from app.utils.security import get_current_user_id

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()

    prescriptions = (
        supabase.table("prescriptions")
        .select("id, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
        .data
        or []
    )
    bills = (
        supabase.table("bills")
        .select("id, created_at, hospital_name")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
        .data
        or []
    )
    reminders = (
        supabase.table("reminders").select("id, active").eq("user_id", user_id).execute().data or []
    )
    active_reminders_count = sum(1 for r in reminders if r.get("active"))

    latest_score_rows = (
        supabase.table("health_scores")
        .select("*")
        .eq("user_id", user_id)
        .order("score_date", desc=True)
        .limit(1)
        .execute()
        .data
    )
    latest_health_score = latest_score_rows[0] if latest_score_rows else compute_current_health_score(user_id)

    recent_chat_activity = (
        supabase.table("chat_messages")
        .select("id, role, content, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
        .data
        or []
    )

    recent_uploads = sorted(
        [{"id": p["id"], "type": "prescription", "date": p["created_at"]} for p in prescriptions]
        + [
            {
                "id": b["id"],
                "type": "bill",
                "date": b["created_at"],
                "hospital_name": b.get("hospital_name"),
            }
            for b in bills
        ],
        key=lambda x: x["date"] or "",
        reverse=True,
    )[:5]

    return {
        "recent_uploads": recent_uploads,
        "active_reminders_count": active_reminders_count,
        "latest_health_score": latest_health_score,
        "recent_chat_activity": recent_chat_activity,
    }
