import logging

from fastapi import APIRouter, Depends

from app.auth import require_session
from app.config import Settings, get_settings
from app.providers import get_chat_provider
from app.schemas import ChatRequest, ChatResponse

router = APIRouter(tags=["chat"])
logger = logging.getLogger("jarvis.chat")


@router.post("/api/chat", response_model=ChatResponse, dependencies=[Depends(require_session)])
async def post_chat(payload: ChatRequest, settings: Settings = Depends(get_settings)) -> ChatResponse:
    provider = get_chat_provider(settings.chat_provider)
    reply = provider.reply(payload.message)
    logger.info("chat_reply provider=%s message_length=%d", settings.chat_provider, len(payload.message))
    return ChatResponse(reply=reply, provider=settings.chat_provider)
