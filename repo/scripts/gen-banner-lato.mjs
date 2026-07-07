/**
 * gen-banner-lato.mjs
 * Generuje baner artykułu "Dlaczego latem teatry milkną?":
 * - kadruje pionowe zdjęcie foteli (1600×2126) do 16:9 (1600×900)
 * - nakłada ciemny gradient + tytuł (biały/złoty serif, styl banera Karoliny)
 * Wyjście: images/lato-teatry-banner.jpg
 */
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const SRC = join(__dir, '..', '..', 'images', 'lato-teatry-cisza.jpg')
const OUT = join(__dir, '..', '..', 'images', 'lato-teatry-banner.jpg')

const W = 1600
const H = 900

// Overlay SVG: gradient od dołu + typografia
const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.35" stop-color="#140e08" stop-opacity="0"/>
      <stop offset="0.72" stop-color="#140e08" stop-opacity="0.62"/>
      <stop offset="1" stop-color="#140e08" stop-opacity="0.93"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#shade)"/>

  <!-- złota linia + nadtytuł -->
  <rect x="92" y="632" width="54" height="3" fill="#C9A84C"/>
  <text x="166" y="642" font-family="Georgia, serif" font-size="27"
        letter-spacing="7" fill="#C9A84C" font-weight="bold">ŚWIAT BALETU</text>

  <!-- tytuł -->
  <text x="88" y="748" font-family="Georgia, serif" font-size="97"
        fill="#FAF6EC">Dlaczego latem</text>
  <text x="88" y="852" font-family="Georgia, serif" font-size="97"
        fill="#C9A84C">teatry milkną?</text>
</svg>
`

async function main() {
  const meta = await sharp(SRC).metadata()
  console.log(`Źródło: ${meta.width}×${meta.height}`)

  // Kadr 16:9 — pas z górnej połowy zdjęcia (rzędy foteli w perspektywie)
  const cropH = Math.round((meta.width * H) / W) // 900 przy szer. 1600
  const top = Math.round(meta.height * 0.18)     // lekko nad środkiem

  await sharp(SRC)
    .extract({ left: 0, top, width: meta.width, height: cropH })
    .resize(W, H)
    .modulate({ brightness: 0.94, saturation: 0.96 }) // delikatnie przygaś pod tekst
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 88 })
    .toFile(OUT)

  const out = await sharp(OUT).metadata()
  console.log(`✓ Zapisano: ${OUT} (${out.width}×${out.height})`)
}

main().catch((e) => { console.error('Błąd:', e.message); process.exit(1) })
