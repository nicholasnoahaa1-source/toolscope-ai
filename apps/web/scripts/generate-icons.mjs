#!/usr/bin/env node
/**
 * Gera todos os PNGs de ícone da PWA a partir dos SVGs mestre originais em
 * public/icons/. Reproduzível: mesmo SVG de entrada sempre produz o mesmo
 * conjunto de PNGs. Não baixa nada da rede.
 *
 * Uso: node scripts/generate-icons.mjs
 */
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(here, '..', 'public', 'icons')

const MASTER = join(iconsDir, 'icon-master.svg')
const MASTER_MASKABLE = join(iconsDir, 'icon-maskable-master.svg')

/** [nome do arquivo, tamanho em px, svg de origem] */
const TARGETS = [
  ['icon-192.png', 192, MASTER],
  ['icon-512.png', 512, MASTER],
  ['icon-maskable-192.png', 192, MASTER_MASKABLE],
  ['icon-maskable-512.png', 512, MASTER_MASKABLE],
  // iOS não suporta transparência/máscara própria de forma confiável;
  // usamos a variante maskable (fundo preenchendo todo o quadrado) achatada.
  ['apple-touch-icon.png', 180, MASTER_MASKABLE],
]

async function main() {
  await mkdir(iconsDir, { recursive: true })

  for (const [filename, size, source] of TARGETS) {
    const outPath = join(iconsDir, filename)
    await sharp(source, { density: 384 })
      .resize(size, size)
      .png()
      .toFile(outPath)
    console.log(`gerado: icons/${filename} (${size}x${size}) a partir de ${source.split('/').pop()}`)
  }

  console.log('Ícones gerados com sucesso.')
}

main().catch((error) => {
  console.error('Falha ao gerar ícones:', error)
  process.exitCode = 1
})
