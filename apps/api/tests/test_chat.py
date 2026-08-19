def test_chat_requires_a_session(client):
    response = client.post("/api/chat", json={"message": "olá"})

    assert response.status_code == 404
    assert response.json() == {"detail": "Not Found"}


def test_chat_returns_mock_reply_in_portuguese(authenticated_client):
    response = authenticated_client.post("/api/chat", json={"message": "olá"})

    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "mock"
    assert isinstance(body["reply"], str) and len(body["reply"]) > 0


def test_chat_rejects_empty_message(authenticated_client):
    response = authenticated_client.post("/api/chat", json={"message": ""})

    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "validation_error"


def test_chat_rejects_missing_message(authenticated_client):
    response = authenticated_client.post("/api/chat", json={})

    assert response.status_code == 422
