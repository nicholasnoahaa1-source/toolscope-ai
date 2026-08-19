import { useRegisterSW } from 'virtual:pwa-register/react'
import './UpdateBanner.css'

/**
 * Aviso de atualização seguro: a nova versão do service worker fica em
 * espera até o usuário confirmar. Nada é recarregado sozinho. Como o
 * JARVIS ainda não persiste memória local (etapa futura), não há risco de
 * a atualização apagar dados — quando a persistência existir, ela vive em
 * IndexedDB/armazenamento próprio, fora do cache do service worker, que só
 * guarda os arquivos do shell.
 */
export function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      registration?.update()
    },
  })

  if (!needRefresh) return null

  return (
    <div className="update-banner" role="status">
      <p>Uma nova versão do JARVIS está disponível.</p>
      <div className="update-banner-actions">
        <button type="button" onClick={() => updateServiceWorker(true)}>
          Atualizar agora
        </button>
        <button type="button" className="update-banner-dismiss" onClick={() => setNeedRefresh(false)}>
          Depois
        </button>
      </div>
    </div>
  )
}
