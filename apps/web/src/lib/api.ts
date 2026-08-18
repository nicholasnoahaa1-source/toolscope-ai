export interface ChatResponse {
  reply: string
  provider: string
}

export class ApiError extends Error {}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  if (!response.ok) {
    throw new ApiError(`Falha ao enviar mensagem (status ${response.status})`)
  }

  return (await response.json()) as ChatResponse
}
