import { useId, useRef } from 'react'
import { useDismissableOverlay } from '../hooks/useDismissableOverlay'
import './SettingsDialog.css'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
  soundEnabled: boolean
  onSoundEnabledChange: (enabled: boolean) => void
}

export function SettingsDialog({ open, onClose, soundEnabled, onSoundEnabledChange }: SettingsDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useDismissableOverlay(open, onClose, panelRef)

  if (!open) return null

  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div
        ref={panelRef}
        className="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="settings-header">
          <h2 id={titleId}>Configurações</h2>
          <button type="button" className="settings-close" onClick={onClose} aria-label="Fechar configurações">
            ✕
          </button>
        </div>

        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(event) => onSoundEnabledChange(event.target.checked)}
          />
          Sinais sonoros originais (enviar/receber/erro)
        </label>

        <p className="settings-note">
          Movimento reduzido segue a preferência do sistema operacional (
          <code>prefers-reduced-motion</code>). O microfone e a câmera continuam desativados nesta etapa — nunca
          ficam ouvindo ou vendo em segundo plano.
        </p>
      </div>
    </div>
  )
}
