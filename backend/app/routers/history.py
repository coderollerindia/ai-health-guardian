"""GET /api/history?type=&q=&from=&to="""
from fastapi import APIRouter, Depends, Query

from app.database.supabase_client import get_supabase
from app.models.schemas import HistoryResponse
from app.utils.security import get_current_user_id

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history", response_model=HistoryResponse)
async def get_history(
    type: str | None = Query(None),
    q: str | None = Query(None),
    from_: str | None = Query(None, alias="from"),
    to: str | None = Query(None),
    user_id: str = Depends(get_current_user_id),
):
    supabase = get_supabase()
    items: list[dict] = []

    want_prescriptions = type in (None, "", "prescription")
    want_bills = type in (None, "", "bill")
    want_reminders = type in (None, "", "reminder")

    if want_prescriptions:
        resp = (
            supabase.table("prescriptions")
            .select("id, ai_result, created_at")
            .eq("user_id", user_id)
            .execute()
        )
        for row in resp.data or []:
            ai = row.get("ai_result") or {}
            title = (ai.get("patient_summary") or "Prescription")[:120]
            items.append(
                {
                    "id": row["id"],
                    "type": "prescription",
                    "title": title,
                    "subtitle": (ai.get("disease_symptoms") or "")[:160] or None,
                    "date": row.get("created_at"),
                    "summary": ai.get("doctor_advice_summary"),
                }
            )

    if want_bills:
        resp = (
            supabase.table("bills")
            .select("id, ai_result, created_at, hospital_name")
            .eq("user_id", user_id)
            .execute()
        )
        for row in resp.data or []:
            ai = row.get("ai_result") or {}
            grand_total = (ai.get("subtotals") or {}).get("grand_total")
            title = row.get("hospital_name") or ai.get("hospital_name") or "Hospital bill"
            items.append(
                {
                    "id": row["id"],
                    "type": "bill",
                    "title": title,
                    "subtitle": f"Total: Rs. {grand_total}" if grand_total is not None else None,
                    "date": row.get("created_at"),
                    "summary": "; ".join((ai.get("recommendations") or [])[:2]) or None,
                }
            )

    if want_reminders:
        resp = (
            supabase.table("reminders")
            .select("id, medicine_name, time_of_day, reminder_time, created_at")
            .eq("user_id", user_id)
            .execute()
        )
        for row in resp.data or []:
            items.append(
                {
                    "id": row["id"],
                    "type": "reminder",
                    "title": row.get("medicine_name") or "Reminder",
                    "subtitle": f"{row.get('time_of_day')} at {row.get('reminder_time')}",
                    "date": row.get("created_at"),
                    "summary": None,
                }
            )

    if q:
        q_lower = q.lower()

        def matches(item: dict) -> bool:
            haystack = " ".join(
                filter(None, [item.get("title"), item.get("subtitle"), item.get("summary")])
            ).lower()
            return q_lower in haystack

        items = [item for item in items if matches(item)]

    if from_:
        items = [item for item in items if item.get("date") and item["date"] >= from_]
    if to:
        items = [item for item in items if item.get("date") and item["date"] <= to]

    items.sort(key=lambda item: item.get("date") or "", reverse=True)

    return {"items": items}
