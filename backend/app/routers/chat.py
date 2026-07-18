"""POST /api/chat"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request

from app.database.supabase_client import get_supabase
from app.gemini.prompts import chat_prompt
from app.models.schemas import ChatRequest, ChatResponse
from app.services import gemini_service
from app.utils.rate_limit import limiter
from app.utils.security import get_current_user_id

router = APIRouter(prefix="/api", tags=["chat"])

_CONTEXT_TABLES = {"prescription": "prescriptions", "bill": "bills"}


@router.post("/chat", response_model=ChatResponse)
@limiter.limit("30/minute")
async def chat(
    request: Request,
    body: ChatRequest,
    user_id: str = Depends(get_current_user_id),
):
    supabase = get_supabase()
    session_id = body.session_id or str(uuid.uuid4())

    context_type = body.context_type
    context_id = body.context_id
    context_data = None

    if context_type and context_id:
        table = _CONTEXT_TABLES.get(context_type)
        if not table:
            raise HTTPException(status_code=400, detail=f"Unsupported context_type: {context_type}")
        resp = (
            supabase.table(table)
            .select("ai_result")
            .eq("id", context_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if resp.data:
            context_data = resp.data[0].get("ai_result")
        else:
            # Requested context doesn't belong to this user or doesn't exist -
            # ignore rather than leaking existence of other users' records.
            context_type, context_id = None, None
    else:
        # Default to the user's most recent prescription as grounding context,
        # if they have one.
        resp = (
            supabase.table("prescriptions")
            .select("id, ai_result")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if resp.data:
            context_type = "prescription"
            context_id = resp.data[0]["id"]
            context_data = resp.data[0].get("ai_result")

    history_resp = (
        supabase.table("chat_messages")
        .select("role, content")
        .eq("user_id", user_id)
        .eq("session_id", session_id)
        .order("created_at")
        .limit(20)
        .execute()
    )
    history = history_resp.data or []

    prompt = chat_prompt(body.message, context_data, history)
    try:
        result = gemini_service.chat_reply(prompt)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini chat failed: {exc}")

    reply = result.get("reply", "")
    followups = result.get("suggested_followups", [])

    supabase.table("chat_messages").insert(
        [
            {
                "user_id": user_id,
                "session_id": session_id,
                "role": "user",
                "content": body.message,
                "context_type": context_type,
                "context_id": context_id,
            },
            {
                "user_id": user_id,
                "session_id": session_id,
                "role": "assistant",
                "content": reply,
                "context_type": context_type,
                "context_id": context_id,
            },
        ]
    ).execute()

    return {"reply": reply, "session_id": session_id, "suggested_followups": followups}
