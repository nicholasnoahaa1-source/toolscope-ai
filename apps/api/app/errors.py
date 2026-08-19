import logging
import uuid

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("jarvis.errors")


class AppError(Exception):
    """Erro de domínio previsível, seguro para expor uma mensagem ao cliente."""

    def __init__(self, code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _error_body(request_id: str, code: str, message: str) -> dict:
    return {"error": {"code": code, "message": message, "request_id": request_id}}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        request_id = str(uuid.uuid4())
        logger.warning("app_error code=%s path=%s request_id=%s", exc.code, request.url.path, request_id)
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(request_id, exc.code, exc.message),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        request_id = str(uuid.uuid4())
        logger.warning("validation_error path=%s request_id=%s", request.url.path, request_id)
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            content=_error_body(request_id, "validation_error", "Dados inválidos na requisição."),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        request_id = str(uuid.uuid4())
        logger.exception("unhandled_error path=%s request_id=%s", request.url.path, request_id)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_error_body(request_id, "internal_error", "Erro interno. Tente novamente."),
        )
