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


@lru_cache
def get_settings() -> Settings:
    return Settings()
