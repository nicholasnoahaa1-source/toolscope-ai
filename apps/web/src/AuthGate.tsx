import { useEffect, useState } from 'react'
import App from './App'
import { NotFoundScreen } from './components/NotFoundScreen'
import { checkSession, extractAccessTokenFromLocation, submitAccessToken } from './lib/auth'

type GateState = 'checking' | 'authenticated' | 'not-found'

/**
 * Porta de entrada por link secreto. Sem sessão válida, mostra uma tela
 * genérica de "não encontrado" — nunca a interface do JARVIS. Uma URL
 * /entrar/<token> troca o token por uma sessão e some do histórico do
 * navegador antes de qualquer coisa ser renderizada.
 */
export default function AuthGate() {
  const [state, setState] = useState<GateState>('checking')

  useEffect(() => {
    let cancelled = false

    async function run() {
      const token = extractAccessTokenFromLocation(window.location.pathname)
      if (token) {
        await submitAccessToken(token)
        window.history.replaceState({}, '', '/')
      }

      const authenticated = await checkSession()
      if (!cancelled) setState(authenticated ? 'authenticated' : 'not-found')
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  if (state === 'checking') return null
  if (state === 'not-found') return <NotFoundScreen />
  return <App />
}
