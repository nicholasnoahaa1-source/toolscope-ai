# SacoPex Content OS — Webapp

Sistema modular de geração e reutilização automática de conteúdo para SacoPex.

---

## 📋 Estrutura

```
WEBAPP/
├── index.html                  # Hub/Menu — acesso aos dois engines
├── cascade-engine.html         # Ideia → 20+ peças (9 estágios)
├── repurposing-engine.html     # Peça → Adaptações (6 plataformas)
└── README.md                   # Este arquivo
```

---

## 🚀 Como Usar

### 1. **Cascade Engine** — Uma ideia → 20+ peças

Abra `cascade-engine.html` ou clique em "Abrir Cascade Engine" no menu.

**Input:** Texto natural
```
Quero lançar SacoPex Oreo
```

**Processamento:**
- Auto-parsing: extrai produto (SacoPex), sabor (Oreo), objetivo (lançar)
- Cascata de 9 geradores sequenciais
- Cada gerador produz saídas baseadas no anterior

**Output (20+ peças):**
1. Big Idea (1)
2. Hooks (3)
3. Reels (2)
4. Stories (3)
5. Carrossel (1)
6. Post (1)
7. Legendas (3)
8. Anúncios (2)
9. A/B Variations (3)

**Exemplo de Input:**
```
Quero vender SacoPex Morango
Engajar público jovem com novidade
```

O engine detecta: Produto=SacoPex, Sabor=Morango, Objetivo=vender/engajar, e gera peças com emoções apropriadas.

---

### 2. **Repurposing Engine** — Uma peça → Plataformas

Abra `repurposing-engine.html` ou clique em "Abrir Repurposing Engine" no menu.

**Input:** Qualquer conteúdo (Reel, Post, Hook, Story, Carousel, Legenda)

**Plataformas suportadas:**
- 📱 **Instagram** (Reel, Post, Stories, Carrossel)
- 🎵 **TikTok** (Video, Caption)
- 💬 **WhatsApp** (Mensagem com emojis)
- ▶️ **YouTube Shorts** (Video, Título)
- 📢 **Anúncios** (Headlines + Body, 3 variações)
- 📧 **Email** (Campaign, Newsletter)

**Processamento:**
1. Cole o conteúdo
2. Selecione tipo (auto-detect ou manual)
3. Selecione plataformas
4. Clique "Reutilizar para Plataformas"

**Output:**
Adaptações específicas por plataforma com:
- Duração/Aspect Ratio (15-90s / 9:16, 1:1, etc)
- Limite de caracteres (max 100 chars, 2200 chars, etc)
- Emojis, hashtags, links encurtados
- CTAs otimizados por plataforma
- Paleta locked (Creme, Navy, Laranja Pastel)

**Exemplo:**
Cole um Reel:
```
REEL SACOPEX OREO
Hook: "Quando expectativa é sofisticada"
Duração: 15-22s
Cena 1: Still-life Oreo sobre Creme...
```

O engine adapta para:
- **Instagram**: Reel (9:16), Post (1:1), Stories (5 cards), Carrossel (5 slides)
- **TikTok**: Video (15-60s), Caption com trending audio
- **WhatsApp**: Mensagem com emojis + link encurtado
- **YouTube**: Shorts (título + descrição)
- **Ads**: 3 variações (Emocional, Racional, Urgência)
- **Email**: Subject + Preheader + Body

---

## 🔐 Brand Compliance (LOCKED)

Todos os outputs respeitam automaticamente:

### Paleta
- **Creme** `#F5F1EB` — fundo principal
- **Navy** `#1A2B3E` — textos, borders
- **Navy Tartaruga** `#2D4A5C` — textos secundários
- **Laranja Pastel** `#E89B7E` — destaque, badges

### Tipografia
- **Headlines:** Manrope (700–800)
- **Body:** Tiempos Text Italic (400–500)

### Proibições (QC Automático)
- ❌ Sem claims de saúde ("emagrece", "cura", "diet", "sem açúcar")
- ❌ Sem gírias forçadas ("mano", "véi", "tipo assim", "slk")
- ❌ Sem comparação com concorrentes
- ❌ Sem falsas promessas ("revolucionário", "muda vidas")
- ❌ Sem logo, símbolo, clipart, emoji como elemento principal
- ❌ Sem efeitos gráficos (glow, blur, glitch, padrões geométricos)

---

## 📊 Produtos Suportados

**Bancos de dados internos:**

