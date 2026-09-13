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

Não há WebGL. O herói é a foto do produto encenada em 3D por transformações
CSS, em `src/palco.js`:

- Três camadas num mesmo espaço com `perspective` — fundo desfocado, placa com
  a foto, sombra de contato — separadas no eixo Z.
- O scroll e o ponteiro só escrevem valores-alvo; um laço único interpola até
  eles. Reagir direto no evento trava o movimento.
- A placa gira nos dois eixos, escala e sobe conforme o scroll; a sombra
  encolhe e clareia junto; uma varredura de luz atravessa a peça ao girar.
- Trocar de sabor dá um empurrão de rotação e um clarão curto na placa.
- `prefers-reduced-motion` desliga tudo: a foto fica parada e centrada, sem
  camadas nem brilho.

A foto é do sabor Oreo. Trocar de sabor **não** recolore a imagem — seria
inventar uma foto de produto que não existe. Para os outros sabores mostrarem
a própria imagem, é preciso fotografá-los.
