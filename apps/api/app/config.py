from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuração por ambiente. Nenhum valor sensível tem default real."""

    model_config = SettingsConfigDict(env_file=".env", env_prefix="JARVIS_", extra="ignore")

    app_name: str = "JARVIS Universal API"
    environment: str = "development"
    log_level: str = "INFO"
    chat_provider: str = "mock"

    # Origens explícitas permitidas para CORS em desenvolvimento.
    # Nunca usar "*" combinado com allow_credentials=True.
    cors_allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # --- Acesso por link secreto (sem login/senha) ---
    # Hash SHA-256 (hex) do token de acesso real. O token em texto puro
    # nunca é configurado nem armazenado — só o hash, gerado por
    # scripts/generate-access-link.ps1. Vazio = acesso desativado (nenhum
    # token é aceito), o que é o padrão seguro para desenvolvimento local
    # sem link configurado.
    access_token_hash: str = ""
    # Chave usada para assinar o cookie de sessão. Trocar este valor
    # invalida todas as sessões emitidas anteriormente.
    session_secret: str = "changeme-dev-only-session-secret"
    session_cookie_name: str = "jarvis_session"
    session_max_age_seconds: int = 60 * 60 * 24 * 30  # 30 dias
    # Tentativas inválidas de /api/entrar aceitas por IP na janela abaixo.
    entrar_rate_limit_attempts: int = 5
    entrar_rate_limit_window_seconds: int = 60


@lru_cache
def get_settings() -> Settings:
    return Settings()