| Sabor | Ângulo | Público | Cor Primária |
|-------|--------|---------|-------------|
| Oreo | Nostalgia sofisticada | Millennials nostálgicos | Navy Tartaruga (#2D4A5C) |
| Morango | Frescor natural | Público jovem | Laranja Pastel (#E89B7E) |
| Chocolate | [expandir] | [expandir] | [expandir] |

Para adicionar novos sabores, edite `../BRAND_BRAIN/products.md`.

---

## 🎯 Objetivos Mapeados

| Objetivo | Pilar | Emoções |
|----------|-------|---------|
| lançar | Antecipação | expectativa, surpresa |
| vender | Ação Imediata | urgência, desejo |
| engajar | Conversa | curiosidade, pertencimento |
| descobrir | Descoberta | encanto, curiosidade |

---

## 🔄 Fluxo Integrado (Recomendado)

```
1. Cascade Engine: "Quero vender SacoPex Oreo"
   ↓
   Gera: Big Idea, 3 Hooks, 2 Reels, 3 Stories, 1 Carrossel, 1 Post, 3 Legendas, 2 Anúncios, 3 A/B Variations

2. Selecione UMA peça (ex: Reel #1)
   ↓
   Repurposing Engine: Cole o Reel

3. Selecione plataformas (Instagram, TikTok, WhatsApp, YouTube)
   ↓
   Gera adaptações de cada peça para cada plataforma

4. Resultado: 4 plataformas × 1-4 formatos = 10+ variações prontas
```

**Tempo total:** ~3 minutos para 20+ peças de conteúdo completo.

---

## 🛠️ Customização & Extensão

### Adicionar Novo Sabor

1. Edite `/BRAND_BRAIN/products.md`
2. Adicione linha na tabela:
   ```
   | NovoSabor | Ângulo de Marketing | Público-Alvo | Cor Primária |
   ```
3. Cascade Engine auto-detecta na próxima sessão

### Adicionar Nova Plataforma

1. Edite `repurposing-engine.html`
2. Adicione novo `platform` em `PLATFORM_SPECS`:
   ```javascript
   novaplataforma: {
     formats: ['Format1', 'Format2'],
     format1: { duration: '...', aspect: '...' }
   }
   ```
3. Adicione checkbox no HTML: `<input type="checkbox" name="platform" value="novaplataforma">`
4. Implemente função `generateAdaptations()` para o novo platform

### Adicionar Nova Restrição Brand

1. Edite `/BRAND_BRAIN/forbidden.md`
2. Adicione regex pattern
3. O QC automático sinaliza violações (score < 80)

---

## 📝 Exemplo Completo

### Sessão 1: Cascade Engine

```
INPUT: "Quero lançar SacoPex Morango para públi…
```

OUTPUT: 19 peças
```
✓ BIG IDEA: "Quando frescor encontra sofisticação"
✓ HOOK 1: "Aquele momento em que refrescância é sofisticada"
✓ HOOK 2: "Você merecia isso: frescor natural sem compromisos"
✓ HOOK 3: "Novidade que esperávamos: SacoPex Morango"
✓ REEL 1: Hook + 5 cenas (15-22s)
✓ REEL 2: Hook alternativo + 5 cenas
✓ STORY 1: "Expectativa — Quando frescor..."
✓ STORY 2: "Revelação — Morango chegou com tudo"
✓ STORY 3: "CTA — 2 por R$10"
✓ CARROSSEL: 5 slides (Ideia, Hook, Benefício, Uso, CTA)
✓ POST FEED: Legenda + hashtags + emoji
✓ LEGENDA 1-3: Variações curtas (140-200 chars)
✓ ANÚNCIO 1-2: Headline + Body + CTA
✓ A/B VAR 1-3: Emocional, Racional, Urgência
```

### Sessão 2: Repurposing Engine

```
INPUT: [Cole REEL 1 do resultado acima]
PLATAFORMAS: Instagram, TikTok, WhatsApp, YouTube, Ads, Email
```

OUTPUT: 18+ adaptações
```
INSTAGRAM:
  ✓ Reel (9:16, 15-90s, hook nos primeiros 3s)
  ✓ Post (1:1, legenda + hashtags)
  ✓ Stories (3 cards, 5-15s cada)
  ✓ Carrossel (5 slides, 1:1 cada)

TIKTOK:
  ✓ Video (15-60s, trend-aware, som)

WHATSAPP:
  ✓ Mensagem (1000 chars, emojis, link encurtado)

YOUTUBE:
  ✓ Shorts (15-60s, título + descrição)

ADS:
  ✓ Copy A (Emocional)
  ✓ Copy B (Racional)
  ✓ Copy C (Urgência)

EMAIL:
  ✓ Campaign (subject + preheader + body)
```

**Total de peças prontas: 19 (Cascade) + 18 (Repurposing) = 37 conteúdos únicos em 5 minutos.**

---

## ⚙️ Stack Técnico

- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Brand Data:** JSON objects embedded
- **Product DB:** PRODUTOS_DB, OBJETIVOS_MAP
- **Compliance:** Regex patterns em BRAND.forbidden
- **Architecture:** Client-side, sem backend (facilita uso offline)

---

## 🔗 Referências

- Documentação Brand: `../BRAND_BRAIN/README.md`
- Templates: `../CONTENT_ENGINE/templates/`
- Notion Infra: `../README.md` (seção "SacoPex Content OS")

---

## 📞 Suporte

Para erros, sugestões ou bugs:
- Abra uma issue em `/GITHUB/issues` com tag `[sacopex-webapp]`
- Descreva: engine, input, output esperado vs. obtido

---

**Última atualização:** 2026-09-14  
**Versão:** 1.0.0 (Cascade + Repurposing)
