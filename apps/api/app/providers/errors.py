class ProviderError(Exception):
    """Erro de provedor de chat, seguro para mostrar ao usuário — nunca deve
    conter chaves, segredos ou detalhes internos do servidor."""
