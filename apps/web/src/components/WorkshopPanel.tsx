import './WorkshopPanel.css'

/**
 * Modo Oficina: laboratório de traje. Ainda não implementado — este painel
 * é um placeholder carregado sob demanda (React.lazy em App.tsx) para não
 * pesar o carregamento inicial do "Modo Comando", que é o caminho principal.
 */
export default function WorkshopPanel() {
  return (
    <section className="workshop-panel" aria-label="Laboratório de traje">
      <div className="workshop-frame">
        <p className="workshop-eyebrow">Modo Oficina</p>
        <h2>Laboratório de traje</h2>
        <p className="workshop-body">
          O visualizador 3D do traje ainda não foi implementado. Esta área reserva o espaço e a linguagem visual para
          quando o laboratório estiver disponível — carregado sob demanda, sem afetar o Modo Comando.
        </p>
      </div>
    </section>
  )
}
