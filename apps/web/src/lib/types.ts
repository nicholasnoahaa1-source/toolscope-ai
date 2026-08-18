export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing' | 'error'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}
