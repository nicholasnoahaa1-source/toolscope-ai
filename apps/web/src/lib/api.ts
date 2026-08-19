export interface ChatStreamHandlers {
  onChunk: (text: string) => void
  onDone: (provider: string) => void
  onError: (message: string, provider?: string) => void
}

interface ParsedSseEvent {
  event: string
  data: Record<string, unknown>
}

function parseSseBlock(block: string): ParsedSseEvent | null {
  const lines = block.split('\n')
  const eventLine = lines.find((line) => line.startsWith('event:'))
  const dataLine = lines.find((line) => line.startsWith('data:'))
  if (!eventLine || !dataLine) return null
  return {
    event: eventLine.slice('event:'.length).trim(),
    data: JSON.parse(dataLine.slice('data:'.length).trim()),
  }
}

/**
 * Envia uma mensagem e consome a resposta em streaming (Server-Sent
 * Events). `signal` permite cancelar a qualquer momento (botão Parar) —
 * nesse caso nenhum erro é reportado, o cancelamento é silencioso.
 */
export async function streamChatMessage(
  message: string,
  handlers: ChatStreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  let response: Response
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message }),
      signal,
    })
  } catch {
    if (signal.aborted) return
    handlers.onError('Falha de conexão com o servidor.')
    return
  }

  if (!response.ok || !response.body) {
    handlers.onError(`Não foi possível falar com o servidor (status ${response.status}).`)
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let separatorIndex: number
      while ((separatorIndex = buffer.indexOf('\n\n')) !== -1) {
        const rawBlock = buffer.slice(0, separatorIndex)
        buffer = buffer.slice(separatorIndex + 2)
        const parsed = parseSseBlock(rawBlock)
        if (!parsed) continue

        if (parsed.event === 'chunk') handlers.onChunk(String(parsed.data.text ?? ''))
        else if (parsed.event === 'done') handlers.onDone(String(parsed.data.provider ?? ''))
        else if (parsed.event === 'error') {
          handlers.onError(String(parsed.data.message ?? 'Erro desconhecido.'), parsed.data.provider as string | undefined)
        }
      }
    }
  } catch {
    if (!signal.aborted) handlers.onError('A conexão foi interrompida antes do fim da resposta.')
  }
}

export interface ProviderStatus {
  provider: string
}

export async function getProviderStatus(): Promise<ProviderStatus | null> {
  try {
    const response = await fetch('/api/chat/status', { credentials: 'include' })
    if (!response.ok) return null
    return (await response.json()) as ProviderStatus
  } catch {
    return null
  }
}
