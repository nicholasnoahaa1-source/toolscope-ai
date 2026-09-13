import { animate, inView, stagger } from 'motion'
import { marca, contato, sabores, combos, entrega, operacao, avaliacoes, pendente, faltando } from './dados.js'
import { montarPalco } from './palco.js'
import './estilo.css'

const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches
const real = (v) => (pendente(v) ? null : v)
const reais = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/* ---------------- campos vindos de dados.js ---------------- */
const fonte = { marca, contato, entrega, operacao }
document.querySelectorAll('[data-campo]').forEach((el) => {
  const [grupo, chave] = el.dataset.campo.split('.')
  const valor = real(fonte[grupo]?.[chave])
  if (valor) el.textContent = valor
  else if (el.tagName === 'P') el.remove()
})

/* ---------------- aviso de dados faltando (só em dev) ---------------- */
const pendencias = faltando()
if (import.meta.env.DEV && pendencias.length) {
  const aviso = document.getElementById('aviso-dev')
  aviso.className = 'aviso-dev'
  aviso.textContent = `Dados reais faltando em src/dados.js: ${pendencias.join(', ')}`
}

/* ---------------- WhatsApp ---------------- */
let saborEscolhido = sabores[0] ?? null

function linkWhatsApp() {
  const numero = real(contato.whatsapp)
  if (!numero) return null
  const nome = real(marca.nome) ?? 'vocês'
  const texto = saborEscolhido
    ? `Oi! Quero pedir sacolé de ${saborEscolhido.nome}.`
    : `Oi! Quero fazer um pedido com ${nome}.`
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}

function atualizarBotoes() {
  const url = linkWhatsApp()
  document.querySelectorAll('#pedir-heroi, #pedir-barra, .botao-whats').forEach((a) => {
    if (url) {
      a.href = url
      a.target = '_blank'
      a.rel = 'noopener'
      a.removeAttribute('aria-disabled')
    } else {
      a.href = '#sabores'
      a.removeAttribute('target')
    }
  })
  const resumo = document.getElementById('barra-resumo')
  resumo.textContent = saborEscolhido
    ? `${saborEscolhido.nome} · ${reais(saborEscolhido.preco)}`
    : sabores.length ? 'Escolha um sabor' : 'Cardápio em atualização'
}

/* ---------------- sabores ---------------- */
const listaSabores = document.getElementById('lista-sabores')
if (sabores.length) {
  sabores.forEach((s, i) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'sabor'
    b.setAttribute('aria-pressed', String(i === 0))
    b.innerHTML = `<span class="sabor__nome"></span><span class="sabor__preco"></span>`
    b.querySelector('.sabor__nome').textContent = s.nome
    b.querySelector('.sabor__preco').textContent = reais(s.preco)
    b.addEventListener('click', () => {
      saborEscolhido = s
      listaSabores.querySelectorAll('.sabor').forEach((o) => o.setAttribute('aria-pressed', 'false'))
      b.setAttribute('aria-pressed', 'true')
      palco?.impulso()
      atualizarBotoes()
    })
    listaSabores.appendChild(b)
  })
} else {
  listaSabores.innerHTML = '<p class="pendencia">Sabores a preencher em src/dados.js</p>'
}

/* ---------------- combos ---------------- */
/** Seção sem conteúdo real não vira placeholder: sai da página e da navegação. */
function removerSecao(id) {
  document.getElementById(id)?.remove()
  document.querySelectorAll(`a[href="#${id}"]`).forEach((a) => a.remove())
}

const listaCombos = document.getElementById('lista-combos')
if (combos.length) {
  combos.forEach((c) => {
    const d = document.createElement('div')
    d.className = 'combo'
    d.innerHTML = `<span class="combo__qtd"></span><span class="rotulo">unidades</span><strong></strong>`
    d.querySelector('.combo__qtd').textContent = c.quantidade
    d.querySelector('strong').textContent = reais(c.preco)
    listaCombos.appendChild(d)
  })
} else {
  removerSecao('combos')
}

