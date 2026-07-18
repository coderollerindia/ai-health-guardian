"""Upload validation: content-type allow-list + max size enforcement."""
from fastapi import HTTPException, UploadFile

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


async def validate_upload_file(file: UploadFile) -> bytes:
    """Reads and validates an UploadFile. Returns the raw bytes on success.

    Raises HTTP 400 for disallowed content types, empty files, or files over
    the 10MB limit.
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type '{file.content_type}'. "
                "Allowed types: image/jpeg, image/png, image/webp, application/pdf"
            ),
        )

    contents = await file.read()

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds the 10MB size limit")

    # Reset the stream in case any caller wants to re-read it.
    await file.seek(0)
    return contents


def extension_for(content_type: str, filename: str | None) -> str:
    """Best-effort file extension derived from content-type, falling back to filename."""
    mapping = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "application/pdf": "pdf",
    }
    if content_type in mapping:
        return mapping[content_type]
    if filename and "." in filename:
        return filename.rsplit(".", 1)[-1].lower()
    return "bin"
