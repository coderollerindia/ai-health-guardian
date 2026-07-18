"""Singleton Supabase client using the SERVICE ROLE key.

This client bypasses Row Level Security, so every query issued through it
MUST explicitly filter (or write) by the `user_id` obtained from the verified
JWT (see app.utils.security.get_current_user_id). Never trust a user_id that
arrives in a request body.
"""
from supabase import create_client, Client

from app.config import settings

_supabase: Client | None = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    return _supabase
