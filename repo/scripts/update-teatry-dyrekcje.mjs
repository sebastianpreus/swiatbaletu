/**
 * update-teatry-dyrekcje.mjs
 * 1. Uzupełnia w dokumentach `teatr` pola `dyrektor` i `kierownikBaletu`
 *    (zastępują dawne `dyrektorArtystyczny`, które mieszało dwie różne funkcje).
 * 2. Zamienia długie myślniki (—, –) na krótkie w nazwie, adresie i opisie.
 *
 * Dane zebrane 2026-09-02 ze stron teatrów i ich BIP-ów - źródło przy każdym
 * wpisie w tablicy DYREKCJE poniżej.
 *
 * Uruchomienie:
 *   node scripts/update-teatry-dyrekcje.mjs           # próba na sucho
 *   node scripts/update-teatry-dyrekcje.mjs --apply
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const APPLY = process.argv.includes('--apply')
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

const dash = (t) => (typeof t === 'string' ? t.replace(/[—–]/g, '-') : t)

const DYREKCJE = {
  // teatrwielki.nowybip.pl/dane-teleadresowe + teatrwielki.pl/.../dyrekcja-i-kadra-pbn
  'teatr-wielki-warszawa': { dyrektor: 'Boris Kudlička', kierownikBaletu: 'Krzysztof Pastor' },
  // operabaltycka.nowybip.pl/dyrekcja + operabaltycka.pl/zespol
  'opera-baltycka': { dyrektor: 'Romuald Wicza-Pokojski', kierownikBaletu: 'Izabela Sokołowska-Boulton' },
  // opera.krakow.pl/zespol
  'opera-krakowska': { dyrektor: 'Piotr Sułkowski', kierownikBaletu: 'Jacek Tyski' },
  // operalubelska.pl/o-nas/dyrekcja + komunikat z 29.01.2026 o objęciu funkcji od lutego
  'opera-lubelska': { dyrektor: 'Kamila Lendzion', kierownikBaletu: 'Dorota Wiśniewska' },
  // opera.bydgoszcz.pl/kontakt/kadra-kierownicza-1
  'opera-nova-bydgoszcz': { dyrektor: 'Maciej Figas', kierownikBaletu: 'Małgorzata Chojnacka' },
  // opera.wroclaw.pl/teatr/balet + materiały teatru
  'opera-wroclawska': { dyrektor: 'Agnieszka Franków-Żelazny', kierownikBaletu: 'Małgorzata Dzierżon' },
  // opera.szczecin.pl/teatr/nasz-zespol/dyrekcja + .../balet-opery-na-zamku
  'opera-na-zamku-szczecin': { dyrektor: 'Jacek Jekiel', kierownikBaletu: 'Grzegorz Brożek' },
  // opera-slaska.pl/zespol
  'opera-slaska-bytom': { dyrektor: 'Łukasz Goik', kierownikBaletu: 'Grzegorz Pajdzik' },
  // opera.poznan.pl/pl/zespol
  'teatr-wielki-poznan': { dyrektor: 'Adam Banaszak', kierownikBaletu: 'Robert Bondara' },
  // operalodz.4bip.pl - dyrekcja (oba stanowiska pełnione czasowo)
  'teatr-wielki-lodz': { dyrektor: 'p.o. Rafał Kłoczko', kierownikBaletu: 'p.o. Gintautas Potockas' },
}

async function main() {
  console.log(APPLY ? '=== TRYB WYKONANIA ===\n' : '=== PROBA NA SUCHO (--apply zeby wykonac) ===\n')

  const teatry = await client.fetch(
    '*[_type=="teatr"]|order(nazwa asc){_id, nazwa, "slug": slug.current, adres, dyrektorArtystyczny, opis}',
  )

  let zmienioneMyslniki = 0

  for (const t of teatry) {
    const nowe = DYREKCJE[t.slug]
    if (!nowe) { console.log(`! brak danych dla slug "${t.slug}" - pomijam`); continue }

    const set = { dyrektor: nowe.dyrektor, kierownikBaletu: nowe.kierownikBaletu }

    // Myślniki: nazwa, adres, opis (Portable Text).
    let myslnikiTu = 0
    const policz = (s) => (typeof s === 'string' ? (s.match(/[—–]/g) || []).length : 0)

    if (policz(t.nazwa)) { set.nazwa = dash(t.nazwa); myslnikiTu += policz(t.nazwa) }
    if (policz(t.adres)) { set.adres = dash(t.adres); myslnikiTu += policz(t.adres) }

    if (Array.isArray(t.opis)) {
      let ruszony = false
      const opis = t.opis.map((b) => {
        if (!Array.isArray(b.children)) return b
        const children = b.children.map((c) => {
          const n = policz(c.text)
          if (!n) return c
          myslnikiTu += n
          ruszony = true
          return { ...c, text: dash(c.text) }
        })
        return { ...b, children }
      })
      if (ruszony) set.opis = opis
    }
    zmienioneMyslniki += myslnikiTu

    const staryDyr = t.dyrektorArtystyczny ?? '(brak)'
    const zmiana = staryDyr === nowe.dyrektor ? 'bez zmian' : `${staryDyr} -> ${nowe.dyrektor}`
    console.log(`${set.nazwa || t.nazwa}`)
    console.log(`   dyrektor        : ${zmiana}`)
    console.log(`   kierownik baletu: ${nowe.kierownikBaletu}  (nowe pole)`)
    if (myslnikiTu) console.log(`   długie myślniki : ${myslnikiTu} do zamiany`)
    console.log()

    if (APPLY) {
      await client.patch(t._id).set(set).unset(['dyrektorArtystyczny']).commit()
    }
  }

  console.log(`Długich myślników do zamiany łącznie: ${zmienioneMyslniki}`)
  if (!APPLY) { console.log('\nProba na sucho - nic nie zapisano.'); return }

  const po = await client.fetch(
    '*[_type=="teatr"]{nazwa, adres, dyrektor, kierownikBaletu, dyrektorArtystyczny, opis}',
  )
  const zostalo = po.reduce((a, t) => {
    const txt = [t.nazwa, t.adres, ...(t.opis || []).flatMap((b) => (b.children || []).map((c) => c.text))].join(' ')
    return a + (txt.match(/[—–]/g) || []).length
  }, 0)
  const bezDyr = po.filter((t) => !t.dyrektor).length
  const bezKB = po.filter((t) => !t.kierownikBaletu).length
  const staraFlaga = po.filter((t) => t.dyrektorArtystyczny != null).length
  console.log(`\nPO: długie myślniki: ${zostalo} | bez dyrektora: ${bezDyr} | bez kier. baletu: ${bezKB} | ze starym polem: ${staraFlaga}`)
  if (zostalo || bezDyr || bezKB || staraFlaga) { console.error('ALARM: coś zostało'); process.exit(1) }
  console.log('OK wszystko uzupełnione i wyczyszczone.')
}

main().catch((e) => { console.error('Blad:', e.message); process.exit(1) })
