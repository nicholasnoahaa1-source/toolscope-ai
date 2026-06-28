import type { Category, Tool } from "./types";

export const categories: Category[] = [
  { slug: "escrita", name: "Escrita & Conteúdo", description: "Geração e edição de texto, copywriting, redação assistida." },
  { slug: "imagem", name: "Geração de Imagem", description: "Criação e edição de imagens via IA generativa." },
  { slug: "video", name: "Vídeo", description: "Geração, edição e legendagem de vídeo com IA." },
  { slug: "codigo", name: "Código & Desenvolvimento", description: "Assistentes de programação e agentes de engenharia." },
  { slug: "audio", name: "Áudio & Voz", description: "Síntese de voz, clonagem de voz e edição de áudio." },
  { slug: "produtividade", name: "Produtividade & Agentes", description: "Automação de tarefas e agentes multipropósito." },
];

function avg(reviews: Tool["reviews"]): number {
  if (reviews.length === 0) return 0;
  return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
}

const rawTools: Omit<Tool, "avgRating" | "reviewCount">[] = [
  {
    id: "1",
    slug: "scribeflow-ai",
    name: "ScribeFlow AI",
    tagline: "Redação assistida por IA para equipes de marketing",
    description:
      "ScribeFlow AI combina modelos de linguagem ajustados para copywriting com um editor colaborativo em tempo real. Indicado para equipes de marketing que precisam produzir conteúdo em volume mantendo consistência de tom de voz.",
    websiteUrl: "https://example.com/scribeflow",
    logoInitial: "S",
    pricingModel: "FREEMIUM",
    categorySlug: "escrita",
    tags: ["copywriting", "seo", "colaboracao", "marketing"],
    pricingPlans: [
      { name: "Free", priceUsdCents: 0, billingCycle: "monthly", features: ["10 gerações/mês", "1 usuário"] },
      { name: "Pro", priceUsdCents: 2900, billingCycle: "monthly", features: ["Gerações ilimitadas", "5 usuários", "Tom de voz customizado"] },
      { name: "Team", priceUsdCents: 9900, billingCycle: "monthly", features: ["Usuários ilimitados", "SSO", "API"] },
    ],
    reviews: [
      { id: "r1", author: "Marina C.", rating: 5, title: "Mudou nosso fluxo de conteúdo", body: "Reduzimos o tempo de produção de posts em 60%.", createdAt: "2026-04-12" },
      { id: "r2", author: "Diego R.", rating: 4, title: "Bom, mas o editor trava às vezes", body: "Qualidade do texto é ótima, mas tivemos bugs no editor colaborativo.", createdAt: "2026-05-02" },
    ],
  },
  {
    id: "2",
    slug: "pixelforge",
    name: "PixelForge",
    tagline: "Geração de imagens fotorrealistas a partir de texto",
    description:
      "PixelForge é especializado em geração de imagens fotorrealistas com controle fino de composição, iluminação e estilo. Usado por equipes de design de produto e e-commerce.",
    websiteUrl: "https://example.com/pixelforge",
    logoInitial: "P",
    pricingModel: "USAGE_BASED",
    categorySlug: "imagem",
    tags: ["fotorrealismo", "ecommerce", "design"],
    pricingPlans: [
      { name: "Pay as you go", priceUsdCents: 4, billingCycle: "usage", features: ["$0,04 por imagem", "Resolução até 4K"] },
      { name: "Studio", priceUsdCents: 4900, billingCycle: "monthly", features: ["2.000 créditos/mês", "Upscale 8K", "API"] },
    ],
    reviews: [
      { id: "r3", author: "Lucas T.", rating: 5, title: "Qualidade impressionante", body: "Substituímos boa parte da nossa produção de still de produto.", createdAt: "2026-03-20" },
      { id: "r4", author: "Helena P.", rating: 4, title: "Ótimo, custo pode escalar rápido", body: "Em alto volume o custo por imagem pesa no orçamento.", createdAt: "2026-06-01" },
    ],
  },
  {
    id: "3",
    slug: "clipnova",
    name: "ClipNova",
    tagline: "Edição de vídeo automática com cortes inteligentes",
    description:
      "ClipNova analisa gravações longas (lives, podcasts, webinars) e gera automaticamente cortes curtos prontos para redes sociais, com legendas e reframe vertical.",
    websiteUrl: "https://example.com/clipnova",
    logoInitial: "C",
    pricingModel: "FREEMIUM",
    categorySlug: "video",
    tags: ["shorts", "legendas", "redes-sociais", "podcast"],
    pricingPlans: [
      { name: "Free", priceUsdCents: 0, billingCycle: "monthly", features: ["30 min de processamento/mês"] },
      { name: "Creator", priceUsdCents: 3900, billingCycle: "monthly", features: ["20h de processamento/mês", "Marca própria"] },
    ],
    reviews: [
      { id: "r5", author: "Bia S.", rating: 5, title: "Economiza horas de edição", body: "Os cortes automáticos já saem 80% prontos.", createdAt: "2026-05-15" },
    ],
  },
  {
    id: "4",
    slug: "codepilot-x",
    name: "CodePilot X",
    tagline: "Agente de engenharia que revisa, refatora e corrige código",
    description:
      "CodePilot X vai além de autocomplete: roda como agente no seu repositório, abre PRs com correções, escreve testes e explica decisões técnicas no review.",
    websiteUrl: "https://example.com/codepilot-x",
    logoInitial: "X",
    pricingModel: "PAID",
    categorySlug: "codigo",
    tags: ["agentes", "code-review", "ci-cd", "testes"],
    pricingPlans: [
      { name: "Individual", priceUsdCents: 2000, billingCycle: "monthly", features: ["1 repositório ativo", "PRs ilimitados"] },
      { name: "Team", priceUsdCents: 4000, billingCycle: "monthly", features: ["Repositórios ilimitados", "Políticas de revisão customizadas"] },
    ],
    reviews: [
      { id: "r6", author: "Felipe A.", rating: 5, title: "Pegou bugs que passaram no review humano", body: "Já evitou pelo menos 2 incidentes em produção.", createdAt: "2026-04-28" },
      { id: "r7", author: "Sandra L.", rating: 3, title: "Bom, falsos positivos em PRs grandes", body: "Em PRs muito grandes gera sugestões redundantes.", createdAt: "2026-05-22" },
    ],
  },
  {
    id: "5",
    slug: "vocalis",
    name: "Vocalis",
    tagline: "Clonagem de voz e narração multilíngue",
    description:
      "Vocalis gera narrações realistas em mais de 40 idiomas e permite clonagem de voz com consentimento verificado, usado por produtoras de áudio, e-learning e dublagem.",
    websiteUrl: "https://example.com/vocalis",
    logoInitial: "V",
    pricingModel: "FREEMIUM",
    categorySlug: "audio",
    tags: ["voz", "dublagem", "e-learning", "multilíngue"],
    pricingPlans: [
      { name: "Free", priceUsdCents: 0, billingCycle: "monthly", features: ["10 min de áudio/mês"] },
      { name: "Pro", priceUsdCents: 2200, billingCycle: "monthly", features: ["10h de áudio/mês", "Clonagem de voz"] },
    ],
    reviews: [
      { id: "r8", author: "Renato M.", rating: 4, title: "Qualidade de voz muito natural", body: "Pequenos erros de pronúncia em nomes próprios.", createdAt: "2026-06-10" },
    ],
  },
  {
    id: "6",
    slug: "taskmind",
    name: "TaskMind",
    tagline: "Agente pessoal que organiza tarefas a partir de e-mail e chat",
    description:
      "TaskMind monitora e-mails, mensagens e calendário, transforma pedidos em tarefas, prioriza automaticamente e sugere quando delegar.",
    websiteUrl: "https://example.com/taskmind",
    logoInitial: "T",
    pricingModel: "FREEMIUM",
    categorySlug: "produtividade",
    tags: ["agentes", "automacao", "email", "calendario"],
    pricingPlans: [
      { name: "Free", priceUsdCents: 0, billingCycle: "monthly", features: ["1 integração"] },
      { name: "Pro", priceUsdCents: 1500, billingCycle: "monthly", features: ["Integrações ilimitadas", "Priorização por IA"] },
    ],
    reviews: [
      { id: "r9", author: "Camila V.", rating: 4, title: "Reduziu minha caixa de entrada", body: "Ainda erra a prioridade em e-mails ambíguos.", createdAt: "2026-05-30" },
    ],
  },
];

export const tools: Tool[] = rawTools.map((t) => ({
  ...t,
  avgRating: avg(t.reviews),
  reviewCount: t.reviews.length,
}));

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(categorySlug: string): Tool[] {
  return tools.filter((t) => t.categorySlug === categorySlug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return tools;
  return tools.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.tagline.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      t.categorySlug.toLowerCase().includes(q)
  );
}

export function formatPrice(cents: number | null): string {
  if (cents === null) return "Sob consulta";
  if (cents === 0) return "Grátis";
  return `US$ ${(cents / 100).toFixed(2)}`;
}
