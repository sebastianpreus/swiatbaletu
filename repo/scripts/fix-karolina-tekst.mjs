/**
 * fix-karolina-tekst.mjs
 * Poprawki w wywiadzie z Karoliną Urbaniak (uwagi od rozmówczyni):
 *  1. Zajawka — marzenie nie zrodziło się "na widowni", tylko gdy sama
 *     wystąpiła w „Dziadku do orzechów" w Poznaniu jako mały aniołek.
 *  2. Pisownia: „Saszy" → „Sashy" (Sasha Waltz) w treści.
 *
 * Surgiczny patch — nie rusza galerii, zdjęć ani innych pól.
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

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

const NEW_ZAJAWKA =
  'Karolina Urbaniak — solistka baletu Teatru Wielkiego w Łodzi — opowiada o swojej drodze do zawodu: ' +
  'od dziecięcego marzenia, które narodziło się, gdy jako mały aniołek wystąpiła w „Dziadku do orzechów" ' +
  'w Poznaniu, przez jedną z najtrudniejszych szkół baletowych w Warszawie, aż po scenę w Łodzi, ' +
  'z którą związała się na ponad dekadę.'

async function main() {
  const a = await client.fetch(
    '*[_type=="artykul" && slug.current=="karolina-urbaniak"][0]{ _id, trescGlowna }'
  )
  if (!a?._id) { console.error('✗ Brak artykułu'); process.exit(1) }

  // Zamień "Saszy" → "Sashy" w każdym spanie tekstu (galeria i inne typy bez zmian)
  let replacements = 0
  const newTresc = (a.trescGlowna || []).map((block) => {
    if (!block.children) return block
    return {
      ...block,
      children: block.children.map((span) => {
        if (typeof span.text === 'string' && span.text.includes('Saszy')) {
          replacements++
          return { ...span, text: span.text.replaceAll('Saszy', 'Sashy') }
        }
        return span
      }),
    }
  })

  await client
    .patch(a._id)
    .set({ zajawka: NEW_ZAJAWKA, trescGlowna: newTresc })
    .commit()

  console.log(`✅ Poprawiono. Zajawka zaktualizowana, „Saszy"→„Sashy": ${replacements} wystąpień.`)
}

main().catch((e) => { console.error('Błąd:', e.message); process.exit(1) })
