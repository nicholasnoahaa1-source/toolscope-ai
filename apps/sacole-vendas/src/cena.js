/**
 * Cena 3D do sacolé — Three.js / WebGL2.
 *
 * O modelo é gerado por código (cilindro alongado, base selada, topo torcido),
 * o que deixa a troca de sabor ser só um parâmetro de material. Quando houver
 * um .glb do produto, troque `construirSacole()` por um GLTFLoader e mantenha
 * os nomes `saquinho`, `creme` e `pedacos` nos meshes — o resto do arquivo
 * continua valendo.
 */
import * as THREE from 'three'

const TAU = Math.PI * 2

/** Perfil de revolução do sacolé: [raio, altura] do fundo selado ao topo torcido. */
function perfilSacole(segmentos = 64) {
  const pontos = []
  for (let i = 0; i <= segmentos; i++) {
    const t = i / segmentos
    // base arredondada -> corpo reto -> estrangulamento no topo
    let raio
    if (t < 0.06) raio = Math.sin((t / 0.06) * (Math.PI / 2)) * 0.5
    else if (t < 0.82) raio = 0.5 + Math.sin(t * Math.PI * 2) * 0.012
    else raio = 0.5 * (1 - Math.pow((t - 0.82) / 0.18, 1.4) * 0.93)
    pontos.push(new THREE.Vector2(Math.max(raio, 0.02), t * 2.6 - 1.3))
  }
  return pontos
}

function construirSacole(cores) {
  const grupo = new THREE.Group()

  const saquinho = new THREE.Mesh(
    new THREE.LatheGeometry(perfilSacole(), 96),
    new THREE.MeshPhysicalMaterial({
      transmission: 0.94,
      thickness: 0.45,
      roughness: 0.16,
      ior: 1.45,
      metalness: 0,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25,
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
    })
  )
  saquinho.name = 'saquinho'
  saquinho.renderOrder = 2

  const creme = new THREE.Mesh(
    new THREE.LatheGeometry(perfilSacole().map((p) => new THREE.Vector2(p.x * 0.93, p.y * 0.985)), 72),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(cores.creme), roughness: 0.85, metalness: 0 })
  )
  creme.name = 'creme'
  creme.renderOrder = 1

  // Pedaços de biscoito/fruta suspensos no creme, distribuídos dentro do volume.
  const N = 90
  const pedacos = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.07, 0.03, 0.06),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(cores.pedacos), roughness: 0.95 }),
    N
  )
  pedacos.name = 'pedacos'
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const e = new THREE.Euler()
  const pos = new THREE.Vector3()
  const um = new THREE.Vector3(1, 1, 1)
  for (let i = 0; i < N; i++) {
    const y = -1.22 + Math.random() * 2.3
    const limite = 0.43 * (y > 1.0 ? Math.max(0.08, 1 - (y - 1.0) / 0.35) : 1)
    const r = Math.sqrt(Math.random()) * limite
    const a = Math.random() * TAU
    pos.set(Math.cos(a) * r, y, Math.sin(a) * r)
    e.set(Math.random() * TAU, Math.random() * TAU, Math.random() * TAU)
    m.compose(pos, q.setFromEuler(e), um)
    pedacos.setMatrixAt(i, m)
  }
  pedacos.instanceMatrix.needsUpdate = true
  pedacos.renderOrder = 1

  grupo.add(creme, pedacos, saquinho)
  return { grupo, saquinho, creme, pedacos }
}

function luzEstudio(cena) {
  // Sem HDRI externo: um ambiente de estúdio gerado por código, para o brilho
  // do plástico sem download extra.
  cena.add(new THREE.HemisphereLight(0xffffff, 0x8a6a4a, 1.1))

  const principal = new THREE.DirectionalLight(0xfff4e2, 2.4)
  principal.position.set(2.6, 4, 2.4)
  principal.castShadow = true
  principal.shadow.mapSize.set(1024, 1024)
  principal.shadow.camera.near = 0.5
  principal.shadow.camera.far = 14
  principal.shadow.bias = -0.0015
  cena.add(principal)

  const contorno = new THREE.DirectionalLight(0xbfd8ff, 1.6)
  contorno.position.set(-3, 1.6, -3)
  cena.add(contorno)
}

function chaoMarmore() {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const g = c.getContext('2d')
  g.fillStyle = '#efe9e0'
  g.fillRect(0, 0, 512, 512)
  g.strokeStyle = 'rgba(120,125,135,0.22)'
  for (let i = 0; i < 26; i++) {
    g.lineWidth = Math.random() * 1.8 + 0.2
    g.beginPath()
    let x = Math.random() * 512
    let y = Math.random() * 512
    g.moveTo(x, y)
    for (let j = 0; j < 8; j++) {
      x += (Math.random() - 0.5) * 120
      y += (Math.random() - 0.5) * 120
      g.lineTo(x, y)
    }
    g.stroke()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 3)

  const chao = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0 })
  )
  chao.rotation.x = -Math.PI / 2
  chao.position.y = -1.34
  chao.receiveShadow = true
  return chao
}

