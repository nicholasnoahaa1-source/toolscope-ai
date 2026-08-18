# apps/bridge (placeholder)

Ponte de controle remoto do Windows. Ainda não implementado — nenhum código
de execução existe aqui nesta etapa.

Quando implementada, esta ponte só operará com:

1. **Pareamento explícito** entre o dispositivo cliente (celular/navegador) e
   o computador Windows (ex.: código de pareamento exibido no computador e
   digitado no cliente).
2. **Lista de permissões (allowlist)** de ações e aplicativos autorizados,
   configurada localmente pelo usuário — nunca execução arbitrária de
   comandos.
3. **Confirmação explícita** antes de qualquer ação sensível.
4. **Sem privilégios de administrador** e sem desativação de proteções do
   sistema.

Ver `docs/security-model.md` para o modelo de segurança completo.
