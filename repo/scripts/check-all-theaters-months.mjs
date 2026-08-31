import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Ile rekordów ogółem w przyszłości
const { count: total } = await sb.from('przedstawienia')
  .select('*', { count: 'exact', head: true })
  .gte('data_czas', new Date().toISOString())
console.log('Łącznie przyszłych przedstawień w DB:', total)

// Wszystkie przyszłe rekordy (limit 2000 żeby zobaczyć czy nie obcina)
const { data: allRows } = await sb.from('przedstawienia')
  .select('data_czas, teatr:teatry(miasto)')
  .gte('data_czas', new Date().toISOString())
  .order('data_czas', { ascending: true })
  .limit(2000)

const byMonthCity = {}
for (const r of allRows || []) {
  const d = new Date(r.data_czas)
  const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const city = r.teatr?.miasto || 'unknown'
  if (!byMonthCity[month]) byMonthCity[month] = {}
  byMonthCity[month][city] = (byMonthCity[month][city] || 0) + 1
}

console.log('\nMiesiące × Miasto:')
for (const [month, cities] of Object.entries(byMonthCity).sort()) {
  const lodz = cities['Łódź'] || 0
  const total = Object.values(cities).reduce((a, b) => a + b, 0)
  const cityList = Object.entries(cities).map(([c, n]) => `${c}:${n}`).join(', ')
  console.log(`  ${month}  [total:${total}] ${cityList}`)
}

// Sprawdź default limit Supabase (bez limit() zwraca max 1000)
const { data: limited } = await sb.from('przedstawienia')
  .select('data_czas')
  .gte('data_czas', new Date().toISOString())
  .order('data_czas', { ascending: true })
// bez .limit()
console.log('\nBez .limit() — ile rekordów zwrócono:', limited?.length)
if (limited && limited.length > 0) {
  const last = new Date(limited[limited.length-1].data_czas)
  console.log('Ostatni rekord:', last.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long' }))
}
