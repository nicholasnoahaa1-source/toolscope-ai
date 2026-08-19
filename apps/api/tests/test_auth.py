import logging

from app.auth import create_session_token, is_session_valid
from app.config import Settings
from tests.conftest import TEST_ACCESS_TOKEN


def test_correct_token_creates_a_session(client):
    response = client.post("/api/entrar", json={"token": TEST_ACCESS_TOKEN})

    assert response.status_code == 200
    assert response.json() == {"ok": True}
    assert "jarvis_session" in response.cookies

    session_response = client.get("/api/session")
    assert session_response.status_code == 200
    assert session_response.json() == {"authenticated": True}


def test_incorrect_token_looks_like_a_missing_route(client):
    response = client.post("/api/entrar", json={"token": "not-the-right-token"})

    assert response.status_code == 404
    assert response.json() == {"detail": "Not Found"}


def test_apis_are_unreachable_without_a_session(client):
    response = client.get("/api/session")

    assert response.status_code == 404
    assert response.json() == {"detail": "Not Found"}


def test_tampered_session_cookie_is_rejected(client):
    client.post("/api/entrar", json={"token": TEST_ACCESS_TOKEN})
    client.cookies.set("jarvis_session", "tampered-value")

    response = client.get("/api/session")

    assert response.status_code == 404


def test_rotating_the_session_secret_invalidates_existing_sessions():
    old_settings = Settings(session_secret="secret-a")
    new_settings = Settings(session_secret="secret-b")

    token = create_session_token(old_settings)

    assert is_session_valid(token, old_settings) is True
    assert is_session_valid(token, new_settings) is False


def test_rate_limit_blocks_further_attempts_even_with_the_correct_token(client, test_settings):
    for _ in range(test_settings.entrar_rate_limit_attempts):
        client.post("/api/entrar", json={"token": "wrong-token"})

    response = client.post("/api/entrar", json={"token": TEST_ACCESS_TOKEN})

    assert response.status_code == 404


def test_failed_attempt_never_logs_the_submitted_token(client, caplog):
    with caplog.at_level(logging.WARNING):
        client.post("/api/entrar", json={"token": "super-secret-guess-value"})

    assert "super-secret-guess-value" not in caplog.text


def test_responses_carry_anti_indexing_headers(client):
    response = client.get("/api/health")

    assert response.headers["x-robots-tag"] == "noindex, nofollow, noarchive, nosnippet, noimageindex"
    assert response.headers["referrer-policy"] == "no-referrer"


def test_robots_txt_disallows_everything(client):
    response = client.get("/robots.txt")

    assert response.status_code == 200
    assert "Disallow: /" in response.text
