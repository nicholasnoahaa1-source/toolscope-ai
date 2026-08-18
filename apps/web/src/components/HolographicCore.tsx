import { ASSISTANT_STATE_LABEL, type AssistantState } from '../lib/types'
import './HolographicCore.css'

interface HolographicCoreProps {
  state: AssistantState
}

/**
 * Núcleo holográfico original (SVG + CSS), sem ativos externos. As camadas
 * circulares e o ritmo de animação mudam com o estado do assistente, mas o
 * desenho não reproduz nenhuma interface específica de filme.
 */
export function HolographicCore({ state }: HolographicCoreProps) {
  return (
    <div className={`core core-${state}`} role="img" aria-label={`Núcleo do JARVIS: ${ASSISTANT_STATE_LABEL[state]}`}>
      <svg viewBox="0 0 200 200" className="core-svg" aria-hidden="true">
        <circle className="core-ring core-ring-outer" cx="100" cy="100" r="92" />
        <circle className="core-ring core-ring-dashed" cx="100" cy="100" r="78" />
        <circle className="core-ring core-ring-ticks" cx="100" cy="100" r="64" />
        <circle className="core-ring core-ring-inner" cx="100" cy="100" r="46" />
        <circle className="core-nucleus" cx="100" cy="100" r="26" />
      </svg>
    </div>
  )
}
