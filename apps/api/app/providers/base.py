from typing import Protocol


class ChatProvider(Protocol):
    """Contrato para qualquer provedor de chat (Mock hoje, real no futuro).

    Trocar de provedor é uma troca de implementação atrás desta interface,
    nunca uma mudança nas rotas ou no contrato de API.
    """

    def reply(self, message: str) -> str: ...
