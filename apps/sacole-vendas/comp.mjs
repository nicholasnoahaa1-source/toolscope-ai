import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
const args = ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args })
const OUT = '/tmp/claude-0/-home-user-toolscope-ai/7bdc680f-68af-5335-bd50-2c66c4124003/scratchpad'

for (const [w,h,nome,sabor] of [[1440,900,'pagina-1440',2],[375,812,'pagina-375',1]]) {
  const p = await b.newPage({ viewport:{width:w,height:h} })
  await p.goto('http://localhost:5173/', { waitUntil:'networkidle' })
  await p.waitForTimeout(900)
  // clique programático: o clique do Playwright rola a página até o elemento
  await p.evaluate((i) => document.querySelectorAll('.sabor')[i].click(), sabor)
  await p.waitForTimeout(700)
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await p.waitForTimeout(400)

  const dados = await p.evaluate(() => {
    const { renderer, cena, camera } = globalThis.__cena
    renderer.render(cena, camera)
    const gl = renderer.getContext()
    const W = gl.drawingBufferWidth, H = gl.drawingBufferHeight
    const px = new Uint8Array(W*H*4)
    gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px)
    const r = document.getElementById('palco-3d').getBoundingClientRect()
    return { W, H, x: Math.round(r.x), y: Math.round(r.y),
             b64: (() => {                 // em blocos: spread de 1,7 M bytes estoura a pilha
               let s = ''
               for (let i = 0; i < px.length; i += 8192)
                 s += String.fromCharCode.apply(null, px.subarray(i, i + 8192))
               return btoa(s)
             })() }
  })
  writeFileSync(`${OUT}/${nome}.rgba.json`, JSON.stringify({W:dados.W,H:dados.H,x:dados.x,y:dados.y}))
  writeFileSync(`${OUT}/${nome}.rgba.b64`, dados.b64)
  await p.screenshot({ path: `${OUT}/${nome}.base.png` })
  await p.close()
}
await b.close()
