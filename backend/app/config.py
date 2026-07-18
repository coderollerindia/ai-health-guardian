"""Application configuration, loaded from environment variables / .env file."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    # Legacy shared HS256 secret. Optional: new Supabase projects sign access
    # tokens with an asymmetric key (ES256) instead, verified via JWKS — see
    # app/utils/security.py. Only needed as a fallback for old HS256 tokens
    # still in circulation right after a project migrates key types.
    SUPABASE_JWT_SECRET: str = ""
    # Extra allowed CORS origin (e.g. the deployed Vercel URL), in addition to
    # the localhost dev origin which is always allowed.
    ALLOWED_ORIGIN: str = ""
    ENV: str = "development"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
