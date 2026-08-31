/**
 * patch-androidy-dashes-captions.mjs
 * 1. Zamienia wszystkie – na - w treści artykułu Androidy (tytul, zajawka, trescGlowna)
 * 2. Usuwa podpisy pod zdjęciami w galerii
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
const fix = (s) => (s || '').replace(/–/g, '-').replace(/—/g, '-')

console.log('📥 Pobieranie artykułu...')
const article = await client.fetch(
  '*[_id == $id][0]{ tytul, zajawka, trescGlowna }',
  { id: ARTICLE_ID }
)

// --- 1. Napraw trescGlowna ---
const newTresc = article.trescGlowna.map(block => {
  if (block._type === 'block') {
    // Zamień myślniki we wszystkich spanach
    return {
      ...block,
      children: block.children.map(child =>
        child._type === 'span' ? { ...child, text: fix(child.text) } : child
      ),
    }
  }
  if (block._type === 'gallery') {
    // Usuń caption i alt z każdego zdjęcia
    return {
      ...block,
      images: block.images.map(img => {
        const { alt, caption, ...rest } = img
        return rest
      }),
    }
  }
  return block
})

const patch = {
  tytul: fix(article.tytul),
  zajawka: fix(article.zajawka),
  trescGlowna: newTresc,
}

console.log('\nPodgląd zmian:')
console.log('  tytul:  ', patch.tytul)
console.log('  zajawka:', patch.zajawka.slice(0, 80) + '...')

console.log('\n📤 Zapisywanie...')
const result = await client.patch(ARTICLE_ID).set(patch).commit()
console.log('✅ Gotowe:', result._id)
