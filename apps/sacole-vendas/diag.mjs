import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
const args = ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' , args})
const p = await b.newPage({ viewport:{width:900,height:900} })
await p.goto('http://localhost:5173/', { waitUntil:'networkidle' })
await p.waitForTimeout(1000)
const info = await p.evaluate(() => {
  const { renderer, sacole } = globalThis.__cena
  const gl = renderer.getContext()
  const m = sacole.saquinho.material
  return { float: !!gl.getExtension('EXT_color_buffer_float'),
           transmission: m.transmission, opacity: m.opacity,
           cremeCor: '#'+sacole.creme.material.color.getHexString(),
           pedacosCor: '#'+sacole.pedacos.material.color.getHexString(),
           pedacosVisiveis: sacole.pedacos.visible, contagem: sacole.pedacos.count }
})
console.log(info)
for (const [saq, nome] of [[true,'com-saquinho'],[false,'sem-saquinho']]) {
  const d = await p.evaluate((mostrar) => {
    const { renderer, cena, camera, sacole } = globalThis.__cena
    sacole.saquinho.visible = mostrar
    renderer.render(cena, camera)
    const gl = renderer.getContext()
    const W = gl.drawingBufferWidth, H = gl.drawingBufferHeight
    const px = new Uint8Array(W*H*4); gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px)
    let s=''; for (let i=0;i<px.length;i+=8192) s+=String.fromCharCode.apply(null,px.subarray(i,i+8192))
    return { W,H,b64: btoa(s) }
  }, saq)
  writeFileSync(`/tmp/${nome}.json`, JSON.stringify({W:d.W,H:d.H}))
  writeFileSync(`/tmp/${nome}.b64`, d.b64)
}
await b.close()
