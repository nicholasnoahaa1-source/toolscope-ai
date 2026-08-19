export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing' | 'error'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export const ASSISTANT_STATE_LABEL: Record<AssistantState, string> = {
  idle: 'Em espera',
  listening: 'Ouvindo',
  thinking: 'Pensando',
  speaking: 'Falando',
  executing: 'Executando',
  error: 'Erro',
}
