import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const { data: teatr } = await sb.from('teatry').select('id').eq('slug', 'opera-wroclawska').single()
const { data: rows } = await sb.from('przedstawienia')
  .select('link_szczegoly, data_czas, spektakl:spektakle(tytul)')
  .eq('teatr_id', teatr.id)
  .order('data_czas', { ascending: true })
  .limit(5)

console.log('=== Pierwsze 5 Wrocław — link_szczegoly ===')
for (const r of rows || []) {
  const dt = new Date(r.data_czas).toLocaleDateString('pl-PL')
  console.log(`${dt} | ${r.spektakl?.tytul}`)
  console.log(`  → ${r.link_szczegoly}`)
}

// Sprawdź czy są jeszcze stare URL-e
const { data: old } = await sb.from('przedstawienia')
  .select('id')
  .eq('teatr_id', teatr.id)
  .like('link_szczegoly', '%spektakl.php%')
console.log(`\nStare URL-e (spektakl.php): ${old?.length || 0} — ${old?.length ? '❌ problem!' : '✅ czyste'}`)

const { count } = await sb.from('przedstawienia')
  .select('*', { count: 'exact', head: true })
  .eq('teatr_id', teatr.id)
console.log(`Ogółem przedstawień Wrocław: ${count}`)
