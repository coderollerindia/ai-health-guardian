"""Supabase Storage helper: uploads originals to the private `uploads` bucket
under a per-user folder, and returns a short-lived signed URL for display."""
import uuid

from app.database.supabase_client import get_supabase

BUCKET_NAME = "uploads"
SIGNED_URL_EXPIRY_SECONDS = 60 * 60  # 1 hour


def upload_file(
    user_id: str,
    category: str,
    file_bytes: bytes,
    content_type: str,
    extension: str,
) -> tuple[str, str]:
    """Uploads a file to `uploads/{user_id}/{category}/{uuid}.{extension}`.

    Returns (file_path, signed_url). `file_path` is the storage-relative path
    to persist in the DB row; `signed_url` is a temporary browser-viewable URL
    (the bucket is private, so plain public URLs will not work).
    """
    supabase = get_supabase()
    file_id = str(uuid.uuid4())
    path = f"{user_id}/{category}/{file_id}.{extension}"

    supabase.storage.from_(BUCKET_NAME).upload(
        path,
        file_bytes,
        {"content-type": content_type},
    )

    signed = supabase.storage.from_(BUCKET_NAME).create_signed_url(path, SIGNED_URL_EXPIRY_SECONDS)
    # supabase-py has returned this dict under slightly different keys across
    # versions ("signedURL" vs "signed_url") - handle both defensively.
    file_url = ""
    if isinstance(signed, dict):
        file_url = signed.get("signedURL") or signed.get("signed_url") or ""

    return path, file_url


def get_signed_url(path: str, expires_in: int = SIGNED_URL_EXPIRY_SECONDS) -> str:
    supabase = get_supabase()
    signed = supabase.storage.from_(BUCKET_NAME).create_signed_url(path, expires_in)
    if isinstance(signed, dict):
        return signed.get("signedURL") or signed.get("signed_url") or ""
    return ""
