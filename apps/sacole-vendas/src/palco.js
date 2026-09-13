import { animate, scroll } from 'motion'

/**
 * Palco do herói: a foto do produto encenada em 3D por transformações CSS.
 *
 * Nada aqui é WebGL. A sensação de profundidade vem de três camadas num mesmo
 * espaço com `perspective`: um fundo desfocado que anda mais devagar, a placa
 * com a foto girando em dois eixos, e uma sombra de contato que acompanha.
 *
 * O scroll e o ponteiro só escrevem valores-alvo; um único laço interpola até
 * eles. É o que mantém o movimento fluido — reagir direto no evento trava.
 */

const juntar = (a, b, t) => a + (b - a) * t
const limitar = (v, min, max) => Math.min(Math.max(v, min), max)

export function montarPalco(palco, { reduzido }) {
  const placa = palco.querySelector('.palco__placa')
  const fundo = palco.querySelector('.palco__fundo')
  const sombra = palco.querySelector('.palco__sombra')
  const brilho = palco.querySelector('.palco__brilho')

  if (reduzido) {
    palco.dataset.estado = 'estatico'
    return { impulso() {}, destruir() {} }
  }

  // alvos escritos pelos eventos; `atual` é o que de fato vai para a tela
  const alvo = { progresso: 0, giroX: 0, giroY: 0 }
  const atual = { progresso: 0, giroX: 0, giroY: 0 }
  let impulsoGiro = 0

  const cancelarScroll = scroll(
    (progresso) => { alvo.progresso = progresso },
    { target: palco, offset: ['start end', 'end start'] }
  )

  // O ponteiro inclina a peça como se você a estivesse virando na mão.
  function aoMover(e) {
    const r = palco.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    alvo.giroY = limitar(x, -0.5, 0.5) * 26
    alvo.giroX = limitar(-y, -0.5, 0.5) * 14
  }
  function aoSair() { alvo.giroY = 0; alvo.giroX = 0 }

  // `pointermove` no palco inteiro cobre mouse e caneta; no toque o gesto
  // vertical continua rolando a página, então não interceptamos nada.
  palco.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') aoMover(e) })
  palco.addEventListener('pointerleave', aoSair)

  let vivo = true
  function laco() {
    if (!vivo) return
    requestAnimationFrame(laco)

    atual.progresso = juntar(atual.progresso, alvo.progresso, 0.09)
    atual.giroX = juntar(atual.giroX, alvo.giroX, 0.12)
    atual.giroY = juntar(atual.giroY, alvo.giroY, 0.12)
    impulsoGiro *= 0.92

    // 0 quando o palco entra pela base da tela, 1 quando sai pelo topo.
    const p = atual.progresso
    // -1 no começo, 0 no meio da tela, +1 ao sair: o meio é a pose de repouso
    const centrado = p * 2 - 1

    const giroY = centrado * -18 + atual.giroY + impulsoGiro
    const giroX = centrado * 5 + atual.giroX
    const escala = 1.04 - Math.abs(centrado) * 0.12
    const subida = centrado * -6

    placa.style.transform =
      `translate3d(0, ${subida}%, 0) rotateX(${giroX.toFixed(2)}deg) ` +
      `rotateY(${giroY.toFixed(2)}deg) scale(${escala.toFixed(3)})`

    // o fundo anda menos que a placa: é a separação que cria a profundidade
    fundo.style.transform =
      `translate3d(0, ${(centrado * -2).toFixed(2)}%, -180px) scale(${(1.5 + Math.abs(centrado) * 0.1).toFixed(3)})`

    // a sombra encolhe e clareia quando a peça "sobe"
    const longe = Math.abs(centrado)
    sombra.style.transform =
      `translate3d(${(giroY * 0.5).toFixed(1)}px, 0, 0) scale(${(1 - longe * 0.18).toFixed(3)}, ${(1 - longe * 0.3).toFixed(3)})`
    sombra.style.opacity = (0.42 - longe * 0.18).toFixed(3)

    // o brilho varre a peça conforme ela gira — é o que lê como plástico
    brilho.style.setProperty('--varredura', `${50 + giroY * 1.6}%`)
    brilho.style.opacity = (0.35 + Math.abs(giroY) / 120).toFixed(3)
  }
  requestAnimationFrame(laco)

  return {
    /** Empurrão de rotação ao trocar de sabor — a peça reage ao clique. */
    impulso() {
      impulsoGiro = 16
      animate(placa, { filter: ['brightness(1.12)', 'brightness(1)'] }, { duration: 0.5 })
    },
    destruir() {
      vivo = false
      cancelarScroll?.()
      palco.removeEventListener('pointerleave', aoSair)
    },
  }
}
