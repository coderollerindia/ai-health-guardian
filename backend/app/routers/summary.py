"""GET /api/summary?period=weekly|monthly"""
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query

from app.database.supabase_client import get_supabase
from app.gemini.prompts import summary_prompt
from app.models.schemas import AIInsightsResponse
from app.services import gemini_service
from app.utils.security import get_current_user_id

router = APIRouter(prefix="/api", tags=["summary"])


@router.get("/summary", response_model=AIInsightsResponse)
async def get_summary(
    period: str = Query("weekly", pattern="^(weekly|monthly)$"),
    user_id: str = Depends(get_current_user_id),
):
    supabase = get_supabase()
    days = 7 if period == "weekly" else 30
    since = (date.today() - timedelta(days=days)).isoformat()

    prescriptions = (
        supabase.table("prescriptions")
        .select("id, created_at, confidence_score")
        .eq("user_id", user_id)
        .gte("created_at", since)
        .execute()
        .data
        or []
    )
    bills = (
        supabase.table("bills")
        .select("id, created_at, ai_result")
        .eq("user_id", user_id)
        .gte("created_at", since)
        .execute()
        .data
        or []
    )
    reminders = (
        supabase.table("reminders").select("id, active").eq("user_id", user_id).execute().data or []
    )
    health_scores = (
        supabase.table("health_scores")
        .select("score_date, overall, adherence, nutrition, hydration, activity, sleep, risk")
        .eq("user_id", user_id)
        .gte("score_date", since)
        .order("score_date")
        .execute()
        .data
        or []
    )

    total_spend = 0.0
    for bill in bills:
        grand_total = ((bill.get("ai_result") or {}).get("subtotals") or {}).get("grand_total")
        if isinstance(grand_total, (int, float)):
            total_spend += grand_total

    avg_overall_score = None
    if health_scores:
        avg_overall_score = round(
            sum((h.get("overall") or 0) for h in health_scores) / len(health_scores), 1
        )

    stats = {
        "period": period,
        "since": since,
        "prescriptions_count": len(prescriptions),
        "bills_count": len(bills),
        "total_spend": round(total_spend, 2),
        "active_reminders": sum(1 for r in reminders if r.get("active")),
        "total_reminders": len(reminders),
        "health_score_samples": len(health_scores),
        "avg_overall_score": avg_overall_score,
    }

    prompt = summary_prompt(period, stats, health_scores)
    try:
        insights = gemini_service.generate_insights(prompt)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini summary generation failed: {exc}")

    return {
        "period": period,
        "summary_text": insights.get("summary_text", ""),
        "adherence_trend": insights.get("adherence_trend"),
        "spending_trend": insights.get("spending_trend"),
        "health_trend": insights.get("health_trend"),
        "suggestions": insights.get("suggestions", []),
        "stats": stats,
    }
