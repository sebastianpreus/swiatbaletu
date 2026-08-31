/**
 * dedupe-spektakle.mjs
 * Scala zduplikowane wiersze w tabeli `spektakle` (ten sam tytul + teatr_id).
 *
 * Przyczyna duplikatów: ensureSpektakl() w scrape-repertuar.mjs używał
 * .maybeSingle() i gubił błąd PGRST116, więc przy każdym z 18 dziennych
 * przebiegów dokładał kolejny duplikat. Naprawione osobnym commitem -
 * ten skrypt sprząta zaległości.
 *
 * KOLEJNOŚĆ JEST KRYTYCZNA: przedstawienia.spektakl_id ma ON DELETE CASCADE,
 * więc najpierw przepinamy przedstawienia na wiersz kanoniczny, a dopiero
 * potem kasujemy duplikaty. Odwrotna kolejność skasowałaby przedstawienia.
 *
 * Uruchomienie:
 *   node scripts/dedupe-spektakle.mjs           # próba na sucho, nic nie zapisuje
 *   node scripts/dedupe-spektakle.mjs --apply   # wykonanie
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const APPLY = process.argv.includes('--apply')
const __dir = dirname(fileURLToPath(import.meta.url))

const env = {}
readFileSync(join(__dir, '..', '.env.local'), 'utf8').split('\n').forEach((l) => {
  const m = l.match(/^([^#=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim()
})
const SU = env.NEXT_PUBLIC_SUPABASE_URL
const H = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
  'Content-Type': 'application/json',
}

const req = async (method, path, body) => {
  const r = await fetch(SU + '/rest/v1/' + path, {
    method, headers: H, body: body ? JSON.stringify(body) : undefined,
  })
  if (!r.ok) throw new Error(`${method} ${path.slice(0, 70)} -> ${r.status} ${await r.text()}`)
  const t = await r.text()
  return t ? JSON.parse(t) : null
}

const pobierzWszystko = async (tabela, select) => {
  const out = []
  for (let off = 0; ; off += 1000) {
    const chunk = await req('GET', `${tabela}?select=${select}&limit=1000&offset=${off}`)
    out.push(...chunk)
    if (chunk.length < 1000) break
  }
  return out
}

async function main() {
  console.log(APPLY ? '=== TRYB WYKONANIA ===\n' : '=== PROBA NA SUCHO (--apply zeby wykonac) ===\n')

  const teatry = Object.fromEntries((await req('GET', 'teatry?select=id,nazwa')).map((t) => [t.id, t.nazwa]))
  const spektakle = await pobierzWszystko('spektakle', 'id,tytul,teatr_id,kompozytor,choreograf,opis,zdjecie_url,created_at')
  const przedstawienia = await pobierzWszystko('przedstawienia', 'id,spektakl_id')

  const przedPrzed = przedstawienia.length
  console.log(`PRZED:  spektakle ${spektakle.length}   przedstawienia ${przedPrzed}\n`)

  const licznik = {}
  przedstawienia.forEach((p) => { licznik[p.spektakl_id] = (licznik[p.spektakl_id] || 0) + 1 })

  const grupy = {}
  spektakle.forEach((s) => {
    const k = s.teatr_id + '|' + s.tytul
    ;(grupy[k] = grupy[k] || []).push(s)
  })
  const duplikaty = Object.values(grupy).filter((g) => g.length > 1)

  if (duplikaty.length === 0) { console.log('Brak duplikatow - nie ma czego sprzatac.'); return }

  const doUsuniecia = []
  const plan = []

  for (const grupa of duplikaty) {
    // Kanoniczny = najstarszy wiersz (ten pierwotny, sprzed lawiny duplikatow).
    const posortowane = [...grupa].sort((a, b) => a.created_at.localeCompare(b.created_at))
    const kanon = posortowane[0]
    const reszta = posortowane.slice(1)

    // Uzupelnij puste pola kanonicznego z duplikatow - zeby scalanie niczego nie zgubilo.
    const uzupelnienia = {}
    for (const pole of ['kompozytor', 'choreograf', 'opis', 'zdjecie_url']) {
      if (kanon[pole] == null) {
        const zrodlo = reszta.find((s) => s[pole] != null)
        if (zrodlo) uzupelnienia[pole] = zrodlo[pole]
      }
    }

    const doPrzepiecia = reszta.filter((s) => licznik[s.id])
    const przedstawienDoPrzepiecia = doPrzepiecia.reduce((a, s) => a + licznik[s.id], 0)

    plan.push({ kanon, reszta, uzupelnienia, doPrzepiecia })
    doUsuniecia.push(...reszta)

    console.log(`"${kanon.tytul}" - ${teatry[kanon.teatr_id]}`)
    console.log(`   ${grupa.length} wierszy -> 1 (usuwam ${reszta.length})`)
    console.log(`   kanoniczny: ${kanon.id}  (utworzony ${kanon.created_at.slice(0, 10)})`)
    console.log(`   przedstawien do przepiecia: ${przedstawienDoPrzepiecia} z ${doPrzepiecia.length} wierszy`)
    if (Object.keys(uzupelnienia).length) console.log(`   uzupelniam pola: ${Object.keys(uzupelnienia).join(', ')}`)
    console.log()
  }

  console.log(`RAZEM do usuniecia: ${doUsuniecia.length} wierszy spektakli`)
  console.log(`Przedstawienia musza pozostac: ${przedPrzed}\n`)

  if (!APPLY) { console.log('Proba na sucho - nic nie zapisano. Uruchom z --apply.'); return }

  // Kopia zapasowa usuwanych wierszy.
  const backup = join(__dir, '..', '..', `backup-spektakle-duplikaty-${new Date().toISOString().slice(0, 10)}.json`)
  writeFileSync(backup, JSON.stringify(doUsuniecia, null, 1))
  console.log(`Kopia zapasowa usuwanych wierszy: ${backup}\n`)

  for (const { kanon, reszta, uzupelnienia, doPrzepiecia } of plan) {
    if (Object.keys(uzupelnienia).length) {
      await req('PATCH', `spektakle?id=eq.${kanon.id}`, uzupelnienia)
    }
    // 1) NAJPIERW przepiecie przedstawien - inaczej CASCADE by je skasowal.
    for (const s of doPrzepiecia) {
      await req('PATCH', `przedstawienia?spektakl_id=eq.${s.id}`, { spektakl_id: kanon.id })
    }
    // 2) Dopiero teraz kasowanie duplikatow, partiami.
    const ids = reszta.map((s) => s.id)
    for (let i = 0; i < ids.length; i += 100) {
      await req('DELETE', `spektakle?id=in.(${ids.slice(i, i + 100).join(',')})`)
    }
    console.log(`  OK "${kanon.tytul}" scalony`)
  }

  const spektaklePo = await pobierzWszystko('spektakle', 'id')
  const przedstawieniaPo = await pobierzWszystko('przedstawienia', 'id')
  console.log(`\nPO:     spektakle ${spektaklePo.length}   przedstawienia ${przedstawieniaPo.length}`)

  if (przedstawieniaPo.length !== przedPrzed) {
    console.error(`\nALARM: liczba przedstawien zmienila sie z ${przedPrzed} na ${przedstawieniaPo.length}`)
    process.exit(1)
  }
  console.log('OK Liczba przedstawien bez zmian - nic nie zginelo.')
}

main().catch((e) => { console.error('Blad:', e.message); process.exit(1) })
