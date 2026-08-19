import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function sseBody(events: { event: string; data: Record<string, unknown> }[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  const text = events.map(({ event, data }) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`).join('')
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text))
      controller.close()
    },
  })
}

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  function stubFetch(chatReply: { reply: string; provider: string } | null) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.includes('/api/health')) {
          return { ok: true, json: async () => ({ status: 'ok', service: 'jarvis-api' }) }
        }
        if (url.includes('/api/chat/status')) {
          return { ok: true, json: async () => ({ provider: 'mock' }) }
        }
        if (url.includes('/api/chat')) {
          if (chatReply === null) {
            return {
              ok: true,
              body: sseBody([{ event: 'error', data: { message: 'Não foi possível falar com o provedor.' } }]),
            }
          }
          return {
            ok: true,
            body: sseBody([
              { event: 'chunk', data: { text: chatReply.reply } },
              { event: 'done', data: { provider: chatReply.provider } },
            ]),
          }
        }
        return { ok: true, json: async () => ({}) }
      }),
    )
  }

  it('shows the JARVIS title, idle status, and empty history', async () => {
    stubFetch({ reply: 'ok', provider: 'mock' })
    render(<App />)

    expect(screen.getByRole('heading', { name: 'JARVIS' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Em espera')
    expect(screen.getByText(/nenhuma mensagem ainda/i)).toBeInTheDocument()
  })

  it('keeps the mic button disabled', async () => {
    stubFetch({ reply: 'ok', provider: 'mock' })
    render(<App />)

    expect(screen.getByRole('button', { name: /microfone/i })).toBeDisabled()
  })

  it('disables send until there is text, then streams the message and shows the reply', async () => {
    stubFetch({ reply: 'Olá! Modo de demonstração.', provider: 'mock' })
    const user = userEvent.setup()
    render(<App />)

    const sendButton = screen.getByRole('button', { name: 'Enviar' })
    expect(sendButton).toBeDisabled()

    await user.type(screen.getByPlaceholderText('Digite um comando...'), 'Olá')
    expect(sendButton).toBeEnabled()

    await user.click(sendButton)

    expect(await screen.findByText('Olá! Modo de demonstração.')).toBeInTheDocument()
    expect(screen.getByText('Olá')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Em espera'))
  })

  it('shows a Stop button while streaming that lets the user cancel', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.includes('/api/health')) return { ok: true, json: async () => ({ status: 'ok' }) }
        if (url.includes('/api/chat/status')) return { ok: true, json: async () => ({ provider: 'mock' }) }
        if (url.includes('/api/chat')) {
          // Só resolve quando o teste cancela via AbortController — igual
          // ao comportamento real do fetch com um signal.
          return new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
          })
        }
        return { ok: true, json: async () => ({}) }
      }),
    )
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Digite um comando...'), 'Olá')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    const stopButton = await screen.findByRole('button', { name: 'Parar' })
    await user.click(stopButton)

    expect(await screen.findByText(/interrompid/i)).toBeInTheDocument()
  })

  it('shows an error message and error status when the provider fails', async () => {
    stubFetch(null)
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Digite um comando...'), 'Oi')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText(/não foi possível falar com o provedor/i)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Erro')
  })

  it('switches to workshop mode and shows the lazy-loaded placeholder', async () => {
    stubFetch({ reply: 'ok', provider: 'mock' })
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Modo Oficina', pressed: false }))

    expect(await screen.findByRole('heading', { name: 'Laboratório de traje' })).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Digite um comando...')).not.toBeInTheDocument()
  })

  it('shows an offline notice when the browser goes offline, and hides it when back online', async () => {
    stubFetch({ reply: 'ok', provider: 'mock' })
    vi.stubGlobal('navigator', { ...navigator, onLine: false })
    render(<App />)

    expect(await screen.findByText(/sem conexão no momento/i)).toBeInTheDocument()

    vi.stubGlobal('navigator', { ...navigator, onLine: true })
    window.dispatchEvent(new Event('online'))

    await waitFor(() => expect(screen.queryByText(/sem conexão no momento/i)).not.toBeInTheDocument())
  })

  it('opens and closes the settings dialog', async () => {
    stubFetch({ reply: 'ok', provider: 'mock' })
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Configurações' }))
    expect(screen.getByRole('dialog', { name: 'Configurações' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Configurações' })).not.toBeInTheDocument())
  })

  it('shows the install section inside settings', async () => {
    stubFetch({ reply: 'ok', provider: 'mock' })
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Configurações' }))

    expect(screen.getByRole('heading', { name: 'Instalar aplicativo' })).toBeInTheDocument()
    expect(screen.getByText('Como remover o aplicativo')).toBeInTheDocument()
  })
})
