import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' })
const S='/tmp/claude-0/-home-user-toolscope-ai/7bdc680f-68af-5335-bd50-2c66c4124003/scratchpad'

const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:2 })
const erros=[]; p.on('pageerror',e=>erros.push(String(e)))
await p.goto('http://localhost:4173/', { waitUntil:'networkidle' })
await p.waitForTimeout(1200)
const ler = () => p.evaluate(() => ({
  placa: getComputedStyle(document.querySelector('.palco__placa')).transform.slice(0,60),
  sombra: +getComputedStyle(document.querySelector('.palco__sombra')).opacity.slice(0,5),
  varredura: getComputedStyle(document.querySelector('.palco__brilho')).getPropertyValue('--varredura'),
}))
console.log('topo   ', await ler())
await p.screenshot({ path:`${S}/palco-topo.png`, clip:{x:720,y:84,width:720,height:760} })

await p.mouse.move(1150, 400); await p.waitForTimeout(700)
console.log('ponteiro', await ler())
await p.screenshot({ path:`${S}/palco-tilt.png`, clip:{x:720,y:84,width:720,height:760} })

await p.evaluate(() => window.scrollTo({top: 420, behavior:'instant'}))
await p.waitForTimeout(1400)
console.log('rolado ', await ler())
await p.screenshot({ path:`${S}/palco-rolado.png`, clip:{x:720,y:0,width:720,height:760} })
console.log('erros:', erros)
await p.close()

const r = await b.newPage({ viewport:{width:375,height:812}, reducedMotion:'reduce' })
await r.goto('http://localhost:4173/', { waitUntil:'networkidle' })
await r.waitForTimeout(900)
console.log('reduced-motion — estado:', await r.getAttribute('#palco','data-estado'),
            '| transform:', await r.evaluate(()=>getComputedStyle(document.querySelector('.palco__placa')).transform))
await b.close()
