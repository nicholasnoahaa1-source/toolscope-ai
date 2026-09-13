import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' })
const S='/tmp/claude-0/-home-user-toolscope-ai/7bdc680f-68af-5335-bd50-2c66c4124003/scratchpad'
for (const [w,h,nome] of [[1440,900,'frames-1440'],[375,812,'frames-375']]) {
  const p = await b.newPage({ viewport:{width:w,height:h}, deviceScaleFactor:2 })
  await p.goto('http://localhost:4173/', { waitUntil:'networkidle' })
  await p.waitForFunction(() => document.getElementById('palco').dataset.estado === 'quadros', {timeout:20000})
  await p.waitForTimeout(1200)
  await p.screenshot({ path:`${S}/${nome}.png` })
  await p.close()
}
await b.close()
