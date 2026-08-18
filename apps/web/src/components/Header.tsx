import type { AssistantState } from '../lib/types'
import { ModeSwitch, type AppMode } from './ModeSwitch'
import './Header.css'

interface HeaderProps {
  assistantState: AssistantState
  statusLabel: string
  mode: AppMode
  onModeChange: (mode: AppMode) => void
  infoOpen: boolean
  onOpenInfo: () => void
  onOpenSettings: () => void
}

export function Header({
  assistantState,
  statusLabel,
  mode,
  onModeChange,
  infoOpen,
  onOpenInfo,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header-brand">
        <h1 className="app-title">JARVIS</h1>
        <p role="status" aria-live="polite" className={`app-status app-status-${assistantState}`}>
          <span className="app-status-dot" aria-hidden="true" />
          {statusLabel}
        </p>
      </div>

      <ModeSwitch mode={mode} onChange={onModeChange} />

      <div className="app-header-actions">
        <button
          type="button"
          className="header-icon-button mobile-only"
          onClick={onOpenInfo}
          aria-controls="info-panel"
          aria-expanded={infoOpen}
        >
          Painel
        </button>
        <button type="button" className="header-icon-button" onClick={onOpenSettings} aria-label="Configurações">
          ⚙
        </button>
      </div>
    </header>
  )
}
