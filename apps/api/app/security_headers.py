from collections.abc import Awaitable, Callable

from fastapi import FastAPI, Request, Response

# Nenhuma resposta desta API deve ser indexada ou referenciada por buscadores
# — o JARVIS é um sistema privado acessado só por link secreto.
_ROBOTS_DIRECTIVES = "noindex, nofollow, noarchive, nosnippet, noimageindex"


def register_security_headers(app: FastAPI) -> None:
    @app.middleware("http")
    async def add_security_headers(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        response = await call_next(request)
        response.headers["X-Robots-Tag"] = _ROBOTS_DIRECTIVES
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response

    @app.get("/robots.txt", include_in_schema=False)
    async def robots_txt() -> Response:
        return Response(content="User-agent: *\nDisallow: /\n", media_type="text/plain")
