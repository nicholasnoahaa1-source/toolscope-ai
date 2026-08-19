import httpx
import pytest

from app.providers.anthropic_provider import AnthropicChatProvider
from app.providers.errors import ProviderError
from app.providers.local_provider import LocalChatProvider


def _sse_body(lines: list[str]) -> bytes:
    return ("\n".join(lines) + "\n").encode("utf-8")


async def test_anthropic_provider_streams_text_deltas():
    body = _sse_body(
        [
            'data: {"type": "content_block_delta", "delta": {"text": "Olá"}}',
            "",
            'data: {"type": "content_block_delta", "delta": {"text": ", senhor."}}',
            "",
            "data: [DONE]",
        ]
    )

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["x-api-key"] == "test-key"
        return httpx.Response(200, content=body)

    provider = AnthropicChatProvider(
        api_key="test-key", model="test-model", timeout_seconds=5, max_retries=0, transport=httpx.MockTransport(handler)
    )

    chunks = [chunk async for chunk in provider.stream("olá")]
    assert "".join(chunks) == "Olá, senhor."


async def test_anthropic_provider_raises_on_non_200_without_leaking_body():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(401, json={"error": {"message": "invalid x-api-key: sk-ant-super-secret"}})

    provider = AnthropicChatProvider(
        api_key="wrong-key", model="test-model", timeout_seconds=5, max_retries=0, transport=httpx.MockTransport(handler)
    )

    with pytest.raises(ProviderError) as excinfo:
        async for _ in provider.stream("olá"):
            pass

    assert "sk-ant-super-secret" not in str(excinfo.value)
    assert "401" in str(excinfo.value)


async def test_anthropic_provider_retries_transport_errors_then_fails_closed():
    attempts = {"count": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        attempts["count"] += 1
        raise httpx.ConnectError("connection refused", request=request)

    provider = AnthropicChatProvider(
        api_key="test-key", model="test-model", timeout_seconds=5, max_retries=2, transport=httpx.MockTransport(handler)
    )

    with pytest.raises(ProviderError, match="conectar"):
        async for _ in provider.stream("olá"):
            pass

    assert attempts["count"] == 3  # tentativa inicial + 2 retries


async def test_local_provider_streams_openai_style_deltas():
    body = _sse_body(
        [
            'data: {"choices": [{"delta": {"content": "oi"}}]}',
            "",
            'data: {"choices": [{"delta": {"content": " tudo bem"}}]}',
            "",
            "data: [DONE]",
        ]
    )

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/v1/chat/completions"
        return httpx.Response(200, content=body)

    provider = LocalChatProvider(
        base_url="http://localhost:11434",
        model="llama3",
        timeout_seconds=5,
        max_retries=0,
        transport=httpx.MockTransport(handler),
    )

    chunks = [chunk async for chunk in provider.stream("oi")]
    assert "".join(chunks) == "oi tudo bem"


async def test_local_provider_explains_the_server_is_unreachable():
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("connection refused", request=request)

    provider = LocalChatProvider(
        base_url="http://localhost:1", model="x", timeout_seconds=5, max_retries=0, transport=httpx.MockTransport(handler)
    )

    with pytest.raises(ProviderError, match="JARVIS_LOCAL_PROVIDER_URL"):
        async for _ in provider.stream("oi"):
            pass
