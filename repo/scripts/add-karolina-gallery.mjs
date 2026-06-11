/**
 * add-karolina-gallery.mjs
 * Wgrywa zdjęcia z images/karolina/ i dodaje blok galerii (lightbox)
 * na końcu artykułu-wywiadu z Karoliną Urbaniak.
 *
 * Idempotentny: przy ponownym uruchomieniu usuwa starą galerię + nagłówek
 * "Galeria" i wstawia świeżą wersję (bez duplikatów).
 *
 * Uruchom: node scripts/add-karolina-gallery.mjs
 */
import { createClient } from '@sanity/client'
import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const SLUG = 'karolina-urbaniak'
const GALLERY_DIR = 'karolina' // podfolder w images/

const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '..', '.env.local')
const env = {}
readFileSync(envPath, 'utf8').split('\n').forEach((l) => {
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

const key = () => Math.random().toString(36).slice(2, 10)

function h2(text) {
  return {
    _type: 'block', _key: key(), style: 'h2',
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
    markDefs: [],
  }
}

async function main() {
  // 1. Pobierz artykuł
  const article = await client.fetch(
    '*[_type=="artykul" && slug.current==$slug][0]{ _id, trescGlowna }',
    { slug: SLUG }
  )
  if (!article?._id) {
    console.error('✗ Nie znaleziono artykułu o slug:', SLUG)
    process.exit(1)
  }
  console.log('Artykuł ID:', article._id)

  // 2. Zbierz pliki z images/karolina/ (sortowanie numeryczne 1,2,...,12)
  const dirPath = join(__dir, '..', '..', 'images', GALLERY_DIR)
  const files = readdirSync(dirPath)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0))
  console.log(`Znaleziono ${files.length} zdjęć:`, files.join(', '))

  // 3. Wgraj każde zdjęcie
  const imageObjs = []
  for (const f of files) {
    const buf = readFileSync(join(dirPath, f))
    const asset = await client.assets.upload('image', buf, { filename: `karolina-${f}` })
    console.log(`  ✓ ${f} → ${asset._id}`)
    imageObjs.push({
      _type: 'image',
      _key: key(),
      asset: { _type: 'reference', _ref: asset._id },
      alt: 'Karolina Urbaniak na scenie',
    })
  }

  // 4. Zbuduj blok galerii
  const galleryBlock = { _type: 'gallery', _key: key(), images: imageObjs }
  const galleryHeading = h2('Galeria')

  // 5. Usuń starą galerię + nagłówek "Galeria" (idempotencja), potem dopisz nową
  const tresc = (article.trescGlowna || []).filter((b) => {
    if (b._type === 'gallery') return false
    if (b._type === 'block' && b.style === 'h2' && b.children?.[0]?.text?.trim() === 'Galeria') return false
    return true
  })
  const newTresc = [...tresc, galleryHeading, galleryBlock]

  // 6. Zapisz
  await client.patch(article._id).set({ trescGlowna: newTresc }).commit()
  console.log(`\n✅ Dodano galerię (${imageObjs.length} zdjęć). Adres: /artykuly/${SLUG}`)
}

main().catch((err) => {
  console.error('Błąd:', err.message)
  process.exit(1)
})
