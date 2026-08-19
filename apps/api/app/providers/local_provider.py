import json
import logging
from collections.abc import AsyncIterator

import httpx

from app.providers.errors import ProviderError

logger = logging.getLogger("jarvis.providers.local")


class LocalChatProvider:
    """Fala com um servidor de modelo local, compatível com o formato de
    streaming de chat da OpenAI (`/v1/chat/completions`, `stream: true`) —
    padrão usado por Ollama (modo compatível), LM Studio, text-generation-webui
    e outros. A URL é configurável (`JARVIS_LOCAL_PROVIDER_URL`); nunca
    presumimos que um servidor local está instalado."""

    name = "local"

    def __init__(
        self,
        base_url: str,
        model: str,
        timeout_seconds: float,
        max_retries: int,
        transport: httpx.AsyncBaseTransport | None = None,
    ):
        self._base_url = base_url.rstrip("/")
        self._model = model
        self._timeout_seconds = timeout_seconds
        self._max_retries = max_retries
        self._transport = transport  # só usado em testes; None = rede real

    async def stream(self, message: str) -> AsyncIterator[str]:
        payload = {
            "model": self._model,
            "stream": True,
            "messages": [{"role": "user", "content": message}],
        }
        url = f"{self._base_url}/v1/chat/completions"

        attempt = 0
        while True:
            try:
                async with httpx.AsyncClient(
                    timeout=self._timeout_seconds, transport=self._transport
                ) as client, client.stream(
                    "POST", url, json=payload
                ) as response:
                    if response.status_code != 200:
                        raise ProviderError(
                            f"O servidor local respondeu com erro (status {response.status_code})."
                        )
                    async for chunk in _iter_text_deltas(response):
                        yield chunk
                    return
            except httpx.TransportError as exc:
                attempt += 1
                if attempt > self._max_retries:
                    raise ProviderError(
                        "Não foi possível conectar ao provedor local. Verifique se o servidor "
                        "configurado em JARVIS_LOCAL_PROVIDER_URL está rodando."
                    ) from exc
                logger.warning("local_provider_retry attempt=%d", attempt)


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
        choices = event.get("choices") or []
        if not choices:
            continue
        delta = choices[0].get("delta", {}).get("content")
        if delta:
            yield delta
