import asyncio
import json
import logging
from datetime import UTC, date, datetime

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from app.auth import require_session
from app.config import Settings, get_settings
from app.providers import ProviderError, get_chat_provider
from app.schemas import ChatRequest

router = APIRouter(tags=["chat"])
logger = logging.getLogger("jarvis.chat")

# Estado em memória, por processo — suficiente para uso pessoal em um único
# worker. Uma implantação com múltiplos processos precisaria de um
# armazenamento compartilhado para o limite diário e a concorrência valerem
# entre eles (mesma limitação documentada para o rate limit de /api/entrar).
_semaphores: dict[int, asyncio.Semaphore] = {}
_daily_counts: dict[str, tuple[date, int]] = {}


def _get_semaphore(settings: Settings) -> asyncio.Semaphore:
    loop_key = id(asyncio.get_running_loop())
    semaphore = _semaphores.get(loop_key)
    if semaphore is None:
        semaphore = asyncio.Semaphore(settings.max_concurrent_provider_requests)
        _semaphores[loop_key] = semaphore
    return semaphore


def _daily_limit_exceeded(client_ip: str, settings: Settings) -> bool:
    # O Mock não tem custo — só provedores pagos/externos são limitados.
    if settings.chat_provider == "mock":
        return False

    today = datetime.now(UTC).date()
    tracked_date, count = _daily_counts.get(client_ip, (today, 0))
    if tracked_date != today:
        count = 0
    if count >= settings.daily_message_limit:
        return True
    _daily_counts[client_ip] = (today, count + 1)
    return False


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


@router.get("/api/chat/status", dependencies=[Depends(require_session)])
async def get_chat_status(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {"provider": settings.chat_provider}


@router.post("/api/chat", dependencies=[Depends(require_session)])
async def post_chat(
    payload: ChatRequest, request: Request, settings: Settings = Depends(get_settings)
) -> StreamingResponse:
    client_ip = _client_ip(request)

    async def event_stream():
        if _daily_limit_exceeded(client_ip, settings):
            logger.warning("chat_daily_limit_reached provider=%s", settings.chat_provider)
            yield _sse(
                "error",
                {
                    "message": "Limite diário de mensagens atingido para este provedor. Tente novamente amanhã "
                    "ou mude para o modo demonstração nas configurações.",
                    "provider": settings.chat_provider,
                },
            )
            return

        try:
            provider = get_chat_provider(settings)
        except ProviderError as exc:
            logger.warning("provider_unavailable provider=%s", settings.chat_provider)
            yield _sse("error", {"message": str(exc), "provider": settings.chat_provider})
            return

        semaphore = _get_semaphore(settings)
        async with semaphore:
            try:
                async for chunk in provider.stream(payload.message):
                    if await request.is_disconnected():
                        logger.info("chat_stream_cancelled provider=%s", provider.name)
                        return
                    yield _sse("chunk", {"text": chunk})
            except ProviderError as exc:
                logger.warning("provider_stream_failed provider=%s", provider.name)
                yield _sse("error", {"message": str(exc), "provider": provider.name})
                return

        logger.info("chat_stream_done provider=%s", provider.name)
        yield _sse("done", {"provider": provider.name})

    return StreamingResponse(event_stream(), media_type="text/event-stream")
