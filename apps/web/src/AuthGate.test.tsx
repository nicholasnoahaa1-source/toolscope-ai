import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AuthGate from './AuthGate'

describe('AuthGate', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    window.history.replaceState({}, '', '/')
  })

  it('shows a generic not-found screen when there is no valid session', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    render(<AuthGate />)

    expect(await screen.findByText('404')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'JARVIS' })).not.toBeInTheDocument()
  })

  it('renders the JARVIS app once the session check succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    render(<AuthGate />)

    expect(await screen.findByRole('heading', { name: 'JARVIS' })).toBeInTheDocument()
  })

  it('exchanges an /entrar/<token> URL for a session and strips the token from the URL', async () => {
    window.history.replaceState({}, '', '/entrar/some-secret-token')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    render(<AuthGate />)

    expect(await screen.findByRole('heading', { name: 'JARVIS' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/entrar',
      expect.objectContaining({ body: JSON.stringify({ token: 'some-secret-token' }) }),
    )
    expect(window.location.pathname).toBe('/')
  })
})