/* ---------------- entrega, operação, rodapé ---------------- */
function tabela(alvo, linhas) {
  const el = document.getElementById(alvo)
  const vivas = linhas.filter(([, v]) => real(v))
  if (!vivas.length) {
    el.innerHTML = '<p class="pendencia">A preencher em src/dados.js</p>'
    return
  }
  vivas.forEach(([rotulo, valor]) => {
    const d = document.createElement('div')
    d.innerHTML = `<span class="rotulo"></span><span></span>`
    d.querySelector('.rotulo').textContent = rotulo
    d.querySelector('span:last-child').textContent = valor
    el.appendChild(d)
  })
}
tabela('tabela-entrega', [
  ['Bairros', entrega.bairros],
  ['Taxa', entrega.taxa],
  ['Prazo', entrega.prazo],
  ['Retirada', entrega.retirada],
  ['Horário', operacao.horario],
  ['Pagamento', operacao.pagamento],
  ['Pedido mínimo', operacao.pedidoMinimo],
])
tabela('rodape-contato', [
  ['Instagram', contato.instagram],
  ['Cidade', marca.cidade],
  ['Horário', operacao.horario],
])

/* ---------------- avaliações: nunca inventadas ---------------- */
const listaAvaliacoes = document.getElementById('lista-avaliacoes')
if (avaliacoes.length) {
  avaliacoes.forEach((a) => {
    const fig = document.createElement('figure')
    fig.style.margin = '0'
    fig.innerHTML = `<blockquote></blockquote><figcaption class="rotulo"></figcaption>`
    fig.querySelector('blockquote').textContent = a.texto
    fig.querySelector('figcaption').textContent = a.autor
    listaAvaliacoes.appendChild(fig)
  })
} else {
  listaAvaliacoes.innerHTML =
    `<p>Ainda não publicamos avaliações aqui. Se você já provou, manda a sua pelo WhatsApp — a gente publica com o seu nome.</p>
     <p><a class="botao botao--secundario botao-whats" href="#sabores">Enviar minha avaliação</a></p>`
}

atualizarBotoes()

/* ---------------- menu, tema ---------------- */
const botaoMenu = document.getElementById('botao-menu')
const navMobile = document.getElementById('nav-mobile')
const fecharMenu = () => {
  navMobile.hidden = true
  botaoMenu.setAttribute('aria-expanded', 'false')
  botaoMenu.setAttribute('aria-label', 'Abrir menu')
}
botaoMenu.addEventListener('click', () => {
  const aberto = !navMobile.hidden
  if (aberto) return fecharMenu()
  navMobile.hidden = false
  botaoMenu.setAttribute('aria-expanded', 'true')
  botaoMenu.setAttribute('aria-label', 'Fechar menu')
  navMobile.querySelector('a')?.focus()
})
navMobile.addEventListener('click', (e) => { if (e.target.tagName === 'A') fecharMenu() })
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !navMobile.hidden) { fecharMenu(); botaoMenu.focus() }
})

const botaoTema = document.getElementById('botao-tema')
botaoTema.addEventListener('click', () => {
  const escuroAgora =
    document.documentElement.dataset.tema === 'escuro' ||
    (!document.documentElement.dataset.tema && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.tema = escuroAgora ? 'claro' : 'escuro'
})

/* ---------------- movimento de interface ---------------- */
if (!reduzido) {
  inView('.secao__cabeca', (el) => {
    animate(el.children, { opacity: [0, 1], y: [16, 0] }, { delay: stagger(0.06), duration: 0.5 })
  }, { amount: 0.3 })
  animate('.heroi__texto > *', { opacity: [0, 1], y: [20, 0] }, { delay: stagger(0.07), duration: 0.6 })
}

/* ---------------- palco: a foto animada pelo scroll ---------------- */
const palco = montarPalco(document.getElementById('palco'), { reduzido })
