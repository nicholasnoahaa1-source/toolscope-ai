import { useId, useState, type FormEvent } from 'react'
import './CommandBar.css'

interface CommandBarProps {
  onSend: (message: string) => void
  onStop: () => void
  disabled?: boolean
  isStreaming?: boolean
}

export function CommandBar({ onSend, onStop, disabled, isStreaming }: CommandBarProps) {
  const [draft, setDraft] = useState('')
  const inputId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  return (
    <form className="command-bar" onSubmit={handleSubmit}>
      <label htmlFor={inputId} className="sr-only">
        Mensagem para o JARVIS
      </label>
      <input
        id={inputId}
        type="text"
        className="command-input"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Digite um comando..."
        autoComplete="off"
        disabled={disabled}
      />
      {isStreaming ? (
        <button type="button" className="command-stop" onClick={onStop}>
          Parar
        </button>
      ) : (
        <button type="submit" className="command-send" disabled={disabled || draft.trim().length === 0}>
          Enviar
        </button>
      )}
      <button
        type="button"
        className="command-mic"
        disabled
        aria-label="Microfone (disponível em breve)"
        title="Disponível em breve"
      >
        🎤
      </button>
    </form>
  )
}
