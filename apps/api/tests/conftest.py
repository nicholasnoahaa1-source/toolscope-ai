import pytest
from fastapi.testclient import TestClient

from app import auth
from app.auth import hash_token
from app.config import Settings, get_settings
from app.main import app

TEST_ACCESS_TOKEN = "test-only-access-token-not-a-secret"


@pytest.fixture(autouse=True)
def reset_rate_limit_state():
    # TestClient sempre reporta o mesmo IP; sem isso, um teste de limite de
    # tentativas vazaria para os testes seguintes.
    auth._failed_attempts.clear()
    yield
    auth._failed_attempts.clear()


@pytest.fixture
def test_settings() -> Settings:
    return Settings(
        access_token_hash=hash_token(TEST_ACCESS_TOKEN),
        session_secret="test-only-session-secret",
        environment="development",
        chat_provider="mock",
        entrar_rate_limit_attempts=5,
        entrar_rate_limit_window_seconds=60,
    )


@pytest.fixture
def client(test_settings: Settings) -> TestClient:
    app.dependency_overrides[get_settings] = lambda: test_settings
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def authenticated_client(client: TestClient) -> TestClient:
    response = client.post("/api/entrar", json={"token": TEST_ACCESS_TOKEN})
    assert response.status_code == 200
    return client
