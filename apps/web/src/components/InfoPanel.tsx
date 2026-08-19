import { useClock } from '../hooks/useClock'
import type { AssistantState } from '../lib/types'
import './InfoPanel.css'

export type ConnectionStatus = 'online' | 'offline' | 'checking'

interface InfoPanelProps {
  connection: ConnectionStatus
  assistantState: AssistantState
  shortcuts: { label: string; onSelect: () => void }[]
  /** Só é exibido quando configurado — sem provedor de clima nesta etapa. */
  weather?: string
  /** Provedor de chat configurado no servidor: "mock", "anthropic" ou "local". */
  providerMode?: string | null
}

const CONNECTION_LABEL: Record<ConnectionStatus, string> = {
  online: 'API conectada',
  offline: 'API indisponível',
  checking: 'Verificando conexão…',
}

const PROVIDER_MODE_LABEL: Record<string, string> = {
  mock: 'Modo demonstração',
  anthropic: 'Nuvem (Anthropic)',
  local: 'Local',
}

export function InfoPanel({ connection, assistantState, shortcuts, weather, providerMode }: InfoPanelProps) {
  const clock = useClock()

  return (
    <div className="info-panel-content">
      <section aria-labelledby="info-clock-heading" className="info-block">
        <h2 id="info-clock-heading" className="info-heading">
          Relógio
        </h2>
        <p className="info-clock-time">{clock.time}</p>
        <p className="info-clock-date">{clock.date}</p>
        <p className="info-weather">{weather ?? 'Clima: não configurado'}</p>
      </section>

      <section aria-labelledby="info-status-heading" className="info-block">
        <h2 id="info-status-heading" className="info-heading">
          Integridade
        </h2>
        <p className={`info-pill info-pill-${connection}`}>
          <span className="info-pill-dot" aria-hidden="true" />
          {CONNECTION_LABEL[connection]}
        </p>
        <p className="info-detail">Estado do núcleo: {assistantState}</p>
        {providerMode && (
          <p className={`info-pill info-pill-provider-${providerMode}`}>
            {PROVIDER_MODE_LABEL[providerMode] ?? providerMode}
          </p>
        )}
      </section>

      <section aria-labelledby="info-shortcuts-heading" className="info-block">
        <h2 id="info-shortcuts-heading" className="info-heading">
          Atalhos rápidos
        </h2>
        <ul className="info-shortcuts">
          {shortcuts.map((shortcut) => (
            <li key={shortcut.label}>
              <button type="button" className="info-shortcut" onClick={shortcut.onSelect}>
                {shortcut.label}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
