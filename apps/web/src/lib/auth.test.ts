import { afterEach, describe, expect, it, vi } from 'vitest'
import { checkSession, extractAccessTokenFromLocation, submitAccessToken } from './auth'

describe('extractAccessTokenFromLocation', () => {
  it('extracts the token from an /entrar/<token> path', () => {
    expect(extractAccessTokenFromLocation('/entrar/abc123')).toBe('abc123')
  })

  it('returns null for any other path', () => {
    expect(extractAccessTokenFromLocation('/')).toBeNull()
    expect(extractAccessTokenFromLocation('/entrar/')).toBeNull()
    expect(extractAccessTokenFromLocation('/settings')).toBeNull()
  })
})

describe('submitAccessToken / checkSession', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('submitAccessToken posts the token with credentials included', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const ok = await submitAccessToken('my-token')

    expect(ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/entrar',
      expect.objectContaining({ method: 'POST', credentials: 'include', body: JSON.stringify({ token: 'my-token' }) }),
    )
  })

  it('checkSession returns false on network failure without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    await expect(checkSession()).resolves.toBe(false)
  })

  it('checkSession returns true only when the response is ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(checkSession()).resolves.toBe(false)

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    await expect(checkSession()).resolves.toBe(true)
  })
})
