import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' })
const S='/tmp/claude-0/-home-user-toolscope-ai/7bdc680f-68af-5335-bd50-2c66c4124003/scratchpad'
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })
await p.goto('http://localhost:4173/', { waitUntil:'networkidle' })
await p.mouse.move(1150, 380); await p.waitForTimeout(1000)
await p.screenshot({ path:`${S}/palco-final-1440.png` })
await p.close()
const m = await b.newPage({ viewport:{width:375,height:812}, deviceScaleFactor:2 })
await m.goto('http://localhost:4173/', { waitUntil:'networkidle' })
await m.waitForTimeout(1000)
await m.screenshot({ path:`${S}/palco-final-375.png` })
await b.close()
