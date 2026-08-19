import logging

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, Field

from app.auth import (
    check_rate_limit,
    create_session_token,
    record_failed_attempt,
    require_session,
    verify_access_token,
)
from app.config import Settings, get_settings

router = APIRouter(tags=["auth"])
logger = logging.getLogger("jarvis.auth")


class EntrarRequest(BaseModel):
    token: str = Field(min_length=1, max_length=512)


def _not_found() -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not Found")


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


@router.post("/api/entrar")
async def post_entrar(
    payload: EntrarRequest,
    request: Request,
    response: Response,
    settings: Settings = Depends(get_settings),
) -> dict[str, bool]:
    client_ip = _client_ip(request)

    if not check_rate_limit(client_ip, settings):
        # Mesma resposta de "não existe" — não revela que houve bloqueio
        # por limite de tentativas.
        raise _not_found()

    if not verify_access_token(payload.token, settings):
        record_failed_attempt(client_ip)
        raise _not_found()

    session_token = create_session_token(settings)
    response.set_cookie(
        key=settings.session_cookie_name,
        value=session_token,
        max_age=settings.session_max_age_seconds,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        path="/",
    )
    logger.info("entrar_succeeded client_ip=%s", client_ip)
    return {"ok": True}


@router.get("/api/session", dependencies=[Depends(require_session)])
async def get_session() -> dict[str, bool]:
    return {"authenticated": True}
