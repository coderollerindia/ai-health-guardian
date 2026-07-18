"""POST /api/emergency-check"""
from fastapi import APIRouter, Depends, HTTPException, Request

from app.database.supabase_client import get_supabase
from app.gemini.prompts import emergency_prompt
from app.models.schemas import EmergencyCheckRequest, EmergencyCheckResponse
from app.services import gemini_service
from app.utils.rate_limit import limiter
from app.utils.security import get_current_user_id

router = APIRouter(prefix="/api", tags=["emergency"])


@router.post("/emergency-check", response_model=EmergencyCheckResponse)
@limiter.limit("10/minute")
async def emergency_check(
    request: Request,
    body: EmergencyCheckRequest,
    user_id: str = Depends(get_current_user_id),
):
    prompt = emergency_prompt(body.symptoms)
    try:
        result = gemini_service.assess_emergency(prompt)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini emergency assessment failed: {exc}")

    urgency = result.get("urgency", "yellow")
    recommendation = result.get("recommendation") or {}

    # Defensive fallback: if Gemini somehow omits a recommendation, err on the
    # side of caution rather than returning an incomplete/empty object.
    if not recommendation.get("action"):
        recommendation = {
            "action": "visit_clinic",
            "reasons": ["Unable to fully assess symptoms - please consult a doctor to be safe."],
            "nearby_action": (
                "Please consult a doctor or visit a clinic soon. This assessment is not a "
                "substitute for professional medical judgement."
            ),
        }
        urgency = "yellow"

    supabase = get_supabase()
    supabase.table("emergency_checks").insert(
        {
            "user_id": user_id,
            "symptoms": body.symptoms,
            "urgency": urgency,
            "recommendation": recommendation,
        }
    ).execute()

    return {"urgency": urgency, "recommendation": recommendation}
