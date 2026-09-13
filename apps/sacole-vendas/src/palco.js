import { animate, scroll } from 'motion'

/**
 * Palco do herói: sequência de quadros do sacolé girando, percorrida pelo
 * scroll — a rolagem da página é o que gira a peça.
 *
 * A foto fica na marcação e aparece de imediato; os quadros entram depois,
 * quando terminam de decodificar, e só então o canvas assume. A primeira
 * dobra nunca espera por eles.
 *
 * O scroll e o ponteiro só escrevem valores-alvo; um laço único interpola até
 * eles e redesenha apenas quando o quadro muda. Reagir direto no evento trava.
 */

const QUADROS = 36
const caminho = (i, pequeno) =>
  `/frames/${String(i).padStart(4, '0')}${pequeno ? '-sm' : ''}.webp`

const juntar = (a, b, t) => a + (b - a) * t
const limitar = (v, min, max) => Math.min(Math.max(v, min), max)

function carregar(url) {
  return new Promise((ok, erro) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => ok(img)
    img.onerror = erro
    img.src = url
  })
}

export function montarPalco(palco, { reduzido }) {
  const placa = palco.querySelector('.palco__placa')
  const canvas = palco.querySelector('.palco__quadros')
  const sombra = palco.querySelector('.palco__sombra')

  // Movimento reduzido: a foto fica, os quadros nem são baixados.
  if (reduzido) {
    palco.dataset.estado = 'estatico'
    return { impulso() {}, destruir() {} }
  }

  const alvo = { progresso: 0, giroX: 0, giroY: 0 }
  const atual = { progresso: 0, giroX: 0, giroY: 0 }
  let deslize = 0          // giro extra vindo do clique num sabor
  let imagens = null
  let ultimoIndice = -1
  let vivo = true

  const cancelarScroll = scroll(
    (progresso) => { alvo.progresso = progresso },
    { target: palco, offset: ['start end', 'end start'] }
  )

  function aoMover(e) {
    if (e.pointerType === 'touch') return   // no toque, o gesto é da página
    const r = palco.getBoundingClientRect()
    alvo.giroY = limitar((e.clientX - r.left) / r.width - 0.5, -0.5, 0.5) * 18
    alvo.giroX = limitar(0.5 - (e.clientY - r.top) / r.height, -0.5, 0.5) * 10
  }
  const aoSair = () => { alvo.giroY = 0; alvo.giroX = 0 }
  palco.addEventListener('pointermove', aoMover)
  palco.addEventListener('pointerleave', aoSair)

  const ctx = canvas.getContext('2d')

  function desenhar(indice) {
    if (!imagens || indice === ultimoIndice) return
    ultimoIndice = indice
    const img = imagens[indice]
    const escala = Math.min(canvas.width / img.width, canvas.height / img.height)
    const w = img.width * escala
    const h = img.height * escala
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
  }

  function redimensionar() {
    const r = canvas.getBoundingClientRect()
    const dpr = Math.min(devicePixelRatio, 2)
    canvas.width = Math.round(r.width * dpr)
    canvas.height = Math.round(r.height * dpr)
    ultimoIndice = -1                        // força redesenho na nova resolução
  }
  const ro = new ResizeObserver(redimensionar)
  ro.observe(canvas)

  function laco() {
    if (!vivo) return
    requestAnimationFrame(laco)

    atual.progresso = juntar(atual.progresso, alvo.progresso, 0.1)
    atual.giroX = juntar(atual.giroX, alvo.giroX, 0.12)
    atual.giroY = juntar(atual.giroY, alvo.giroY, 0.12)
    deslize *= 0.94

    // uma volta e meia da peça ao longo da travessia do palco pela tela
    const voltas = atual.progresso * 1.5 + atual.giroY / 90 + deslize
    desenhar(((Math.round(voltas * QUADROS) % QUADROS) + QUADROS) % QUADROS)

    // a inclinação e a escala continuam em CSS: dão profundidade sem custar
    // quadros novos
    const centrado = atual.progresso * 2 - 1
    placa.style.transform =
      `translate3d(0, ${(centrado * -5).toFixed(2)}%, 0) ` +
      `rotateX(${atual.giroX.toFixed(2)}deg) rotateY(${(atual.giroY * 0.35).toFixed(2)}deg) ` +
      `scale(${(1.03 - Math.abs(centrado) * 0.1).toFixed(3)})`

    const longe = Math.abs(centrado)
    sombra.style.transform = `scale(${(1 - longe * 0.18).toFixed(3)}, ${(1 - longe * 0.3).toFixed(3)})`
    sombra.style.opacity = (0.4 - longe * 0.18).toFixed(3)
  }
  requestAnimationFrame(laco)

  // Os quadros entram depois da primeira dobra; até lá a foto segura a cena.
  const pequeno = matchMedia('(max-width: 60rem)').matches
  const baixar = () =>
    Promise.all(Array.from({ length: QUADROS }, (_, i) => carregar(caminho(i + 1, pequeno))))
      .then((lista) => {
        if (!vivo) return
        imagens = lista
        redimensionar()
        palco.dataset.estado = 'quadros'
      })
      .catch(() => { /* sem quadros a foto continua valendo */ })

  if ('requestIdleCallback' in window) requestIdleCallback(baixar, { timeout: 2500 })
  else addEventListener('load', baixar)

  return {
    /** Empurrão de giro ao trocar de sabor: a peça reage ao clique. */
    impulso() {
      deslize = 0.18
      animate(placa, { filter: ['brightness(1.1)', 'brightness(1)'] }, { duration: 0.45 })
    },
    destruir() {
      vivo = false
      cancelarScroll?.()
      ro.disconnect()
      palco.removeEventListener('pointermove', aoMover)
      palco.removeEventListener('pointerleave', aoSair)
    },
  }
}
