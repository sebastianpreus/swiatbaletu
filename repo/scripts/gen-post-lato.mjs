/**
 * gen-post-lato.mjs
 * Grafika na post social (3:4 pion, 1200×1600) dla artykułu
 * "Dlaczego latem teatry milkną?" - ten sam styl co baner hero.
 * Wyjście: images/lato-teatry-post.jpg
 */
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const SRC = join(__dir, '..', '..', 'images', 'lato-teatry-cisza.jpg')
const OUT = join(__dir, '..', '..', 'images', 'lato-teatry-post.jpg')

const W = 1200
const H = 1600

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.45" stop-color="#140e08" stop-opacity="0"/>
      <stop offset="0.75" stop-color="#140e08" stop-opacity="0.62"/>
      <stop offset="1" stop-color="#140e08" stop-opacity="0.94"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#shade)"/>

  <!-- złota linia + nadtytuł -->
  <rect x="76" y="1268" width="50" height="3" fill="#C9A84C"/>
  <text x="144" y="1278" font-family="Georgia, serif" font-size="26"
        letter-spacing="6" fill="#C9A84C" font-weight="bold">ŚWIAT BALETU</text>

  <!-- tytuł -->
  <text x="72" y="1382" font-family="Georgia, serif" font-size="86"
        fill="#FAF6EC">Dlaczego latem</text>
  <text x="72" y="1478" font-family="Georgia, serif" font-size="86"
        fill="#C9A84C">teatry milkną?</text>
</svg>
`

async function main() {
  const meta = await sharp(SRC).metadata()
  // Kadr 3:4 z pełnej wysokości zdjęcia (źródło 1600×2126 jest niemal 3:4)
  const cropW = Math.round(meta.height * (W / H)) // szerokość przy pełnej wysokości
  const left = Math.round((meta.width - cropW) / 2)

  await sharp(SRC)
    .extract({ left, top: 0, width: cropW, height: meta.height })
    .resize(W, H)
    .modulate({ brightness: 0.94, saturation: 0.96 })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 88 })
    .toFile(OUT)

  const out = await sharp(OUT).metadata()
  console.log(`✓ Zapisano: ${OUT} (${out.width}×${out.height})`)
}

main().catch((e) => { console.error('Błąd:', e.message); process.exit(1) })
