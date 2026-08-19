import { useRef, type ReactNode } from 'react'
import { useDismissableOverlay } from '../hooks/useDismissableOverlay'
import './Drawer.css'

interface DrawerProps {
  open: boolean
  onClose: () => void
  titleId: string
  title: string
  children: ReactNode
}

/**
 * Painel de informações: gaveta deslizante em telas estreitas, painel fixo
 * ao lado do núcleo em telas largas (controlado por CSS, ver Drawer.css).
 */
export function Drawer({ open, onClose, titleId, title, children }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useDismissableOverlay(open, onClose, panelRef)

  return (
    <>
      <div className={`drawer-backdrop ${open ? 'is-open' : ''}`} onClick={onClose} />
      <div
        ref={panelRef}
        id="info-panel"
        className={`drawer ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="drawer-header">
          <h2 id={titleId} className="drawer-title">
            {title}
          </h2>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Fechar painel">
            ✕
          </button>
        </div>
        {children}
      </div>
    </>
  )
}
