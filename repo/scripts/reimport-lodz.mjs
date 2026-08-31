/**
 * Czyści i reimportuje Łódź krok po kroku z pełnym logowaniem.
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as cheerio from 'cheerio'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── Krok 1: ID teatru ────────────────────────────────────────────────────────
const { data: teatr, error: teatrErr } = await sb.from('teatry').select('id').eq('slug', 'teatr-wielki-lodz').single()
if (teatrErr || !teatr) { console.error('Brak teatru!', teatrErr); process.exit(1) }
const teatrId = teatr.id
console.log('Teatr ID:', teatrId)

// ── Krok 2: Ile rekordów PRZED czyszczeniem ──────────────────────────────────
const { count: before } = await sb.from('przedstawienia')
  .select('*', { count: 'exact', head: true })
  .eq('teatr_id', teatrId)
console.log(`Przed czyszczeniem: ${before} rekordów`)

// ── Krok 3: Usuń WSZYSTKIE przyszłe Łódź (data >= dziś) ─────────────────────
const todayISO = new Date().toISOString()
const { error: delErr, count: delCount } = await sb.from('przedstawienia')
  .delete({ count: 'exact' })
  .eq('teatr_id', teatrId)
  .gte('data_czas', todayISO)

if (delErr) { console.error('Błąd usuwania:', delErr); process.exit(1) }
console.log(`Usuniętych: ${delCount}`)

const { count: afterDel } = await sb.from('przedstawienia')
  .select('*', { count: 'exact', head: true })
  .eq('teatr_id', teatrId)
console.log(`Po czyszczeniu: ${afterDel} rekordów`)

// ── Krok 4: Scraped Łódź (bilety24) ─────────────────────────────────────────
const MONTHS = { 'stycznia': 1, 'lutego': 2, 'marca': 3, 'kwietnia': 4, 'maja': 5, 'czerwca': 6,
  'lipca': 7, 'sierpnia': 8, 'września': 9, 'października': 10, 'listopada': 11, 'grudnia': 12 }

function warsawDateToISO(year, month, day, hour, minute) {
  const lastSunday = (y, m) => { const last = new Date(Date.UTC(y, m, 0)); return last.getUTCDate() - last.getUTCDay() }
  const cestStart = new Date(Date.UTC(year, 2, lastSunday(year, 3), 1, 0, 0))
  const cestEnd   = new Date(Date.UTC(year, 9, lastSunday(year, 10), 1, 0, 0))
  const utcAsCET  = Date.UTC(year, month - 1, day, hour - 1, minute)
  const isCEST    = utcAsCET >= cestStart.getTime() && utcAsCET < cestEnd.getTime()
  const offset    = isCEST ? 2 : 1
  const pad = n => String(n).padStart(2, '0')
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+${pad(offset)}:00`
}

const allEvents = []
const seen = new Set()
const now = new Date()

console.log('\nPobieram bilety24...')
for (let offset = 0; offset < 14; offset++) {
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  try {
    const r = await fetch(`https://twlodz.bilety24.pl/?b24_month=${ym}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const html = await r.text()
    const $ = cheerio.load(html)
    let monthCount = 0

    $('.desktop-show .b24-day').each((_, dayEl) => {
      const $day = $(dayEl)
      $day.find('.list-item').each((_, itemEl) => {
        const $item = $(itemEl)
        const detailLink = $item.find('a.list-item-image').attr('href') || ''
        const $btn = $item.find('a.btn-buy').first()
        const btnText = $btn.text().trim()
        const btnHref = $btn.attr('href') || ''
        const btnTitle = $btn.attr('title') || ''
        const titleMatch = btnTitle.match(/(?:Opera|Balet|Koncert|Edukacja|Musical|Wydarzenie|Spektakl)[:\s]+(.+?)\s*-\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/)
        if (!titleMatch) return

        const title = titleMatch[1].trim().replace(/\s+/g, ' ')
        const dateStr = titleMatch[2]
        const timeStr = titleMatch[3]
        const [y, m, dd] = dateStr.split('-').map(Number)
        let [h, min] = timeStr.split(':').map(Number)

        // CEST korekta (bilety24 używa CET przez cały rok)
        const lastSunMar = new Date(Date.UTC(y, 2, 31)); lastSunMar.setUTCDate(lastSunMar.getUTCDate() - lastSunMar.getUTCDay())
        const lastSunOct = new Date(Date.UTC(y, 9, 31)); lastSunOct.setUTCDate(lastSunOct.getUTCDate() - lastSunOct.getUTCDay())
        const evDate = new Date(Date.UTC(y, m - 1, dd))
        if (evDate >= lastSunMar && evDate < lastSunOct) h += 1
        const dateTime = warsawDateToISO(y, m, dd, h, min)

        const key = `${dateTime}-${title}`
        if (seen.has(key)) return
        seen.add(key)

        const btnLower = btnText.toLowerCase()
        let dostepnosc = null
        let ticketLink = ''
        if (btnLower.includes('kup bilet')) { dostepnosc = 'dostepne'; ticketLink = btnHref }
        else if (btnLower.includes('odwo')) { dostepnosc = 'odwolane' }
        else if (btnLower.includes('info')) { dostepnosc = null }  // nie zapisujemy 'info' — poza constraintem

        allEvents.push({
          tytul: title,
          data_czas: dateTime,
          link_bilety: ticketLink || null,
          dostepnosc,
          zrodlo_url: detailLink || `https://twlodz.bilety24.pl/?b24_month=${ym}`,
        })
        monthCount++
      })
    })
    console.log(`  ${ym}: ${monthCount} eventów`)
  } catch (e) { console.log(`  ${ym}: BŁĄD — ${e.message}`) }
}
console.log(`Razem z bilety24: ${allEvents.length} eventów`)

// ── Krok 5: Upewnij się że spektakle istnieją ────────────────────────────────
console.log('\nTworzę/sprawdzam spektakle...')
const spektaklCache = new Map()
const titles = [...new Set(allEvents.map(e => e.tytul))]
for (const tytul of titles) {
  const { data: existing } = await sb.from('spektakle').select('id').eq('tytul', tytul).eq('teatr_id', teatrId).maybeSingle()
  if (existing) {
    spektaklCache.set(tytul, existing.id)
  } else {
    const { data: created, error: ce } = await sb.from('spektakle').insert({ tytul, teatr_id: teatrId }).select('id').single()
    if (ce) { console.error(`Błąd tworzenia spektaklu "${tytul}":`, ce); continue }
    spektaklCache.set(tytul, created.id)
    console.log(`  + Spektakl: ${tytul}`)
  }
}
console.log(`Spektakli w cache: ${spektaklCache.size}`)

// ── Krok 6: Filtruj tylko przyszłe i wstaw ───────────────────────────────────
const futureEvents = allEvents.filter(e => e.data_czas >= now.toISOString())
console.log(`\nPrzyszłych eventów do wstawienia: ${futureEvents.length}`)

let added = 0, errors = 0
// Wstawiaj po 1 żeby zobaczyć które failują
for (const ev of futureEvents) {
  const spektaklId = spektaklCache.get(ev.tytul)
  if (!spektaklId) { console.error(`  ✗ Brak spektaklu dla "${ev.tytul}"`); errors++; continue }

  // Dozwolone wartości dostepnosc: 'dostepne', 'malo_miejsc', 'wyprzedane', 'premiera', 'odwolane', null
  // CHECK constraint w DB — sprawdź jakie wartości są dozwolone
  const row = {
    spektakl_id: spektaklId,
    teatr_id: teatrId,
    data_czas: ev.data_czas,
    link_bilety: ev.link_bilety || null,
    dostepnosc: ev.dostepnosc || null,
    notatka: null,
    link_szczegoly: ev.zrodlo_url || null,
  }

  const { error: ie } = await sb.from('przedstawienia').insert(row)
  if (ie) {
    console.error(`  ✗ Insert error dla "${ev.tytul}" (${ev.data_czas}): ${ie.message} | dostepnosc=${ev.dostepnosc}`)
    errors++
  } else {
    added++
  }
}

console.log(`\nWstawiono: ${added}, błędów: ${errors}`)

// ── Krok 7: Weryfikacja ──────────────────────────────────────────────────────
const { count: final } = await sb.from('przedstawienia')
  .select('*', { count: 'exact', head: true })
  .eq('teatr_id', teatrId)
  .gte('data_czas', now.toISOString())
console.log(`W DB (przyszłe Łódź): ${final}`)
