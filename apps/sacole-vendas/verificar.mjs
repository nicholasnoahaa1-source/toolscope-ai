import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const [w,h,n] of [[375,812,'sacopex-375'],[1440,900,'sacopex-1440']]) {
  const p = await b.newPage({ viewport:{width:w,height:h}, deviceScaleFactor:2 })
  const erros=[]; p.on('pageerror',e=>erros.push(String(e)))
  await p.goto('http://localhost:4173/', { waitUntil:'networkidle' })
  await p.waitForTimeout(3000)   // deixa o 3D montar
  console.log(n, '| canvas 3D:', await p.locator('#palco-3d canvas').count(),
              '| erros:', erros,
              '| whats:', await p.getAttribute('#pedir-heroi','href'))
  await p.screenshot({ path:`/tmp/claude-0/-home-user-toolscope-ai/7bdc680f-68af-5335-bd50-2c66c4124003/scratchpad/${n}.png`, fullPage: w===375 })
  await p.close()
}
// troca de sabor
const p = await b.newPage({ viewport:{width:1440,height:900} })
await p.goto('http://localhost:4173/', { waitUntil:'networkidle' })
await p.waitForTimeout(2500)
const sabores = p.locator('.sabor')
console.log('sabores na página:', await sabores.count(), '| textos:', await sabores.allInnerTexts())
await sabores.nth(1).click()
await p.waitForTimeout(800)
console.log('após clicar Maracujá — barra:', await p.textContent('#barra-resumo'),
            '| link:', (await p.getAttribute('#pedir-barra','href'))?.slice(0,90))
console.log('seção combos removida:', await p.locator('#combos').count() === 0,
            '| link de combos na nav:', await p.locator('a[href="#combos"]').count())
await b.close()
