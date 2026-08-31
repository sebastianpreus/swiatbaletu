/**
 * fix-html-in-titles.mjs
 * Czyści znaczniki HTML (np. <br>) z tytułów spektakli w Supabase
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const stripHtml = (s) => (s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

// Znajdź wszystkie spektakle z HTML w tytule
const { data: spektakle } = await supabase
  .from('spektakle')
  .select('id, tytul')
  .ilike('tytul', '%<%')

if (!spektakle?.length) {
  console.log('Brak tytułów z HTML — wszystko czyste.')
  process.exit(0)
}

console.log(`Znaleziono ${spektakle.length} spektakli do naprawy:\n`)

for (const s of spektakle) {
  const clean = stripHtml(s.tytul)
  console.log(`  "${s.tytul}" → "${clean}"`)
  await supabase.from('spektakle').update({ tytul: clean }).eq('id', s.id)
}

console.log('\n✅ Gotowe.')
