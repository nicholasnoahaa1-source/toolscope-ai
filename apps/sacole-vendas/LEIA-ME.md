# sacolé — página de vendas 3D

Vite + Three.js + Motion, tudo servido localmente (sem CDN, sem Google Fonts).

## Rodar

    cd apps/sacole-vendas
    npm install
    npm run dev

## O que falta antes de publicar

1. **Dados reais** — `src/dados.js` começa todo `null` de propósito. Nada na
   página é inventado: enquanto um campo estiver vazio, ele aparece como
   pendência (em dev) ou some (em produção). Preencher marca, sabores, combos,
   WhatsApp, entrega, horário, pagamento e pedido mínimo.
2. **Fontes** — `public/fontes/TiemposText-Italic.ttf` (ou `.woff2`) e
   `public/fontes/Manrope-Variable.woff2`. Tiempos Text é paga (Klim Type
   Foundry): ok em uso local, confirmar licença antes de publicar.
3. **Fallback** — `public/frames/0001.webp` … `0145.webp` (720px) e
   `public/imagens/sacole-oreo-produto.png`. Sem eles o palco fica vazio e a
   página continua vendendo normalmente.
4. **Modelo** — o sacolé é gerado por código em `src/cena.js`. Existe um `.glb`
   gerado por IA a partir da foto do produto (Higgsfield, modelo `sam_3_3d`),
   mas ele é uma peça única texturizada: serviria de estátua, não permitiria
   trocar o creme e os pedaços por sabor, que é o que justifica ser 3D em vez
   de foto. Para usá-lo mesmo assim, baixe o arquivo em `public/modelo/` e
   troque `construirSacole()` por um GLTFLoader mantendo os nomes `saquinho`,
   `creme` e `pedacos`.

## Auditoria dos critérios de aceite

    npm run build && npx vite preview --port 4173 &
    node auditoria.mjs

Verifica contraste de todo texto contra o fundo realmente pintado atrás dele
nos dois temas, alvos de toque de 44px, o menu por teclado (abre, tabula, fecha
no Esc e devolve o foco), `h1` único, landmarks, `alt` em toda imagem, canvas
fora da ordem de foco, rolagem horizontal em 320/375/768/1280/1600px e o
desligamento do 3D com `prefers-reduced-motion`.

Fora do alcance deste script: os 60fps em celular intermediário — precisa de
aparelho real.

## Movimento

Não há WebGL. O herói é uma **sequência de quadros percorrida pelo scroll** —
rolar a página gira o sacolé. `src/palco.js` desenha o quadro atual num canvas;
o scroll e o ponteiro só escrevem valores-alvo e um laço único interpola até
eles, redesenhando só quando o índice muda.

A foto está na marcação e aparece de imediato; os quadros entram depois, em
`requestIdleCallback`, e só então o canvas assume. A primeira dobra nunca
espera pela sequência, e se ela falhar a foto continua valendo.

`prefers-reduced-motion` não baixa nenhum quadro: a foto fica parada e
centrada.

## Os quadros

`public/frames/` é **gerado**, não capturado — 36 quadros mais as versões de
meia resolução para celular, ~720 kB no total.

    python3 ferramentas/gerar-frames.py

O script mapeia um trecho limpo do corpo do sacolé na foto sobre um cilindro
resolvido analiticamente em numpy, com iluminação própria. A textura é do
produto real: o mesmo creme, os mesmos pedaços de biscoito.

Limite honesto: a foto tem a mão na frente e luz de fim de tarde, então o
trecho aproveitável é pequeno e precisa ser espelhado para fechar os 360° — a
simetria fica perceptível quando a peça para. **Um vídeo de 3 segundos girando
o sacolé na mão substitui esses quadros pelo produto de verdade** e fica muito
melhor; o resto do mecanismo não muda.

A foto e os quadros são do sabor Oreo. Trocar de sabor **não** os recolore:
seria inventar imagem de produto que não existe. Coco e maracujá precisam da
própria captura.
