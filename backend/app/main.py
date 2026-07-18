"""FastAPI app entrypoint for AI Health Guardian backend."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.routers import (
    auth,
    bills,
    chat,
    dashboard,
    emergency,
    health_score,
    history,
    prescriptions,
    reminders,
    summary,
)
from app.utils.rate_limit import limiter

app = FastAPI(
    title="AI Health Guardian API",
    description="Backend for the AI Health Guardian hackathon healthcare app.",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Dev origin is always allowed; ALLOWED_ORIGIN adds the deployed frontend URL.
_allowed_origins = ["http://localhost:5173"]
if settings.ALLOWED_ORIGIN:
    _allowed_origins.append(settings.ALLOWED_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(prescriptions.router)
app.include_router(bills.router)
app.include_router(chat.router)
app.include_router(history.router)
app.include_router(summary.router)
app.include_router(reminders.router)
app.include_router(dashboard.router)
app.include_router(emergency.router)
app.include_router(health_score.router)
