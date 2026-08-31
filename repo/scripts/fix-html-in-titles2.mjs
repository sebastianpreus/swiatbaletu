/**
 * fix-html-in-titles2.mjs
 * Debugowanie i naprawa znaczników HTML w tytułach spektakli
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Service key prefix:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20))

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const stripHtml = (s) => (s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

// Znajdź wszystkie spektakle z HTML w tytule
const { data: spektakle, error: fetchError } = await supabase
  .from('spektakle')
  .select('id, tytul')
  .ilike('tytul', '%<%')

if (fetchError) {
  console.error('Błąd pobierania:', fetchError)
  process.exit(1)
}

if (!spektakle?.length) {
  console.log('Brak tytułów z HTML — wszystko czyste.')
  process.exit(0)
}

console.log(`\nZnaleziono ${spektakle.length} spektakli do naprawy:\n`)

for (const s of spektakle) {
  const clean = stripHtml(s.tytul)
  console.log(`ID: ${s.id}`)
  console.log(`  PRZED: "${s.tytul}"`)
  console.log(`  PO:    "${clean}"`)

  const { data: updated, error: updateError } = await supabase
    .from('spektakle')
    .update({ tytul: clean })
    .eq('id', s.id)
    .select()

  if (updateError) {
    console.error(`  ❌ Błąd aktualizacji:`, updateError)
  } else {
    console.log(`  ✅ Zaktualizowano — nowy tytuł: "${updated?.[0]?.tytul}"`)
  }
}

// Weryfikacja końcowa
const { data: remaining } = await supabase
  .from('spektakle')
  .select('id, tytul')
  .ilike('tytul', '%<%')

console.log(`\nPo naprawie — pozostałe rekordy z HTML: ${remaining?.length ?? 0}`)
if (remaining?.length) {
  console.log(remaining.map(r => `  ${r.tytul}`).join('\n'))
}
