"""JWT verification for Supabase-issued access tokens.

Newer Supabase projects sign access tokens with an asymmetric key (ES256) and
publish the public keys at `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
rotating the `kid` over time — there is no static secret to configure for
this case. Older projects (or tokens issued just before a migration to
asymmetric keys, until they naturally expire) may still use a shared HS256
secret instead. This module supports both: it picks the verification method
per-token from the JWT header (`alg`), so it keeps working across a project's
key-type migration without a code change.
"""
import time

import requests
from fastapi import Header, HTTPException, status
from jose import jwt
from jose.exceptions import JWTError

from app.config import settings

_JWKS_TTL_SECONDS = 600
_jwks_cache: dict = {"keys": [], "fetched_at": 0.0}


def _fetch_jwks(force: bool = False) -> list[dict]:
    now = time.time()
    if force or not _jwks_cache["keys"] or now - _jwks_cache["fetched_at"] > _JWKS_TTL_SECONDS:
        url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        _jwks_cache["keys"] = response.json().get("keys", [])
        _jwks_cache["fetched_at"] = now
    return _jwks_cache["keys"]


def _verify_asymmetric(token: str, alg: str, kid: str | None) -> dict:
    matching_key = next((k for k in _fetch_jwks() if k.get("kid") == kid), None)
    if matching_key is None:
        # kid not in our cache — the project may have rotated keys since we
        # last fetched. Force one refresh before giving up.
        matching_key = next((k for k in _fetch_jwks(force=True) if k.get("kid") == kid), None)
    if matching_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No matching JWKS signing key found for this token",
        )
    return jwt.decode(token, matching_key, algorithms=[alg], audience="authenticated")


def get_current_user_id(authorization: str | None = Header(None)) -> str:
    """FastAPI dependency: verifies the Supabase JWT and returns the user id (sub claim).

    Raises 401 if the header is missing, malformed, or the token fails verification.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    token = authorization.split(" ", 1)[1].strip()

    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")

        if alg == "HS256":
            if not settings.SUPABASE_JWT_SECRET:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Received an HS256 token but SUPABASE_JWT_SECRET is not configured",
                )
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
        else:
            payload = _verify_asymmetric(token, alg, header.get("kid"))
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {exc}",
        )
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Could not verify token — JWKS fetch failed: {exc}",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject (sub) claim",
        )

    return user_id
