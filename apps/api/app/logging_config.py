import logging
import sys
from datetime import UTC, datetime
from json import dumps
from typing import Any


class JsonLogFormatter(logging.Formatter):
    """Formata logs como JSON de uma linha, sem campos sensíveis.

    Apenas metadados (nível, logger, mensagem, timestamp) são registrados.
    Nunca inclua corpo de mensagens de usuário ou segredos ao logar.
    """

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exc_type"] = str(record.exc_info[0].__name__) if record.exc_info[0] else None
        return dumps(payload, ensure_ascii=False)


def configure_logging(level: str) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonLogFormatter())

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(level.upper())