export function suportaWebGL2() {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

/**
 * Monta a cena num container.
 * @returns {{trocarSabor(cor:{creme:string,pedacos:string,pedacosVisiveis:boolean}):void, destruir():void}}
 */
export function montarCena(container, { saborInicial, aoDegradar }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  container.appendChild(renderer.domElement)
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.setAttribute('tabindex', '-1')   // o canvas não prende o foco

  const cena = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)

  luzEstudio(cena)
  cena.add(chaoMarmore())

  const sacole = construirSacole(saborInicial)
  sacole.grupo.traverse((o) => { o.castShadow = true })
  cena.add(sacole.grupo)

  // ---- estado de animação ----
  const alvo = { giro: 0, distancia: 6.4, altura: 1.1, foco: 0 }
  const atual = { giro: 0, distancia: 6.4, altura: 1.1 }
  let inercia = 0
  let arrastando = false
  let xInicial = 0
  let giroInicial = 0

  const lerp = (a, b, t) => a + (b - a) * t

  function redimensionar() {
    const { clientWidth: w, clientHeight: h } = container
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(redimensionar)
  ro.observe(container)
  redimensionar()

  // ---- câmera dirigida pelo scroll (nunca travada frame a frame) ----
  function lerScroll() {
    const r = container.getBoundingClientRect()
    const percorrido = (innerHeight - r.top) / (innerHeight + r.height)
    alvo.foco = Math.min(Math.max(percorrido, 0), 1)
  }
  addEventListener('scroll', lerScroll, { passive: true })
  lerScroll()

  // ---- arrastar gira; soltar volta à pose de repouso com inércia ----
  const aoDescer = (e) => {
    arrastando = true
    xInicial = e.clientX
    giroInicial = alvo.giro
    renderer.domElement.setPointerCapture(e.pointerId)
  }
  const aoMover = (e) => {
    if (!arrastando) return
    const d = (e.clientX - xInicial) / container.clientWidth
    const anterior = alvo.giro
    alvo.giro = giroInicial + d * TAU
    inercia = alvo.giro - anterior
  }
  const aoSoltar = () => { arrastando = false }
  renderer.domElement.addEventListener('pointerdown', aoDescer)
  renderer.domElement.addEventListener('pointermove', aoMover)
  renderer.domElement.addEventListener('pointerup', aoSoltar)
  renderer.domElement.addEventListener('pointercancel', aoSoltar)
  // touch-action: pan-y no CSS garante que o gesto vertical continue rolando a página.

  // ---- transição de sabor ----
  let transicao = null
  function trocarSabor(cor) {
    transicao = {
      de: { creme: sacole.creme.material.color.clone(), pedacos: sacole.pedacos.material.color.clone() },
      para: { creme: new THREE.Color(cor.creme), pedacos: new THREE.Color(cor.pedacos) },
      t: 0,
    }
    sacole.pedacos.visible = cor.pedacosVisiveis !== false
  }

  // ---- laço + vigia de desempenho ----
  let ativo = true
  let quadros = 0
  let janela = performance.now()
  let lentoDesde = 0
  let anterior = performance.now()

  function laco(agora) {
    if (!ativo) return
    requestAnimationFrame(laco)
    const dt = Math.min((agora - anterior) / 1000, 0.05)
    anterior = agora

    if (!arrastando) {
      inercia *= 0.94
      alvo.giro += inercia
      // volta suave à pose de repouso
      const repouso = Math.round(alvo.giro / TAU) * TAU
      alvo.giro = lerp(alvo.giro, repouso, 0.02)
    }
    alvo.giro += dt * 0.12   // rotação lenta de vitrine

    // o scroll fecha a câmera no detalhe do recheio
    alvo.distancia = lerp(6.4, 3.1, alvo.foco)
    alvo.altura = lerp(1.1, 0.1, alvo.foco)

    atual.giro = lerp(atual.giro, alvo.giro, 0.12)
    atual.distancia = lerp(atual.distancia, alvo.distancia, 0.06)
    atual.altura = lerp(atual.altura, alvo.altura, 0.06)

    sacole.grupo.rotation.y = atual.giro
    camera.position.set(0, atual.altura, atual.distancia)
    camera.lookAt(0, lerp(0, 0.35, alvo.foco), 0)

    if (transicao) {
      transicao.t = Math.min(transicao.t + dt * 1.6, 1)
      const e = transicao.t * transicao.t * (3 - 2 * transicao.t)
      sacole.creme.material.color.copy(transicao.de.creme).lerp(transicao.para.creme, e)
      sacole.pedacos.material.color.copy(transicao.de.pedacos).lerp(transicao.para.pedacos, e)
      if (transicao.t === 1) transicao = null
    }

    renderer.render(cena, camera)

    quadros++
    if (agora - janela >= 1000) {
      const fps = (quadros * 1000) / (agora - janela)
      quadros = 0
      janela = agora
      if (fps < 30) {
        if (!lentoDesde) lentoDesde = agora
        else if (agora - lentoDesde > 2000) aoDegradar?.('fps')
      } else {
        lentoDesde = 0
      }
    }
  }
  requestAnimationFrame(laco)

  // pausa quando o herói sai da tela — não gasta bateria à toa
  const io = new IntersectionObserver(([entrada]) => {
    if (entrada.isIntersecting && !ativo) { ativo = true; anterior = performance.now(); requestAnimationFrame(laco) }
    else if (!entrada.isIntersecting) ativo = false
  })
  io.observe(container)

  function destruir() {
    ativo = false
    io.disconnect()
    ro.disconnect()
    removeEventListener('scroll', lerScroll)
    cena.traverse((o) => {
      o.geometry?.dispose?.()
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose())
      else o.material?.dispose?.()
    })
    renderer.dispose()
    renderer.domElement.remove()
  }

  trocarSabor(saborInicial)
  return { trocarSabor, destruir }
}
