import type { ChatMessage } from '../lib/types'
import './ConversationPanel.css'

interface ConversationPanelProps {
  messages: ChatMessage[]
}

export function ConversationPanel({ messages }: ConversationPanelProps) {
  return (
    <section className="conversation-panel" aria-label="Histórico de conversa">
      {messages.length === 0 ? (
        <p className="conversation-empty">Nenhuma mensagem ainda. Diga algo para começar.</p>
      ) : (
        <ul className="conversation-list">
          {messages.map((message) => (
            <li key={message.id} className={`conversation-message conversation-message-${message.role}`}>
              <span className="conversation-role">{message.role === 'user' ? 'Você' : 'JARVIS'}</span>
              <p>{message.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
