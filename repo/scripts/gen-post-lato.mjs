/**
 * gen-post-lato.mjs
 * Grafika na post social (4:3, 1600×1200) dla artykułu
 * "Dlaczego latem teatry milkną?" - ten sam styl co baner hero.
 * Wyjście: images/lato-teatry-post.jpg
 */
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const SRC = join(__dir, '..', '..', 'images', 'lato-teatry-cisza.jpg')
const OUT = join(__dir, '..', '..', 'images', 'lato-teatry-post.jpg')

const W = 1600
const H = 1200

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.40" stop-color="#140e08" stop-opacity="0"/>
      <stop offset="0.72" stop-color="#140e08" stop-opacity="0.62"/>
      <stop offset="1" stop-color="#140e08" stop-opacity="0.94"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#shade)"/>

  <!-- złota linia + nadtytuł -->
  <rect x="96" y="880" width="54" height="3" fill="#C9A84C"/>
  <text x="170" y="890" font-family="Georgia, serif" font-size="28"
        letter-spacing="7" fill="#C9A84C" font-weight="bold">ŚWIAT BALETU</text>

  <!-- tytuł -->
  <text x="92" y="1000" font-family="Georgia, serif" font-size="100"
        fill="#FAF6EC">Dlaczego latem</text>
  <text x="92" y="1108" font-family="Georgia, serif" font-size="100"
        fill="#C9A84C">teatry milkną?</text>
</svg>
`

async function main() {
  const meta = await sharp(SRC).metadata()
  const cropH = Math.round((meta.width * H) / W) // 1200 przy szer. 1600
  const top = Math.round(meta.height * 0.14)

  await sharp(SRC)
    .extract({ left: 0, top, width: meta.width, height: cropH })
    .resize(W, H)
    .modulate({ brightness: 0.94, saturation: 0.96 })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 88 })
    .toFile(OUT)

  const out = await sharp(OUT).metadata()
  console.log(`✓ Zapisano: ${OUT} (${out.width}×${out.height})`)
}

main().catch((e) => { console.error('Błąd:', e.message); process.exit(1) })
