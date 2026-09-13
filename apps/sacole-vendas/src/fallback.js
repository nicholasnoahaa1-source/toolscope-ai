/**
 * Fallback sem WebGL: sequência de frames já renderizada em public/frames/
 * (145 WebP, 720px). Se os frames não estiverem no lugar, cai para a foto do
 * produto; se nem ela existir, a página segue vendendo sem imagem nenhuma.
 */
const TOTAL = 145
const caminho = (i) => `/frames/${String(i).padStart(4, '0')}.webp`

function existe(url) {
  return new Promise((ok) => {
    const img = new Image()
    img.onload = () => ok(true)
    img.onerror = () => ok(false)
    img.src = url
  })
}

export async function montarFallback(container, { reduzido }) {
  container.textContent = ''

  if (await existe(caminho(1))) {
    const img = new Image()
    img.className = 'heroi__fallback'
    img.decoding = 'async'
    img.src = caminho(1)
    img.alt = 'Sacolé artesanal de pé sobre uma bancada de mármore.'
    container.appendChild(img)

    if (reduzido) return   // movimento reduzido: fica no frame estático

    let i = 1
    let ultimo = 0
    const passo = (agora) => {
      requestAnimationFrame(passo)
      if (agora - ultimo < 1000 / 24) return
      ultimo = agora
      i = (i % TOTAL) + 1
      img.src = caminho(i)
    }
    requestAnimationFrame(passo)
    return
  }

  if (await existe('/imagens/sacole-oreo-produto.webp')) {
    const img = new Image()
    img.className = 'heroi__fallback'
    img.decoding = 'async'
    img.src = '/imagens/sacole-oreo-produto.webp'
    img.srcset = '/imagens/sacole-oreo-produto-sm.webp 600w, /imagens/sacole-oreo-produto.webp 1200w'
    img.sizes = '(min-width: 60rem) 50vw, 100vw'
    img.alt = 'Uma mão segura um sacolé de creme claro salpicado de pedaços de ' +
              'biscoito de chocolate, com o saquinho torcido e amarrado no topo.'
    container.appendChild(img)
    return
  }

  container.setAttribute('role', 'presentation')
  container.removeAttribute('aria-label')
}
