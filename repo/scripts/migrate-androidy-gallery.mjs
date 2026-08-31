/**
 * migrate-androidy-gallery.mjs
 * Zamienia 10 osobnych bloków image w artykule Androidy na jeden blok gallery
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '..', '.env.local')
const env = {}
readFileSync(envPath, 'utf8').split('\n').forEach(l => {
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

const ARTICLE_ID = 'QQPI8EE9dTLPal9ynhGhjv'
const key = () => Math.random().toString(36).slice(2, 10)

console.log('📥 Pobieranie artykułu Androidy...')
const article = await client.fetch('*[_id == $id][0]{ trescGlowna }', { id: ARTICLE_ID })

const tresc = article.trescGlowna
console.log(`   Liczba bloków: ${tresc.length}`)

// Znajdź wszystkie bloki image i ich indeksy
const imageBlocks = tresc.filter(b => b._type === 'image')
console.log(`   Bloki image: ${imageBlocks.length}`)

// Zbuduj nową treść: zachowaj wszystko co nie jest _type: 'image'
// W miejsce pierwszego bloku image wstaw gallery, resztę image usuń
let galleryInserted = false
const newTresc = []

for (const block of tresc) {
  if (block._type === 'image') {
    if (!galleryInserted) {
      // Wstaw blok gallery ze wszystkimi zdjęciami
      newTresc.push({
        _type: 'gallery',
        _key: key(),
        images: imageBlocks.map(img => ({
          ...img,
          _key: key(),
          // Zachowaj asset reference, ustaw alt jako caption
          alt: img.alt || '',
          caption: img.alt || '',
        })),
      })
      galleryInserted = true
    }
    // Pomiń pozostałe bloki image (zostały przeniesione do gallery)
  } else {
    newTresc.push(block)
  }
}

console.log(`\n📝 Nowa struktura treści (${newTresc.length} bloków):`)
newTresc.forEach((b, i) => {
  const label = b._type === 'block'
    ? `block [${b.style}]: "${b.children?.[0]?.text?.slice(0, 40)}..."`
    : b._type === 'gallery'
    ? `gallery: ${b.images.length} zdjęć`
    : b._type
  console.log(`  ${i + 1}. ${label}`)
})

console.log('\n📤 Zapisywanie do Sanity...')
const result = await client
  .patch(ARTICLE_ID)
  .set({ trescGlowna: newTresc })
  .commit()

console.log(`\n✅ Migracja zakończona! ID: ${result._id}`)
console.log(`   URL: https://swiatbaletu.vercel.app/artykuly/androidy-neo-noir-w-operze-narodowej`)
