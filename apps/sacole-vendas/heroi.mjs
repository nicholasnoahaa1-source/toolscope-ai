import { chromium } from 'playwright'
const args = ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args })

// contraste da linha selecionada com o mouse em cima
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })
await p.goto('http://localhost:4173/', { waitUntil:'networkidle' })
const sel = p.locator('.sabor').first()
await sel.hover()
console.log('linha selecionada + hover →', await sel.locator('.sabor__nome').evaluate(el => {
  const cs = getComputedStyle(el)
  return `cor ${cs.color} sobre ${getComputedStyle(el.closest('.sabor')).backgroundColor}`
}))
await p.close()

for (const [w,h,n] of [[1440,900,'heroi-1440'],[375,812,'heroi-375']]) {
  const pg = await b.newPage({ viewport:{width:w,height:h}, deviceScaleFactor:2 })
  await pg.goto('http://localhost:4173/', { waitUntil:'networkidle' })
  await pg.waitForTimeout(2300)   // dentro do aquecimento, com o 3D vivo
  console.log(n, 'canvas:', await pg.locator('#palco-3d canvas').count())
  await pg.screenshot({ path:`/tmp/claude-0/-home-user-toolscope-ai/7bdc680f-68af-5335-bd50-2c66c4124003/scratchpad/${n}.png` })
  await pg.close()
}
await b.close()
