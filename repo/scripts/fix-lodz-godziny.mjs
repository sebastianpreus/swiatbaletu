/**
 * fix-lodz-godziny.mjs
 * Naprawia godziny łódzkich terminów po błędzie w parserze bilety24.
 *
 * Atrybut title przycisku ma dwie godziny, zawsze o godzinę od siebie:
 *   "Kup bilet - Balet: COPPELIA - 2026-11-14 17:30 - 18:30 - Łódź"
 * Druga z nich to faktyczna godzina rozpoczęcia - zgadza się ze stroną teatru
 * i w lecie, i w zimie. Parser brał pierwszą i dodawał godzinę tylko w okresie
 * letnim, więc terminy od końca października wychodziły o godzinę za wcześnie.
 *
 * Skrypt czyta sklep miesiąc po miesiącu i poprawia wyłącznie godzinę, tylko
 * tam, gdzie dzień i tytuł się zgadzają. Domyślnie na sucho; --apply zapisuje.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const APPLY = process.argv.includes('--apply')
const env = {}
readFileSync('.env.local', 'utf8').split('\n').forEach((l) => {
  const m = l.match(/^([^#=]+)=(.*)$/); if (m) env[m[1].trim()] = m[2].trim()
})
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const norm = (t) => t.toLowerCase().replace(/[„”"'’]/g, '').replace(/\s+/g, ' ').trim()
const pad = (n) => String(n).padStart(2, '0')
function warsawISO(y, m, d, h, min) {
  const ost = (yy, mm) => { const l = new Date(Date.UTC(yy, mm, 0)); return l.getUTCDate() - l.getUTCDay() }
  const start = Date.UTC(y, 2, ost(y, 3), 1), koniec = Date.UTC(y, 9, ost(y, 10), 1)
  const asCET = Date.UTC(y, m - 1, d, h - 1, min)
  const off = asCET >= start && asCET < koniec ? 2 : 1
  return `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}:00+${pad(off)}:00`
}

const { data: teatr } = await sb.from('teatry').select('id').eq('slug', 'teatr-wielki-lodz').single()
const { data: spektakle } = await sb.from('spektakle').select('id,tytul').eq('teatr_id', teatr.id)
const poId = Object.fromEntries(spektakle.map((s) => [s.id, s.tytul]))

const teraz = new Date()
// Klucz "YYYY-MM-DD|tytul" -> { dobre: Set<HH:MM>, zle: Set<HH:MM> }.
// Jeden tytuł potrafi mieć tego samego dnia dwa terminy (poranek dla szkół
// i wieczór), więc parowanie po samym dniu i tytule zrobiłoby z poranka
// wieczór. Dlatego trzymamy obie listy godzin i decydujemy po tym, w której
// z nich siedzi godzina z bazy.
const zrodlo = new Map()
const wpis = (k) => { if (!zrodlo.has(k)) zrodlo.set(k, { dobre: new Set(), zle: new Set() }); return zrodlo.get(k) }
for (let i = 0; i < 10; i++) {
  const d = new Date(teraz.getFullYear(), teraz.getMonth() + i, 1)
  const ym = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
  const html = await (await fetch(`https://twlodz.bilety24.pl/?b24_month=${ym}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120' },
  })).text()
  const re = /title="Kup bilet[^"]*?(?:Opera|Balet|Koncert|Edukacja|Musical|Wydarzenie|Spektakl|Operetka|Wycieczka|Widowisko)[:\s]+(.+?)\s*-\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/g
  let m, n = 0
  while ((m = re.exec(html))) {
    const w = wpis(`${m[2]}|${norm(m[1].replace(/&amp;/g, '&'))}`)
    w.zle.add(m[3]); w.dobre.add(m[4]); n++
  }
  console.log(`  ${ym}: ${n} pozycji w sklepie`)
}

const { data: rows } = await sb.from('przedstawienia')
  .select('id,data_czas,spektakl_id').eq('teatr_id', teatr.id)
  .gte('data_czas', teraz.toISOString()).order('data_czas')

let zmian = 0, brak = 0, ok = 0
for (const r of rows) {
  const dt = new Date(r.data_czas)
  const lok = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(dt)
  const [dzien, godz] = lok.split(' ')
  const w = zrodlo.get(`${dzien}|${norm(poId[r.spektakl_id] || '')}`)
  if (!w) { brak++; continue }
  if (w.dobre.has(godz)) { ok++; continue }      // już poprawna
  if (!w.zle.has(godz)) { brak++; continue }     // nie wiemy, co to - nie ruszamy
  const [h0, mi] = godz.split(':').map(Number)
  const h = h0 + 1                                // błąd był zawsze o równą godzinę
  const dobra = `${pad(h)}:${pad(mi)}`
  if (!w.dobre.has(dobra)) { brak++; continue }  // ostrożnościowo: musi być na liście
  const [y, mm, dd] = dzien.split('-').map(Number)
  console.log(`  ${dzien} ${godz} -> ${dobra}  ${poId[r.spektakl_id]}`)
  zmian++
  if (APPLY) {
    const { error } = await sb.from('przedstawienia').update({ data_czas: warsawISO(y, mm, dd, h, mi) }).eq('id', r.id)
    if (error) { console.error('   ✗', error.message); process.exit(1) }
  }
}
console.log(`\n  zgodnych: ${ok} | do poprawy: ${zmian} | bez pary w sklepie: ${brak}`)
console.log(APPLY ? '  ZAPISANO' : '  (na sucho - uruchom z --apply, żeby zapisać)')
