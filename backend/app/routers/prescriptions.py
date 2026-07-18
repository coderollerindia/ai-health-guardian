"""POST /api/upload-prescription"""
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile

from app.database.supabase_client import get_supabase
from app.gemini.prompts import prescription_prompt
from app.models.schemas import PrescriptionAnalysisResponse
from app.services import gemini_service, storage_service
from app.utils.file_validation import extension_for, validate_upload_file
from app.utils.image_compression import compress_image
from app.utils.rate_limit import limiter
from app.utils.security import get_current_user_id

router = APIRouter(prefix="/api", tags=["prescriptions"])


@router.post("/upload-prescription", response_model=PrescriptionAnalysisResponse)
@limiter.limit("10/minute")
async def upload_prescription(
    request: Request,
    file: UploadFile = File(...),
    notes: str | None = Form(None),
    user_id: str = Depends(get_current_user_id),
):
    raw_bytes = await validate_upload_file(file)
    content_type = file.content_type
    ext = extension_for(content_type, file.filename)

    if content_type == "application/pdf":
        gemini_bytes, gemini_mime = raw_bytes, content_type
        storage_bytes, storage_mime, storage_ext = raw_bytes, content_type, ext
    else:
        compressed_bytes, compressed_mime = compress_image(raw_bytes, content_type)
        gemini_bytes, gemini_mime = compressed_bytes, compressed_mime
        storage_bytes, storage_mime, storage_ext = compressed_bytes, compressed_mime, "jpg"

    prompt = prescription_prompt(notes)
    try:
        result = gemini_service.analyze_prescription(prompt, gemini_bytes, gemini_mime)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini prescription analysis failed: {exc}")

    file_path, file_url = storage_service.upload_file(
        user_id, "prescriptions", storage_bytes, storage_mime, storage_ext
    )

    supabase = get_supabase()
    confidence_score = result.get("confidence_score", 0.5)

    insert_resp = (
        supabase.table("prescriptions")
        .insert(
            {
                "user_id": user_id,
                "file_path": file_path,
                "notes": notes,
                "ai_result": result,
                "confidence_score": confidence_score,
            }
        )
        .execute()
    )
    if not insert_resp.data:
        raise HTTPException(status_code=500, detail="Failed to save prescription record")
    prescription_row = insert_resp.data[0]
    prescription_id = prescription_row["id"]

    medicines = result.get("medicines") or []
    if medicines:
        medicine_rows = [
            {
                "prescription_id": prescription_id,
                "name": m.get("name") or "",
                "purpose": m.get("purpose"),
                "dosage": m.get("dosage"),
                "morning": bool(m.get("morning", False)),
                "afternoon": bool(m.get("afternoon", False)),
                "night": bool(m.get("night", False)),
                "before_food": bool(m.get("before_food", False)),
                "after_food": bool(m.get("after_food", False)),
                "duration": m.get("duration"),
                "side_effects": m.get("side_effects") or [],
                "important_notes": m.get("important_notes"),
                "unclear": bool(m.get("unclear", False)),
            }
            for m in medicines
        ]
        supabase.table("medicines").insert(medicine_rows).execute()

    return {**result, "id": prescription_id, "file_url": file_url}
