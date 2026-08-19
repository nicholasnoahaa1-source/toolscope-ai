import './OfflineNotice.css'

export function OfflineNotice() {
  return (
    <div className="offline-notice" role="status">
      <p className="offline-notice-title">Sem conexão no momento.</p>
      <p>
        A interface continua disponível e o histórico desta sessão permanece visível. Enviar novas mensagens,
        checar a conexão com o provedor e qualquer ação que dependa do servidor voltam a funcionar assim que a
        conexão retornar.
      </p>
    </div>
  )
}
