"""POST /api/upload-bill"""
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile

from app.database.supabase_client import get_supabase
from app.gemini.prompts import bill_prompt
from app.models.schemas import BillAnalysisResponse
from app.services import fraud_detection, gemini_service, storage_service
from app.utils.file_validation import extension_for, validate_upload_file
from app.utils.image_compression import compress_image
from app.utils.rate_limit import limiter
from app.utils.security import get_current_user_id

router = APIRouter(prefix="/api", tags=["bills"])


@router.post("/upload-bill", response_model=BillAnalysisResponse)
@limiter.limit("10/minute")
async def upload_bill(
    request: Request,
    file: UploadFile = File(...),
    hospital_name: str | None = Form(None),
    location: str | None = Form(None),
    insurance_company: str | None = Form(None),
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

    prompt = bill_prompt(hospital_name, location, insurance_company, notes)
    try:
        result = gemini_service.analyze_bill(prompt, gemini_bytes, gemini_mime)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini bill analysis failed: {exc}")

    # Backend safety-net: cross-check Gemini's own GST verdict and duplicate
    # detection with deterministic arithmetic, in case the LLM missed
    # something (or hallucinated it was fine).
    subtotals = result.get("subtotals") or {}
    verification = result.setdefault("verification", {})
    if not fraud_detection.cross_check_gst(subtotals):
        verification["gst_correct"] = False

    backend_duplicates = fraud_detection.detect_duplicate_line_items(result.get("line_items") or [])
    existing_duplicates = set(verification.get("duplicate_charges") or [])
    for dup in backend_duplicates:
        existing_duplicates.add(dup)
    verification["duplicate_charges"] = list(existing_duplicates)

    file_path, file_url = storage_service.upload_file(
        user_id, "bills", storage_bytes, storage_mime, storage_ext
    )

    supabase = get_supabase()
    accuracy_score = result.get("overall_accuracy_score", 0.5)

    insert_resp = (
        supabase.table("bills")
        .insert(
            {
                "user_id": user_id,
                "hospital_name": hospital_name or result.get("hospital_name"),
                "location": location,
                "insurance_company": insurance_company,
                "notes": notes,
                "file_path": file_path,
                "ai_result": result,
                "accuracy_score": accuracy_score,
            }
        )
        .execute()
    )
    if not insert_resp.data:
        raise HTTPException(status_code=500, detail="Failed to save bill record")
    bill_row = insert_resp.data[0]

    return {**result, "id": bill_row["id"], "file_url": file_url}
