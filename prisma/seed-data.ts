export type SeedPricingPlan = {
  name: string;
  priceUsdCents: number | null;
  billingCycle: "monthly" | "yearly" | "one_time" | "usage" | null;
  features: string[];
};

export type SeedTool = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  pricingModel: "FREE" | "FREEMIUM" | "PAID" | "USAGE_BASED" | "CONTACT_SALES";
  categorySlug: string;
  tags: string[];
  pricingPlans: SeedPricingPlan[];
};

export type SeedCategory = {
  slug: string;
  name: string;
  description: string;
};

export const categories: SeedCategory[] = [
  { slug: "escrita", name: "Escrita & Conteúdo", description: "Geração e edição de texto, copywriting, redação assistida." },
  { slug: "imagem", name: "Geração de Imagem", description: "Criação e edição de imagens via IA generativa." },
  { slug: "video", name: "Vídeo", description: "Geração, edição e legendagem de vídeo com IA." },
  { slug: "codigo", name: "Código & Desenvolvimento", description: "Assistentes de programação e agentes de engenharia." },
  { slug: "audio", name: "Áudio & Voz", description: "Síntese de voz, clonagem de voz e edição de áudio." },
  { slug: "produtividade", name: "Produtividade & Agentes", description: "Automação de tarefas e agentes multipropósito." },
];

export const tools: SeedTool[] = [
  {
    slug: "scribeflow-ai",
    name: "ScribeFlow AI",
    tagline: "Redação assistida por IA para equipes de marketing",
    description:
      "ScribeFlow AI combina modelos de linguagem ajustados para copywriting com um editor colaborativo em tempo real. Indicado para equipes de marketing que precisam produzir conteúdo em volume mantendo consistência de tom de voz.",
    websiteUrl: "https://example.com/scribeflow",
    pricingModel: "FREEMIUM",
    categorySlug: "escrita",
    tags: ["copywriting", "seo", "colaboracao", "marketing"],
    pricingPlans: [
      { name: "Free", priceUsdCents: 0, billingCycle: "monthly", features: ["10 gerações/mês", "1 usuário"] },
      { name: "Pro", priceUsdCents: 2900, billingCycle: "monthly", features: ["Gerações ilimitadas", "5 usuários", "Tom de voz customizado"] },
      { name: "Team", priceUsdCents: 9900, billingCycle: "monthly", features: ["Usuários ilimitados", "SSO", "API"] },
    ],
  },
  {
    slug: "pixelforge",
    name: "PixelForge",
    tagline: "Geração de imagens fotorrealistas a partir de texto",
    description:
      "PixelForge é especializado em geração de imagens fotorrealistas com controle fino de composição, iluminação e estilo. Usado por equipes de design de produto e e-commerce.",
    websiteUrl: "https://example.com/pixelforge",
    pricingModel: "USAGE_BASED",
    categorySlug: "imagem",
    tags: ["fotorrealismo", "ecommerce", "design"],
    pricingPlans: [
      { name: "Pay as you go", priceUsdCents: 4, billingCycle: "usage", features: ["$0,04 por imagem", "Resolução até 4K"] },
      { name: "Studio", priceUsdCents: 4900, billingCycle: "monthly", features: ["2.000 créditos/mês", "Upscale 8K", "API"] },
    ],
  },
  {
    slug: "clipnova",
    name: "ClipNova",
    tagline: "Edição de vídeo automática com cortes inteligentes",
    description:
      "ClipNova analisa gravações longas (lives, podcasts, webinars) e gera automaticamente cortes curtos prontos para redes sociais, com legendas e reframe vertical.",
    websiteUrl: "https://example.com/clipnova",
    pricingModel: "FREEMIUM",
    categorySlug: "video",
    tags: ["shorts", "legendas", "redes-sociais", "podcast"],
    pricingPlans: [
      { name: "Free", priceUsdCents: 0, billingCycle: "monthly", features: ["30 min de processamento/mês"] },
      { name: "Creator", priceUsdCents: 3900, billingCycle: "monthly", features: ["20h de processamento/mês", "Marca própria"] },
    ],
  },
  {
    slug: "codepilot-x",
    name: "CodePilot X",
    tagline: "Agente de engenharia que revisa, refatora e corrige código",
    description:
      "CodePilot X vai além de autocomplete: roda como agente no seu repositório, abre PRs com correções, escreve testes e explica decisões técnicas no review.",
    websiteUrl: "https://example.com/codepilot-x",
    pricingModel: "PAID",
    categorySlug: "codigo",
    tags: ["agentes", "code-review", "ci-cd", "testes"],
    pricingPlans: [
      { name: "Individual", priceUsdCents: 2000, billingCycle: "monthly", features: ["1 repositório ativo", "PRs ilimitados"] },
      { name: "Team", priceUsdCents: 4000, billingCycle: "monthly", features: ["Repositórios ilimitados", "Políticas de revisão customizadas"] },
    ],
  },
  {
    slug: "vocalis",
    name: "Vocalis",
    tagline: "Clonagem de voz e narração multilíngue",
    description:
      "Vocalis gera narrações realistas em mais de 40 idiomas e permite clonagem de voz com consentimento verificado, usado por produtoras de áudio, e-learning e dublagem.",
    websiteUrl: "https://example.com/vocalis",
    pricingModel: "FREEMIUM",
    categorySlug: "audio",
    tags: ["voz", "dublagem", "e-learning", "multilíngue"],
    pricingPlans: [
      { name: "Free", priceUsdCents: 0, billingCycle: "monthly", features: ["10 min de áudio/mês"] },
      { name: "Pro", priceUsdCents: 2200, billingCycle: "monthly", features: ["10h de áudio/mês", "Clonagem de voz"] },
    ],
  },
  {
    slug: "taskmind",
    name: "TaskMind",
    tagline: "Agente pessoal que organiza tarefas a partir de e-mail e chat",
    description:
      "TaskMind monitora e-mails, mensagens e calendário, transforma pedidos em tarefas, prioriza automaticamente e sugere quando delegar.",
    websiteUrl: "https://example.com/taskmind",
    pricingModel: "FREEMIUM",
    categorySlug: "produtividade",
    tags: ["agentes", "automacao", "email", "calendario"],
    pricingPlans: [
      { name: "Free", priceUsdCents: 0, billingCycle: "monthly", features: ["1 integração"] },
      { name: "Pro", priceUsdCents: 1500, billingCycle: "monthly", features: ["Integrações ilimitadas", "Priorização por IA"] },
    ],
  },
];
