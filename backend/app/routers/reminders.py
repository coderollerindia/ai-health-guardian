"""Medicine reminders CRUD against the `reminders` table."""
from fastapi import APIRouter, Depends, HTTPException

from app.database.supabase_client import get_supabase
from app.models.schemas import ReminderCreate, ReminderUpdate
from app.utils.security import get_current_user_id

router = APIRouter(prefix="/api", tags=["reminders"])


@router.get("/medicine-reminder")
async def list_reminders(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    resp = (
        supabase.table("reminders")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return {"reminders": resp.data or []}


@router.post("/medicine-reminder")
async def create_reminder(body: ReminderCreate, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    payload = body.model_dump()
    payload["user_id"] = user_id
    resp = supabase.table("reminders").insert(payload).execute()
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to create reminder")
    return resp.data[0]


@router.patch("/medicine-reminder/{reminder_id}")
async def update_reminder(
    reminder_id: str,
    body: ReminderUpdate,
    user_id: str = Depends(get_current_user_id),
):
    supabase = get_supabase()
    payload = body.model_dump(exclude_unset=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    resp = (
        supabase.table("reminders")
        .update(payload)
        .eq("id", reminder_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return resp.data[0]


@router.delete("/medicine-reminder/{reminder_id}")
async def delete_reminder(reminder_id: str, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase()
    resp = (
        supabase.table("reminders")
        .delete()
        .eq("id", reminder_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"ok": True}
