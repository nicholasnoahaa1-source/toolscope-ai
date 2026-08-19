from app.config import Settings

from .anthropic_provider import AnthropicChatProvider
from .base import ChatProvider
from .errors import ProviderError
from .local_provider import LocalChatProvider
from .mock import MockChatProvider

__all__ = [
    "AnthropicChatProvider",
    "ChatProvider",
    "LocalChatProvider",
    "MockChatProvider",
    "ProviderError",
    "get_chat_provider",
]


def get_chat_provider(settings: Settings) -> ChatProvider:
    """Cria o provedor configurado. Nunca lança por falta de configuração
    do Mock — só provedores opcionais (anthropic/local) podem ficar
    indisponíveis, e nesse caso o chamador deve oferecer o Mock como
    alternativa."""
    if settings.chat_provider == "mock":
        return MockChatProvider()

    if settings.chat_provider == "anthropic":
        if not settings.anthropic_api_key or not settings.model:
            raise ProviderError(
                "Provedor Anthropic não está configurado (defina JARVIS_ANTHROPIC_API_KEY e JARVIS_MODEL)."
            )
        return AnthropicChatProvider(
            api_key=settings.anthropic_api_key,
            model=settings.model,
            timeout_seconds=settings.request_timeout_seconds,
            max_retries=settings.max_provider_retries,
        )

    if settings.chat_provider == "local":
        if not settings.local_provider_url:
            raise ProviderError("Provedor local não está configurado (defina JARVIS_LOCAL_PROVIDER_URL).")
        return LocalChatProvider(
            base_url=settings.local_provider_url,
            model=settings.model,
            timeout_seconds=settings.request_timeout_seconds,
            max_retries=settings.max_provider_retries,
        )

    raise ProviderError(f"Provedor de chat desconhecido: {settings.chat_provider}")
