import { useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import './InstallPanel.css'

/**
 * Explica como instalar o JARVIS (navegador compatível ou fluxo manual do
 * iOS) e como remover o aplicativo depois. O app funciona igual instalado
 * ou não — instalar é conveniência, nunca um requisito.
 */
export function InstallPanel() {
  const { canPromptInstall, isInstalled, needsManualInstall, promptInstall } = useInstallPrompt()
  const [status, setStatus] = useState<'idle' | 'accepted' | 'dismissed'>('idle')

  async function handleInstallClick() {
    const outcome = await promptInstall()
    if (outcome === 'accepted' || outcome === 'dismissed') setStatus(outcome)
  }

  if (isInstalled) {
    return (
      <div className="install-panel">
        <p className="install-status install-status-done">JARVIS já está instalado neste dispositivo.</p>
        <RemoveInstructions />
      </div>
    )
  }

  return (
    <div className="install-panel">
      {canPromptInstall && (
        <>
          <p>Instale o JARVIS para abrir como um aplicativo, com ícone próprio e em tela cheia.</p>
          <button type="button" className="install-button" onClick={handleInstallClick}>
            Instalar JARVIS
          </button>
          {status === 'dismissed' && <p className="install-status">Instalação dispensada. Pode tentar de novo quando quiser.</p>}
        </>
      )}

      {needsManualInstall && (
        <div>
          <p>No iPhone/iPad, a instalação é manual pelo Safari:</p>
          <ol className="install-steps">
            <li>Toque no ícone de Compartilhar (o quadrado com uma seta para cima).</li>
            <li>Escolha "Adicionar à Tela de Início".</li>
            <li>Confirme o nome "JARVIS" e toque em "Adicionar".</li>
          </ol>
        </div>
      )}

      {!canPromptInstall && !needsManualInstall && (
        <p className="install-status">
          Este navegador não oferece instalação automática. Você pode continuar usando o JARVIS normalmente pelo
          navegador — nenhuma função depende de estar instalado.
        </p>
      )}

      <RemoveInstructions />
    </div>
  )
}

function RemoveInstructions() {
  return (
    <details className="install-remove">
      <summary>Como remover o aplicativo</summary>
      <ul>
        <li>
          <strong>Windows/Android (Chrome/Edge):</strong> abra a lista de apps instalados do navegador ou o menu do
          próprio app instalado e escolha "Desinstalar".
        </li>
        <li>
          <strong>iPhone/iPad:</strong> toque e segure o ícone do JARVIS na Tela de Início e escolha "Remover app".
        </li>
      </ul>
    </details>
  )
}
