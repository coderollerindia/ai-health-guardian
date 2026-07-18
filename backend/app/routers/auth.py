"""Liveness check + auth/session helper endpoints.

Login itself happens entirely on the frontend via @supabase/supabase-js
(Google OAuth) - the backend never sees credentials. This router only
exposes the unauthenticated `/api/health` liveness probe and a small
authenticated `/api/me` helper the frontend can use to confirm its bearer
token is valid and see which user_id the backend resolved it to.
"""
from fastapi import APIRouter, Depends

from app.utils.security import get_current_user_id

router = APIRouter(prefix="/api", tags=["auth"])


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/me")
async def me(user_id: str = Depends(get_current_user_id)):
    return {"user_id": user_id}
