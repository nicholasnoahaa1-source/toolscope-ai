# SacoPex Content Engine

Sistema modular de geração de conteúdo para SacoPex, com camada permanente de Brand Rules e verificação automática de conformidade.

---

## Estrutura do Projeto

```
sacopex/
├── BRAND_BRAIN/                    # Camada de marca — LOCKED (imutável)
│   ├── brand.md                   # Identidade, pilares, promessa
│   ├── visual-rules.md            # Paleta, tipografia, restrições
│   ├── tone-of-voice.md           # Regras de linguagem e copy
│   ├── products.md                # Catálogo de sabores
│   └── forbidden.md               # Lista de palavras/conceitos proibidos (QC automático)
│
├── CONTENT_ENGINE/                # Módulos de geração
│   ├── strategy/                  # Briefs estratégicos (um por campanha)
│   ├── copy/                      # Copy assets (headlines, legs, CTAs)
│   ├── visual/                    # Direções visuais (composição, mood)
│   ├── video/                     # Roteiros e storyboards
│   └── templates/                 # Templates reutilizáveis
│       ├── strategy.template.md
│       ├── copy.template.md
│       ├── visual.template.md
│       └── video.template.md
│
└── OUTPUT/                        # Conteúdo gerado, organizado por plataforma
    ├── instagram/
    ├── tiktok/
    ├── ads/
    └── campaigns/
```

---

## Como Usar

### 1. **Briefing** (5 min)
Preencha o formulário no webapp (SacoPex Content Engine):
- Produto, Sabor, Objetivo, Público, Formato, Oferta, Tom, CTA

### 2. **Geração** (automática)
O engine passa por 9 módulos:
1. Strategy (pilar, ângulo, insight)
2. Creative Concept (big idea, hook)
3. Copy (headlines, leg, long, hashtags)
4. Visual Direction (mood, paleta, composição)
5. Image Prompts (3 variações para IA)
6. Video Prompt (roteiro cena-a-cena)
7. Social Adaptation (stories, carrossel, post)
8. A/B Variations (testes de copy)
9. Quality Control (score 0–100, mínimo 80)

### 3. **Saída: Content Pack Completo**
- Estratégia (1 doc)
- Big Idea + Hook (1 artefato)
- Copy Assets (3 variações)
- Direção Visual (guia para designer)
- Prompts de Imagem (3 para DALL-E/Midjourney)
- Roteiro e Storyboard de Vídeo
- Sequência de Stories (4–5 cards)
- Carrossel (5 slides)
- Biblioteca de CTAs (5 opções)
- Variações A/B (3 versões)
- Relatório de QC (verificação de marca)

---

## Estrutura de Arquivos — Como Organizar

### Na pasta `strategy/`
Nomeie cada briefing por campanha:
```
strategy/2024-01-15-sacolé-oreo-venda.md
strategy/2024-02-01-morango-lançamento.md
```

### Na pasta `copy/`
Copy aprovado/final:
```
copy/2024-01-15-sacolé-oreo-venda-copy.md
```

### Na pasta `visual/`
Direções visuais por projeto:
```
visual/2024-01-15-sacolé-oreo-venda-visual.md
```

### Na pasta `video/`
Roteiros e prompts:
```
video/2024-01-15-sacolé-oreo-venda-reel-roteiro.md
video/2024-01-15-sacolé-oreo-venda-reel-prompt.md
```

### Na pasta `OUTPUT/`
Organize por plataforma e data:
```
OUTPUT/instagram/2024-01-15-sacolé-oreo/
  ├── feed-post.jpg
  ├── copy.txt
  └── specs.md

OUTPUT/tiktok/2024-01-15-sacolé-oreo/
  ├── reel-15s.mp4
  ├── roteiro.md
  └── copy.txt
```

---

## Brand Rules — LOCKED (Não Alterar)

Toda saída passa por estas verificações. Sem exceções.

### Paleta (4 cores)
- Creme `#F5F1EB`
- Navy `#1A2B3E`
- Navy Tartaruga `#2D4A5C`
- Laranja Pastel `#E89B7E`

