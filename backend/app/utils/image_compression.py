"""Downscale/recompress images before sending to Gemini and before storage.

PDFs are intentionally NOT handled here - they pass through untouched, since
Gemini 2.5 Flash accepts PDF as inline_data directly and Pillow cannot
rasterize PDFs without extra native dependencies (poppler) that we don't want
to require for a hackathon build.
"""
import io

from PIL import Image

MAX_DIMENSION = 1600
JPEG_QUALITY = 85


def compress_image(data: bytes, content_type: str) -> tuple[bytes, str]:
    """Downscales an image to a max dimension of 1600px and recompresses as JPEG.

    Returns (compressed_bytes, mime_type). Always normalizes output to JPEG
    (even for PNG/WEBP input) since JPEG at quality=85 is reliably the
    smallest for photographic prescription/bill photos - this keeps both the
    Gemini token cost and Supabase Storage footprint down.

    Falls back to returning the original bytes unchanged if the image can't
    be parsed by Pillow (defensive: should not happen since content-type is
    already validated upstream).
    """
    try:
        image = Image.open(io.BytesIO(data))
        image = image.convert("RGB")
    except Exception:
        return data, content_type

    width, height = image.size
    largest_dim = max(width, height)
    if largest_dim > MAX_DIMENSION:
        scale = MAX_DIMENSION / float(largest_dim)
        new_size = (max(1, int(width * scale)), max(1, int(height * scale)))
        image = image.resize(new_size, Image.LANCZOS)

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    return buffer.getvalue(), "image/jpeg"
