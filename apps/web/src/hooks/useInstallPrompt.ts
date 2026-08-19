import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  const iosStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true
  return window.matchMedia('(display-mode: standalone)').matches || iosStandalone
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export interface InstallPromptState {
  /** true quando o navegador ofereceu um prompt nativo de instalação (Chrome/Edge/Android). */
  canPromptInstall: boolean
  /** true quando o app já roda como instalado (standalone). Não é exigido para o app funcionar. */
  isInstalled: boolean
  /** true em iOS/Safari, onde não existe prompt nativo — precisa do fluxo manual "Adicionar à Tela de Início". */
  needsManualInstall: boolean
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
}

export function useInstallPrompt(): InstallPromptState {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(isStandalone)

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredEvent(event as BeforeInstallPromptEvent)
    }
    function handleAppInstalled() {
      setIsInstalled(true)
      setDeferredEvent(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!deferredEvent) return 'unavailable'
    await deferredEvent.prompt()
    const { outcome } = await deferredEvent.userChoice
    setDeferredEvent(null)
    return outcome
  }

  return {
    canPromptInstall: deferredEvent !== null,
    isInstalled,
    needsManualInstall: isIos() && !isInstalled,
    promptInstall,
  }
}
