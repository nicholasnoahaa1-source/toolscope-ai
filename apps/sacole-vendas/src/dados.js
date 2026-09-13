/**
 * DADOS REAIS DA MARCA — ÚNICA FONTE DE VERDADE DA PÁGINA.
 *
 * Tudo aqui começa `null` de propósito. Nada nesta página pode ser inventado:
 * enquanto um campo for `null`, a página não exibe um valor falso — ela mostra
 * o campo como pendente (em desenvolvimento) ou omite a seção (em produção).
 *
 * Preencha e nada mais precisa ser tocado no código.
 */

export const marca = {
  nome: null,          // ex.: "Sacolé da Vila"
  slogan: null,        // ex.: "Fruta de verdade, feito no dia" — ou deixe null
  cidade: null,        // ex.: "Vila Nova, Goiânia"
  diferencial: null,   // o que você faz que a concorrência não faz
}

export const contato = {
  whatsapp: null,      // só dígitos, ex.: "5562999998888"
  instagram: null,     // ex.: "@sacoledavila"
}

/**
 * Cada sabor pilota o 3D: `creme` é a cor do recheio, `pedacos` a cor dos
 * pedaços suspensos, `pedacosVisiveis` liga/desliga o InstancedMesh.
 */
export const sabores = [
  // {
  //   id: 'oreo',
  //   nome: 'Oreo',
  //   preco: 5.0,                 // por unidade, em reais
  //   creme: '#f3ece0',
  //   pedacos: '#1b1b1d',
  //   pedacosVisiveis: true,
  //   descricao: null,            // uma linha curta, opcional
  // },
]

export const combos = [
  // { quantidade: 10, preco: 45 },
]

export const entrega = {
  bairros: null,       // ex.: "Vila Nova, Setor Sul e Jardim Botânico"
  taxa: null,          // ex.: "R$ 5 por entrega" ou "grátis acima de 20 unidades"
  prazo: null,         // ex.: "até 2h"
  retirada: null,      // endereço ou "a combinar pelo WhatsApp"
}

export const operacao = {
  horario: null,       // ex.: "Seg a sáb, 10h às 20h"
  pagamento: null,     // ex.: "Pix, cartão e dinheiro"
  pedidoMinimo: null,  // ex.: "10 unidades"
}

/** Avaliações reais. Vazio = a seção vira convite para o cliente enviar a dele. */
export const avaliacoes = []

/** true quando cada campo obrigatório estiver preenchido. */
export const pendente = (v) => v === null || v === undefined || v === ''

export const faltando = () => {
  const alvos = {
    'marca.nome': marca.nome,
    'marca.cidade': marca.cidade,
    'marca.diferencial': marca.diferencial,
    'contato.whatsapp': contato.whatsapp,
    'contato.instagram': contato.instagram,
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
  if (!combos.length) lista.push('combos')
  return lista
}
