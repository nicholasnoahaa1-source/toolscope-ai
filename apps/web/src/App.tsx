import { useId, useState, type FormEvent } from 'react'
import { sendChatMessage } from './lib/api'
import type { AssistantState, ChatMessage } from './lib/types'
import './App.css'

function createId(): string {
  return crypto.randomUUID()
}

export default function App() {
  const [status, setStatus] = useState<AssistantState>('idle')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const messageInputId = useId()

  const statusLabel: Record<AssistantState, string> = {
    idle: 'Em espera',
    listening: 'Ouvindo',
    thinking: 'Pensando',
    speaking: 'Falando',
    executing: 'Executando',
    error: 'Erro',
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    const userMessage: ChatMessage = { id: createId(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setDraft('')
    setStatus('thinking')

    try {
      const response = await sendChatMessage(text)
      setMessages((prev) => [...prev, { id: createId(), role: 'assistant', content: response.reply }])
      setStatus('idle')
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: createId(), role: 'assistant', content: 'Não consegui falar com o servidor. Tente novamente.' },
      ])
      setStatus('error')
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>JARVIS</h1>
        <p role="status" aria-live="polite" className="app-status">
          {statusLabel[status]}
        </p>
      </header>

      <section className="app-history" aria-label="Histórico de conversa">
        {messages.length === 0 ? (
          <p className="app-history-empty">Nenhuma mensagem ainda.</p>
        ) : (
          <ul>
            {messages.map((message) => (
              <li key={message.id} className={`app-message app-message-${message.role}`}>
                {message.content}
              </li>
            ))}
          </ul>
        )}
      </section>

      <form className="app-composer" onSubmit={handleSubmit}>
        <label htmlFor={messageInputId} className="sr-only">
          Mensagem
        </label>
        <input
          id={messageInputId}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Digite uma mensagem..."
          autoComplete="off"
        />
        <button type="submit" disabled={draft.trim().length === 0}>
          Enviar
        </button>
        <button type="button" disabled aria-label="Microfone (disponível em breve)" title="Disponível em breve">
          🎤
        </button>
      </form>
    </main>
  )
}