### Tipografia
- Headlines: Manrope (700–800)
- Body: Tiempos Text Italic (400–500)
- Sem outras fontes

### Proibido
- Sem logo gráfico, sem símbolo
- Sem claims de saúde
- Sem gírias forçadas
- Sem comparação com concorrentes
- Sem tom corporativo ou brega

**Leia** `/BRAND_BRAIN/forbidden.md` para lista completa.

---

## Quality Control

Cada output tem um score 0–100:

| Critério | Score |
|----------|-------|
| Sem health claims | +25 |
| Sem gírias forçadas | +10 |
| Sem comparação com concorrentes | +25 |
| Oferta clara (se Venda) | +10 |
| Paleta locked | +10 |
| Tipografia locked | +10 |
| Sem logo/símbolo | +5 |
| Assinatura SacoPex presente | +5 |

**Mínimo para aprovação: 80/100**

Se score < 80, o sistema sinaliza qual regra foi quebrada.

---

## Fluxo de Trabalho

```
1. Briefing (usuário preenche form)
         ↓
2. Strategy Module (pilar, ângulo, insight)
         ↓
3. Creative Concept (big idea, hook)
         ↓
4. Copy Engine (headlines, copy, hashtags)
         ↓
5. Visual Direction (mood, composição, paleta)
         ↓
6. Image Prompts (3 variações para IA)
         ↓
7. Video Prompt + Roteiro (storyboard cena-a-cena)
         ↓
8. Social Adaptation (Stories, Carrossel, Post)
         ↓
9. A/B Variations (teste de copy)
         ↓
10. Quality Control (score + checklist)
         ↓
11. Content Pack (saída final)
```

Cada módulo é independente — novos formatos/adaptações entram sem reescrever os outros.

---

## Extensibilidade

Para **adicionar um novo formato** (ex: LinkedIn Post):

1. Adicione em `/CONTENT_ENGINE/templates/` um novo template com os campos esperados
2. Registre no `FORMAT_ADAPTERS` no webapp (1 linha)
3. Nenhuma mudança nas rules de brand, copy ou visual

Para **adicionar um novo sabor de produto**:

1. Edite `/BRAND_BRAIN/products.md`
2. Adicione à tabela (nome, descrição, ângulo, público, cor primária)
3. Nada mais muda — strategy/copy/visual se adaptam automaticamente

Para **adicionar uma nova restrição de brand**:

1. Edite `/BRAND_BRAIN/forbidden.md`
2. Adicione regex (se aplicável) ou conceito
3. Atualize o engine QC
4. Confirme com time

---

## Documentos de Referência

- **`brand.md`** — Leia primeiro. Define identidade, pilares, promessa
- **`visual-rules.md`** — Briefing visual: paleta, tipografia, composição
- **`tone-of-voice.md`** — Regras de linguagem: tom, palavras-chave, exemplos
- **`products.md`** — Catálogo: sabores, contexto, embalagem
- **`forbidden.md`** — QC automático: palavras/conceitos bloqueados

Todos os arquivos são públicos dentro da SacoPex — designers, copywriters, product managers, todos devem ler `/BRAND_BRAIN/` antes de criar conteúdo.

---

## Contato / Suporte

- **Brand Lead:** [seu nome] — marca, visual-rules, exceptions
- **Copy Lead:** [seu nome] — tone, copy templates
- **Content Operations:** [seu nome] — estrutura, workflows

Para reportar um bug ou inconsistência no engine, abra um issue em `/GITHUB/issues` com tag `[sacopex-engine]`.

---

## Histórico

- **v1.0** (Jan 2024) — Engine lançado com Sacolé Oreo; 4 módulos core (Strategy, Creative, Copy, Visual); QC automático
- **v1.1** (planned) — Integração DALL-E / Midjourney para geração de imagem automática
- **v2.0** (planned) — Integração de vídeo (Runway, Synthesia); A/B testing automático

---

**SacoPex Content Engine — Sistema Modular de Geração de Conteúdo**  
Última atualização: 2024-01-15
