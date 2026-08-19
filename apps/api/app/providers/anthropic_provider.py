import json
import logging
from collections.abc import AsyncIterator

import httpx

from app.providers.errors import ProviderError

logger = logging.getLogger("jarvis.providers.anthropic")

_API_URL = "https://api.anthropic.com/v1/messages"
_API_VERSION = "2023-06-01"
_MAX_TOKENS = 1024


class AnthropicChatProvider:
    """Chama a API de Mensagens da Anthropic, sempre a partir do servidor —
    a chave nunca é enviada ao frontend. O modelo vem de configuração
    (`JARVIS_MODEL`), nunca fixo no código."""

    name = "anthropic"

    def __init__(
        self,
        api_key: str,
        model: str,
        timeout_seconds: float,
        max_retries: int,
        transport: httpx.AsyncBaseTransport | None = None,
    ):
        self._api_key = api_key
        self._model = model
        self._timeout_seconds = timeout_seconds
        self._max_retries = max_retries
        self._transport = transport  # só usado em testes; None = rede real

    async def stream(self, message: str) -> AsyncIterator[str]:
        headers = {
            "x-api-key": self._api_key,
            "anthropic-version": _API_VERSION,
            "content-type": "application/json",
        }
        payload = {
            "model": self._model,
            "max_tokens": _MAX_TOKENS,
            "stream": True,
            "messages": [{"role": "user", "content": message}],
        }

        attempt = 0
        while True:
            try:
                async with httpx.AsyncClient(
                    timeout=self._timeout_seconds, transport=self._transport
                ) as client, client.stream(
                    "POST", _API_URL, headers=headers, json=payload
                ) as response:
                    if response.status_code != 200:
                        raise ProviderError(
                            f"O provedor Anthropic respondeu com erro (status {response.status_code})."
                        )
                    async for chunk in _iter_text_deltas(response):
                        yield chunk
                    return
            except httpx.TransportError as exc:
                attempt += 1
                if attempt > self._max_retries:
                    raise ProviderError("Não foi possível conectar ao provedor Anthropic.") from exc
                logger.warning("anthropic_retry attempt=%d", attempt)


async def _iter_text_deltas(response: httpx.Response) -> AsyncIterator[str]:
    async for line in response.aiter_lines():
        if not line.startswith("data:"):
            continue
        data = line[len("data:") :].strip()
        if not data or data == "[DONE]":
            continue
        try:
            event = json.loads(data)
        except json.JSONDecodeError:
            continue
        if event.get("type") == "content_block_delta":
            delta = event.get("delta", {}).get("text")
            if delta:
                yield delta
