/**
 * set-lato-featured-banner.mjs
 * Artykuł "Dlaczego latem teatry milkną?":
 * - wgrywa baner z tytułem jako zdjecie (miniaturka/hero/og:image)
 * - dotychczasowe pionowe zdjęcie foteli → zdjecieArtykul (okładka w treści)
 * - featured: true → artykuł staje się hero na stronie głównej
 *   (hero wybiera najnowszy featured; data publikacji nowsza niż wywiad Karoliny)
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const SLUG = 'dlaczego-latem-teatry-milkna'
const BANNER = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'images', 'lato-teatry-banner.jpg')

const __dir = dirname(fileURLToPath(import.meta.url))
const env = {}
readFileSync(join(__dir, '..', '.env.local'), 'utf8').split('\n').forEach((l) => {
  const m = l.match(/^([^#=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim()
})
const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: env.SANITY_API_TOKEN,
  useCdn: false,
})

async function main() {
  const a = await client.fetch(
    '*[_type=="artykul" && slug.current==$slug][0]{ _id, "zdjecieRef": zdjecie.asset._ref }',
    { slug: SLUG }
  )
  if (!a?._id) { console.error('✗ Brak artykułu'); process.exit(1) }
  console.log('Artykuł:', a._id, '| obecne zdjecie:', a.zdjecieRef)

  console.log('Wgrywam baner...')
  const banner = await client.assets.upload('image', readFileSync(BANNER), { filename: 'lato-teatry-banner.jpg' })
  console.log('  ✓ Baner asset:', banner._id)

  await client.patch(a._id).set({
    featured: true,
    zdjecie: {
      _type: 'image',
      asset: { _type: 'reference', _ref: banner._id },
      alt: 'Dlaczego latem teatry milkną? - puste fotele teatralnej widowni',
    },
    zdjecieArtykul: {
      _type: 'image',
      asset: { _type: 'reference', _ref: a.zdjecieRef },
      alt: 'Puste fotele w teatralnej widowni',
    },
  }).commit()

  console.log('✅ featured: true, baner jako zdjęcie główne, fotele jako okładka artykułu.')
}

main().catch((e) => { console.error('Błąd:', e.message); process.exit(1) })
