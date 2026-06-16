from __future__ import annotations

import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.endpoints.auth_endpoint import user_router
from src.core.config import settings


def _normalize_origins(origins: str | list[str] | None) -> list[str]:
    if origins is None:
        return ["*"]
    if isinstance(origins, list):
        return origins
    try:
        parsed = json.loads(origins)
        if isinstance(parsed, list):
            return parsed
    except ValueError:
        pass
    return [origins]


app = FastAPI(title=settings.APP_NAME or "AI Assistants")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_normalize_origins(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(user_router)


