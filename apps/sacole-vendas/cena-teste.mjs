import { chromium } from 'playwright'
const args = ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args })
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })
p.on('console', m => m.type()==='info' && console.log('[app]', m.text()))
await p.goto('http://localhost:4173/', { waitUntil:'networkidle' })
await p.waitForTimeout(2200)   // dentro do aquecimento: a cena está viva
console.log('canvas durante o aquecimento:', await p.locator('#palco-3d canvas').count())
await p.locator('.sabor').nth(2).click()   // Oreo
await p.waitForTimeout(900)
await p.screenshot({ path:'/tmp/claude-0/-home-user-toolscope-ai/7bdc680f-68af-5335-bd50-2c66c4124003/scratchpad/cena3d.png' })
await p.waitForTimeout(4000)               // software rendering: deve cair para o fallback
console.log('canvas depois:', await p.locator('#palco-3d canvas').count(),
            '| imagem de fallback:', await p.locator('#palco-3d img').count())
await b.close()
