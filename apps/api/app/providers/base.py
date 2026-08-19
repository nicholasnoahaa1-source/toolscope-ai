from collections.abc import AsyncIterator
from typing import Protocol


class ChatProvider(Protocol):
    """Contrato para qualquer provedor de chat (Mock hoje, real opcionalmente).

    Trocar de provedor é uma troca de implementação atrás desta interface,
    nunca uma mudança nas rotas ou no contrato de API. `stream` deve gerar
    pedaços de texto conforme ficam disponíveis; erros de rede/configuração
    devem ser sinalizados levantando `ProviderError` antes do primeiro
    pedaço, para que o chamador possa tentar de novo ou cair para o Mock.
    """

    name: str

    def stream(self, message: str) -> AsyncIterator[str]: ...
