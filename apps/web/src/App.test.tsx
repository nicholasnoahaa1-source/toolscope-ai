import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, afterEach } from 'vitest'
import App from './App'

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the JARVIS title, idle status, and empty history', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'JARVIS' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Em espera')
    expect(screen.getByText('Nenhuma mensagem ainda.')).toBeInTheDocument()
  })

  it('keeps the mic button disabled', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /microfone/i })).toBeDisabled()
  })

  it('disables send until there is text, then sends the message', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ reply: 'Olá! Modo de demonstração.', provider: 'mock' }),
      }),
    )

    render(<App />)

    const sendButton = screen.getByRole('button', { name: 'Enviar' })
    expect(sendButton).toBeDisabled()

    await user.type(screen.getByPlaceholderText('Digite uma mensagem...'), 'Olá')
    expect(sendButton).toBeEnabled()

    await user.click(sendButton)

    expect(await screen.findByText('Olá! Modo de demonstração.')).toBeInTheDocument()
    expect(screen.getByText('Olá')).toBeInTheDocument()
  })
})
