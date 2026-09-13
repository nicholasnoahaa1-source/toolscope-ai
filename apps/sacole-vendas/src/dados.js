/**
 * DADOS REAIS DA SACOPEX — ÚNICA FONTE DE VERDADE DA PÁGINA.
 *
 * Nada aqui pode ser inventado. Campo `null` não vira texto falso: some da
 * página em produção e aparece como pendência em desenvolvimento.
 */

export const marca = {
  nome: 'SacoPex',
  slogan: null,
  cidade: 'Curicica, Jacarepaguá',
  diferencial:
    'Sacolé feito à mão, em casa, poucos por vez — cada saquinho é batido, ' +
    'enchido e amarrado um a um, não sai de fábrica.',
}

export const contato = {
  whatsapp: '5521966670595',
  instagram: null,
}

/**
 * Cada sabor pilota o 3D: `creme` é a cor do recheio, `pedacos` a cor dos
 * pedaços suspensos. Preço: fruta/normal R$ 5, gourmet R$ 6.
 *
 * A lista abaixo tem só os sabores confirmados. Para acrescentar outro,
 * copie um bloco e ajuste nome, preço e as duas cores — o 3D acompanha.
 */
export const sabores = [
  {
    id: 'coco',
    nome: 'Coco',
    preco: 5,
    creme: '#f7f3ea',
    pedacos: '#c2ab86',
    pedacosVisiveis: true,
    descricao: null,
  },
  {
    id: 'maracuja',
    nome: 'Maracujá',
    preco: 5,
    creme: '#f7d98c',
    pedacos: '#3f2c1b',
    pedacosVisiveis: true,
    descricao: null,
  },
  {
    id: 'oreo',
    nome: 'Oreo',
    preco: 6,
    creme: '#f0e9dd',
    pedacos: '#1b1b1d',
    pedacosVisiveis: true,
    descricao: null,
  },
]

/** Sem combos por enquanto. */
export const combos = []

export const entrega = {
  bairros: 'Curicica e Jacarepaguá',
  taxa: null,
  prazo: null,
  retirada: 'A combinar pelo WhatsApp — você busca ou eu levo',
}

export const operacao = {
  horario: 'Pedidos pelo WhatsApp a qualquer hora',
  pagamento: 'Pix, dinheiro e cartão (cartão com juros)',
  pedidoMinimo: 'Sem pedido mínimo',
}

/** Avaliações reais. Vazio = a seção vira convite para o cliente enviar a dele. */
export const avaliacoes = []

export const pendente = (v) => v === null || v === undefined || v === ''

export const faltando = () => {
  const alvos = {
    'marca.nome': marca.nome,
    'marca.cidade': marca.cidade,
    'marca.diferencial': marca.diferencial,
    'contato.whatsapp': contato.whatsapp,
    'entrega.bairros': entrega.bairros,
    'entrega.taxa': entrega.taxa,
    'entrega.prazo': entrega.prazo,
    'entrega.retirada': entrega.retirada,
    'operacao.horario': operacao.horario,
    'operacao.pagamento': operacao.pagamento,
    'operacao.pedidoMinimo': operacao.pedidoMinimo,
  }
  const lista = Object.entries(alvos).filter(([, v]) => pendente(v)).map(([k]) => k)
  if (!sabores.length) lista.push('sabores')
  return lista
}
