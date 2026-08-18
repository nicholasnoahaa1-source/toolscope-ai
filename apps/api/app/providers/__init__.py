from .base import ChatProvider
from .mock import MockChatProvider

__all__ = ["ChatProvider", "MockChatProvider", "get_chat_provider"]


def get_chat_provider(name: str) -> ChatProvider:
    if name == "mock":
        return MockChatProvider()
    raise ValueError(f"Provedor de chat desconhecido: {name}")
