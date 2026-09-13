import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const p = await b.newPage({ viewport:{width:375,height:812}, reducedMotion:'reduce', deviceScaleFactor:2 })
await p.goto('http://localhost:4173/', { waitUntil:'networkidle' })
await p.waitForTimeout(2000)
const img = p.locator('#palco-3d img')
console.log('imagem estática no palco:', await img.count(),
            '| src:', await img.getAttribute('src'),
            '| alt:', (await img.getAttribute('alt'))?.slice(0,60) + '…')
await p.screenshot({ path:'/tmp/claude-0/-home-user-toolscope-ai/7bdc680f-68af-5335-bd50-2c66c4124003/scratchpad/reduced-375.png' })
await b.close()
