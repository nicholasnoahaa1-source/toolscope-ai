import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

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
        if (chatReply === null) {
          return { ok: false, json: async () => ({}) }
        }
        return { ok: true, json: async () => chatReply }
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

  it('disables send until there is text, then sends the message and shows the reply', async () => {
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
  })

  it('shows an error message and error status when the API call fails', async () => {
    stubFetch(null)
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Digite um comando...'), 'Oi')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText(/não consegui falar com o servidor/i)).toBeInTheDocument()
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
