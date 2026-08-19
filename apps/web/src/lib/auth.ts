const ENTRAR_PATH_PATTERN = /^\/entrar\/([^/]+)\/?$/

export function extractAccessTokenFromLocation(pathname: string): string | null {
  const match = ENTRAR_PATH_PATTERN.exec(pathname)
  return match ? decodeURIComponent(match[1]) : null
}

export async function submitAccessToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('/api/entrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token }),
    })
    return response.ok
  } catch {
    return false
  }
}

export async function checkSession(): Promise<boolean> {
  try {
    const response = await fetch('/api/session', { credentials: 'include' })
    return response.ok
  } catch {
    return false
  }
}
