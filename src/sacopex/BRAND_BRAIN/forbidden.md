# Forbidden List — SacoPex

Isto é executado via regex nas verificações de QC. Nenhuma dessas palavras/conceitos pode aparecer em copy, visual ou comunicação sem revisão escrita de um gerente de marca.

---

## Palavras Proibidas (detectadas automaticamente)

### Health Claims (✗ Absolutamente proibido)
```regex
\b(emagrece|cura|trata|saudável|sem açúcar|diet[aá]tico|zero cal|caloria negativa|boost energético|antioxidante|probiótico)\b
```

**Por quê:** Sacolé não é alimento funcional. Claims de saúde exigem registro ANVISA. Sem isso, qualquer claim é ilegal.

**Exceção documentada:** Nenhuma. Se for relevante, revisar com legal.

---

### Gírias Forçadas (✗ Fora do tom)
```regex
\b(mano|véi|tipo assim|slk|mizeravi|c[e]?mon|top d[e+]|bora|vamo|demais|brabo|foda)\b
```

**Por quê:** Desconexão com a personalidade sofisticada-jovem. Parecem forçadas, não authenticamente jovem.

**Exceção documentada:** Se um teste A/B específico pedir para quebrar o tom, documentar por quê.

---

### Comparação com Concorrentes (✗ Ilegal e feio)
```regex
\b(concorrente|marca X|diferente de|melhor que|ao contrário de|não é como)\b
```

**Por quê:** Comparação direta é ilegal em publicidade brasileira. Negatividade foge do tom.

**Exceção documentada:** Nenhuma. Falar bem de SacoPex, não mal de outros.

---

### Promessas Fausas (✗ Enganoso)
```regex
\b(revolucion[aá]rio|transforma[rá]|muda vidas|melhor do mundo|única opção|salvação|milagre)\b
```

**Por quê:** Sacolé é sacolé. Não muda vidas. Exagero cria expectativa irreal.

**Exceção documentada:** Em tom irônico/brincalhão, se ficar claro que é brinquedo.

---

## Conceitos Proibidos (não são regex, mas são regra)

### Visual
- ✗ Logo gráfico ou símbolo da marca
- ✗ Ícones customizados (sorvete, paleta, etc.)
- ✗ Cores fora da paleta locked (Creme, Navy, Navy Tartaruga, Laranja Pastel)
- ✗ Tipografia diferente de Manrope ou Tiempos Text Italic
- ✗ Efeitos gráficos (glow, blur, glitch, pixelização)
- ✗ Padrões geométricos (stripes, dots, xadrez)
- ✗ Emojis como elemento central (são ok como affordance em stories, nunca como design)

### Copy
- ✗ Corporativismo ("com orgulho apresentamos", "sinergicamente integrado")
- ✗ Bregueíce ("Ó nos!", "geladia", "meu chapa")
- ✗ Nostalgia melancólica ("saudade daquele tempo", "antes era melhor")
- ✗ Posicionamento elitista ("para os poucos", "classe A", "exclusivo")
- ✗ Apelo à culpa ("você merece", "se cuide", "porque você sofre")

### Estratégia
- ✗ Segmentar por classe/renda (não é produto de luxo, não é produto de pobreza, é sofisticado-acessível)
- ✗ Gendered marketing forçado ("para mulheres", "para homens")
- ✗ Ageism (não "idosos merecedores de rejuvenescimento", não "crianças inocentes")

---

## QC Gate (automático)

A cada geração de content pack, o engine verifica:

1. **Health Claims** — Match contra regex
2. **Gírias Forçadas** — Match contra regex
3. **Comparação com Concorrentes** — Match contra regex
4. **Promessas Falsas** — Match contra regex
5. **Paleta restrita** — 4 cores apenas
6. **Tipografia locked** — Manrope ou Tiempos Text Italic
7. **Tom apropriado** — Revisor humano (por enquanto)

**Score mínimo de aprovação:** 80/100

Se qualquer item falhar, o sistema:
- Marca como "Revisar"
- Aponta qual regra foi quebrada
- Sugere revisão antes de publicar

---

## Exceções (raro, documentado)

Se você precisa quebrar uma regra, siga este protocolo:

1. **Registre a exceção** em um arquivo `/EXCEPTIONS/{data}-{razao}.md`
2. **Justifique por escrito** (por quê é importante quebrar a regra neste caso)
3. **Informe** o gerente de marca
4. **Revise com legal** (se for health claim ou comparação)
5. **Documente o resultado** (o que aprendemos)

Exemplo:
```
/EXCEPTIONS/2024-01-15-slang-test.md

Razão: Teste A/B com gírias para público Gen Z
Palavra: "slk"
Contexto: Reel em TikTok, 18–22 anos
Resultado: [a ser preenchido após teste]
Aprobado por: [gerente de marca]
```

Sem isto, a regra sempre vence.
