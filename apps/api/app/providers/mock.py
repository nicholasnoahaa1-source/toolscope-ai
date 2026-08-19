import asyncio
import random
from collections.abc import AsyncIterator

# Pequeno atraso entre palavras para simular streaming real de forma
# determinística nos testes (sem depender de rede).
_WORD_DELAY_SECONDS = 0.01


class MockChatProvider:
    """Provedor de demonstração: respostas fixas em pt-BR, sem chamada externa."""

    name = "mock"

    _greetings = ("oi", "olá", "ola", "bom dia", "boa tarde", "boa noite")

    _fallback_replies = (
        "Entendido. Ainda estou no modo de demonstração, mas registrei sua mensagem.",
        "Compreendido. No momento respondo com dados simulados, senhor(a).",
        "Anotado. Em breve poderei responder com mais profundidade.",
    )

    def _reply_text(self, message: str) -> str:
        normalized = message.strip().lower()

        if not normalized:
            return "Não recebi nenhuma mensagem. Pode repetir, por favor?"

        if any(normalized.startswith(greeting) for greeting in self._greetings):
            return "Olá. Sistemas em modo de demonstração, prontos para ajudar."

        if "hora" in normalized or "horas" in normalized:
            return "Ainda não tenho acesso ao relógio do sistema neste modo de demonstração."

        if "quem é você" in normalized or "quem e voce" in normalized:
            return "Sou o JARVIS, em modo de demonstração — respostas simuladas, sem provedor externo."

        return random.choice(self._fallback_replies)

    async def stream(self, message: str) -> AsyncIterator[str]:
        words = self._reply_text(message).split(" ")
        for index, word in enumerate(words):
            yield word if index == 0 else f" {word}"
            await asyncio.sleep(_WORD_DELAY_SECONDS)
