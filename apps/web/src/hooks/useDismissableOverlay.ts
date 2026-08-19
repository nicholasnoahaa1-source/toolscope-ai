import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Comportamento comum de uma sobreposição descartável (drawer ou diálogo):
 * fecha com Escape, prende o foco dentro do painel enquanto aberta, e
 * devolve o foco ao elemento que a abriu quando fecha.
 */
export function useDismissableOverlay(open: boolean, onClose: () => void, panelRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const focusable = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    focusable?.[0]?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel) return

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      previouslyFocused?.focus()
    }
  }, [open, onClose, panelRef])
}
