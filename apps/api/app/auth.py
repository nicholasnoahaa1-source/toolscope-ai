import hashlib
import hmac
import logging
import time
from collections import defaultdict

from fastapi import Depends, HTTPException, Request, status
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from app.config import Settings, get_settings

logger = logging.getLogger("jarvis.auth")

_SESSION_PAYLOAD = "authenticated"

# Contador em memória de tentativas inválidas por IP. Suficiente para um
# único processo (uso pessoal); uma implantação com múltiplos processos
# precisaria de um armazenamento compartilhado (ex.: Redis) — limitação
# documentada em docs/security-model.md.
_failed_attempts: dict[str, list[float]] = defaultdict(list)


def _not_found() -> HTTPException:
    """Resposta idêntica ao 404 padrão do FastAPI para rota inexistente —
    quem não tem sessão válida não pode distinguir 'rota protegida' de
    'rota que não existe'."""
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not Found")


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def verify_access_token(token: str, settings: Settings) -> bool:
    """Compara o token informado com o hash configurado, resistente a
    ataques de tempo. Sem hash configurado, nenhum token é aceito."""
    if not settings.access_token_hash:
        return False
    candidate_hash = hash_token(token)
    return hmac.compare_digest(candidate_hash, settings.access_token_hash)


def _get_serializer(settings: Settings) -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(settings.session_secret, salt="jarvis-session")


def create_session_token(settings: Settings) -> str:
    return _get_serializer(settings).dumps({_SESSION_PAYLOAD: True})


def is_session_valid(token: str | None, settings: Settings) -> bool:
    if not token:
        return False
    try:
        data = _get_serializer(settings).loads(token, max_age=settings.session_max_age_seconds)
    except (BadSignature, SignatureExpired):
        return False
    return bool(data.get(_SESSION_PAYLOAD) is True)


def check_rate_limit(client_ip: str, settings: Settings) -> bool:
    """True se o IP ainda pode tentar; nunca registra o token enviado."""
    now = time.monotonic()
    window_start = now - settings.entrar_rate_limit_window_seconds
    attempts = [t for t in _failed_attempts[client_ip] if t > window_start]
    _failed_attempts[client_ip] = attempts
    return len(attempts) < settings.entrar_rate_limit_attempts


def record_failed_attempt(client_ip: str) -> None:
    _failed_attempts[client_ip].append(time.monotonic())
    logger.warning("entrar_failed client_ip=%s", client_ip)


def require_session(request: Request, settings: Settings = Depends(get_settings)) -> None:
    """Dependência do FastAPI: 404 (não 401/403) quando a sessão é ausente,
    adulterada ou expirada, para nunca revelar que existe um JARVIS privado
    atrás da rota."""
    cookie = request.cookies.get(settings.session_cookie_name)
    if not is_session_valid(cookie, settings):
        raise _not_found()
