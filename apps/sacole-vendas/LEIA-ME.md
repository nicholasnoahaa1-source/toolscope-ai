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
4. **Modelo** — o sacolé é gerado por código em `src/cena.js`. Para trocar pelo
   `.glb`, substituir `construirSacole()` por um GLTFLoader mantendo os meshes
   com os nomes `saquinho`, `creme` e `pedacos`.

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

## 3D

- `MeshPhysicalMaterial` com `transmission`/`thickness`/`ior` 1.45 no saquinho;
  creme como geometria própria; pedaços em `InstancedMesh`.
- Câmera dirigida pelo scroll com lerp, nunca presa ao evento.
- Arrastar gira, soltar volta à pose de repouso com inércia; `touch-action: pan-y`
  mantém o scroll vertical do celular.
- Sabor troca a cor do creme e dos pedaços com transição animada.
- Cai para os frames quando: sem WebGL2, `prefers-reduced-motion`, ou menos de
  30fps por mais de 2s. A cena carrega em `requestIdleCallback`, depois da
  primeira dobra, em chunk separado.
