import { Suspense, lazy, useCallback, useEffect, useId, useState } from 'react'
import './styles/global.css'
import './App.css'
import { CommandBar } from './components/CommandBar'
import { ConversationPanel } from './components/ConversationPanel'
import { Drawer } from './components/Drawer'
import { Header } from './components/Header'
import { HolographicCore } from './components/HolographicCore'
import { InfoPanel, type ConnectionStatus } from './components/InfoPanel'
import type { AppMode } from './components/ModeSwitch'
import { OfflineNotice } from './components/OfflineNotice'
import { SettingsDialog } from './components/SettingsDialog'
import { UpdateBanner } from './components/UpdateBanner'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { sendChatMessage } from './lib/api'
import { playCue } from './lib/sound'
import { ASSISTANT_STATE_LABEL, type AssistantState, type ChatMessage } from './lib/types'

const Background = lazy(() => import('./components/Background'))
const WorkshopPanel = lazy(() => import('./components/WorkshopPanel'))

function createId(): string {
  return crypto.randomUUID()
}

export default function App() {
  const [assistantState, setAssistantState] = useState<AssistantState>('idle')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [mode, setMode] = useState<AppMode>('command')
  const [infoOpen, setInfoOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [connection, setConnection] = useState<ConnectionStatus>('checking')
  const isOnline = useOnlineStatus()
  const infoTitleId = useId()

  useEffect(() => {
    if (!isOnline) {
      setConnection('offline')
      return
    }

    let cancelled = false

    async function checkHealth() {
      try {
        const response = await fetch('/api/health')
        if (!cancelled) setConnection(response.ok ? 'online' : 'offline')
      } catch {
        if (!cancelled) setConnection('offline')
      }
    }

    checkHealth()
    const id = window.setInterval(checkHealth, 20_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [isOnline])

  const handleSend = useCallback(
    async (text: string) => {
      const userMessage: ChatMessage = { id: createId(), role: 'user', content: text }
      setMessages((prev) => [...prev, userMessage])
      setAssistantState('thinking')
      if (soundEnabled) playCue('send')

      try {
        const response = await sendChatMessage(text)
        setMessages((prev) => [...prev, { id: createId(), role: 'assistant', content: response.reply }])
        setAssistantState('speaking')
        if (soundEnabled) playCue('receive')
        window.setTimeout(() => setAssistantState('idle'), 900)
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: createId(), role: 'assistant', content: 'Não consegui falar com o servidor. Tente novamente.' },
        ])
        setAssistantState('error')
        if (soundEnabled) playCue('error')
        window.setTimeout(() => setAssistantState('idle'), 1600)
      }
    },
    [soundEnabled],
  )

  const shortcuts = [
    { label: 'Limpar conversa', onSelect: () => setMessages([]) },
    { label: 'Modo Comando', onSelect: () => setMode('command') },
    { label: 'Modo Oficina', onSelect: () => setMode('workshop') },
  ]

  return (
    <div className="shell">
      <Suspense fallback={null}>
        <Background />
      </Suspense>

      <div className="shell-content">
        <Header
          assistantState={assistantState}
          statusLabel={ASSISTANT_STATE_LABEL[assistantState]}
          mode={mode}
          onModeChange={setMode}
          infoOpen={infoOpen}
          onOpenInfo={() => setInfoOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {!isOnline && <OfflineNotice />}

        <main className={`shell-main shell-main-${mode}`}>
          <aside className="shell-info">
            <Drawer open={infoOpen} onClose={() => setInfoOpen(false)} titleId={infoTitleId} title="Painel de informações">
              <InfoPanel connection={connection} assistantState={assistantState} shortcuts={shortcuts} />
            </Drawer>
          </aside>

          <section className="shell-core">
            <HolographicCore state={assistantState} />
          </section>

          {mode === 'command' ? (
            <div className="shell-conversation">
              <ConversationPanel messages={messages} />
              <CommandBar onSend={handleSend} disabled={assistantState === 'thinking'} />
            </div>
          ) : (
            <div className="shell-conversation">
              <Suspense fallback={<p className="shell-loading">Carregando laboratório…</p>}>
                <WorkshopPanel />
              </Suspense>
            </div>
          )}
        </main>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        soundEnabled={soundEnabled}
        onSoundEnabledChange={setSoundEnabled}
      />

      <UpdateBanner />
    </div>
  )
}
