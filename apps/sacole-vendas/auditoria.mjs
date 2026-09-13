import { chromium } from 'playwright'

const lin = c => { c/=255; return c<=0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4 }
const lum = ([r,g,b]) => 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b)
const razao = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05) }
const rgb = s => s.match(/\d+(\.\d+)?/g).slice(0,3).map(Number)

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })

for (const tema of ['claro','escuro']) {
  const p = await b.newPage({ viewport:{width:375,height:812} })
  await p.goto('http://localhost:4173/', { waitUntil:'networkidle' })
  await p.evaluate(t => { document.documentElement.dataset.tema = t }, tema)

  // contraste de todo texto visível contra o fundo pintado atrás dele
  const falhas = await p.evaluate(() => {
    const fundoDe = el => {
      for (let n = el; n; n = n.parentElement) {
        const c = getComputedStyle(n).backgroundColor
        if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c
      }
      return getComputedStyle(document.body).backgroundColor
    }
    const out = []
    for (const el of document.querySelectorAll('body *')) {
      const texto = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())
      if (!texto) continue
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) continue
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.opacity === '0') continue
      out.push({ tag: el.tagName+'.'+(el.className||''), cor: cs.color, fundo: fundoDe(el),
                 px: parseFloat(cs.fontSize), peso: cs.fontWeight })
    }
    return out
  })
  const ruins = falhas.map(f => ({...f, r: razao(rgb(f.cor), rgb(f.fundo))}))
                      .filter(f => f.r < 4.5)
  console.log(`[${tema}] elementos com texto: ${falhas.length} | abaixo de 4.5:1: ${ruins.length}`)
  ruins.forEach(f => console.log('   ', f.r.toFixed(2), f.tag, f.cor, 'sobre', f.fundo))

  // alvos de toque
  const pequenos = await p.evaluate(() =>
    [...document.querySelectorAll('a,button')].filter(el => {
      const r = el.getBoundingClientRect()
      return r.width && r.height && (r.height < 44 || r.width < 44) && !el.closest('.nav-desktop')
    }).map(el => `${el.tagName}.${el.className} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`))
  console.log(`[${tema}] alvos de toque < 44px: ${pequenos.length}`, pequenos)
  await p.close()
}

// teclado: menu abre, navega e fecha no Esc
const p = await b.newPage({ viewport:{width:375,height:812} })
await p.goto('http://localhost:4173/', { waitUntil:'networkidle' })
await p.click('#botao-menu')
console.log('menu aberto:', await p.getAttribute('#botao-menu','aria-expanded'),
            '| foco em:', await p.evaluate(()=>document.activeElement.textContent.trim()))
await p.keyboard.press('Tab')
console.log('após Tab, foco em:', await p.evaluate(()=>document.activeElement.textContent.trim()))
await p.keyboard.press('Escape')
console.log('após Esc — expanded:', await p.getAttribute('#botao-menu','aria-expanded'),
            '| hidden:', await p.getAttribute('#nav-mobile','hidden'),
            '| foco de volta no botão:', await p.evaluate(()=>document.activeElement.id))

// estrutura
console.log(await p.evaluate(() => ({
  h1: document.querySelectorAll('h1').length,
  landmarks: ['header','nav','main','footer'].map(t=>`${t}:${document.querySelectorAll(t).length}`).join(' '),
  imgSemAlt: [...document.images].filter(i=>!i.alt).length,
  canvasFocavel: [...document.querySelectorAll('canvas')].filter(c=>c.tabIndex>=0).length,
})))
// larguras: nenhuma rolagem horizontal
for (const w of [320,375,768,1280,1600]) {
  const pg = await b.newPage({ viewport:{width:w,height:900} })
  const erros = []
  pg.on('pageerror', e => erros.push(String(e)))
  await pg.goto('http://localhost:4173/', { waitUntil:'networkidle' })
  const excesso = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  console.log(`${String(w).padStart(4)}px  excesso horizontal: ${excesso}px  erros: ${erros.length}`)
  await pg.close()
}

// prefers-reduced-motion desliga a cena 3D
const pr = await b.newPage({ viewport:{width:375,height:812}, reducedMotion:'reduce' })
await pr.goto('http://localhost:4173/', { waitUntil:'networkidle' })
await pr.waitForTimeout(2500)
console.log('reduced-motion — canvas WebGL montado:', await pr.locator('canvas').count())
await pr.close()

await b.close()
