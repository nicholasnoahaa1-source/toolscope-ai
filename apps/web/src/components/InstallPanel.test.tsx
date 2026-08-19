import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { InstallPanel } from './InstallPanel'

describe('InstallPanel', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('shows the native install button when beforeinstallprompt fired', async () => {
    render(<InstallPanel />)

    const event = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
    }
    event.prompt = vi.fn().mockResolvedValue(undefined)
    event.userChoice = Promise.resolve({ outcome: 'accepted' })
    window.dispatchEvent(event)

    expect(await screen.findByRole('button', { name: 'Instalar JARVIS' })).toBeInTheDocument()
  })

  it('shows manual iOS instructions when no native prompt is available on iOS Safari', () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    })

    render(<InstallPanel />)

    expect(screen.getByText(/Adicionar à Tela de Início/)).toBeInTheDocument()
  })

  it('always shows removal instructions', () => {
    render(<InstallPanel />)

    expect(screen.getByText('Como remover o aplicativo')).toBeInTheDocument()
  })
})
