/**
 * update-teatry-dyrekcje-2026-10.mjs
 * Odświeżenie pól `dyrektor` i `kierownikBaletu` w dokumentach `teatr`.
 *
 * Poprzedni przegląd (scripts/update-teatry-dyrekcje.mjs) zebrał dane 2 września
 * 2026. Ten sprawdza je ponownie u źródeł 27 października 2026 - wszystkie
 * nazwiska odczytane ze stron teatrów i ich BIP-ów tego dnia, źródło przy
 * każdym wpisie poniżej.
 *
 * DWIE ZMIANY WOBEC POPRZEDNIEGO PRZEGLĄDU:
 *
 *  1. POZNAŃ. Robert Bondara -> Anna Hop. Hop objęła zespół 15 października
 *     2026, po ośmiu sezonach Bondary. Teatr przy okazji podniósł rangę
 *     stanowiska: dotąd był "kierownik baletu", teraz jest "dyrektor baletu".
 *     Potwierdzone na opera.poznan.pl/pl/zespol ("Anna Hop - Dyrektor Baletu")
 *     oraz w komunikacie teatru omawianym przez teatrdlawszystkich.pl.
 *
 *  2. WARSZAWA. Pole `dyrektor` miało wartość "Boris Kudlička, Krzysztof
 *     Pastor". Na stronie /teatry wyświetla się to jako dyrekcja całego teatru,
 *     a Pastor nią nie jest - kieruje Polskim Baletem Narodowym i jako jego
 *     szef jest zastępcą dyrektora. Zostaje więc sam Kudlička w `dyrektor`
 *     i sam Pastor w `kierownikBaletu`, czyli dokładnie to, co opisują obie
 *     strony teatru. Rozdzielenie tych funkcji było powodem, dla którego
 *     te pola w ogóle powstały.
 *
 * Pozostałe osiem teatrów: bez zmian, ale każde nazwisko sprawdzone ponownie.
 * Wyszukiwarki podrzucały przy tym nieaktualne nazwiska (Bydgoszcz - Ilona
 * Jaświn-Madejska, która odeszła w 2020; Kraków - Elena Korpusenko), więc
 * wszystko czytane wprost ze stron teatrów, nie z wyników wyszukiwania.
 *
 * Uruchomienie:
 *   node scripts/update-teatry-dyrekcje-2026-10.mjs           # próba na sucho
 *   node scripts/update-teatry-dyrekcje-2026-10.mjs --apply
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

// Sprawdzone 27.10.2026. Adres przy wpisie to strona, z której odczytano dane.
const DYREKCJE = {
  // teatrwielki.pl/zespol/dyrekcja + /teatr/polski-balet-narodowy/dyrekcja-i-kadra-pbn
  'teatr-wielki-warszawa':   { dyrektor: 'Boris Kudlička',              kierownikBaletu: 'Krzysztof Pastor' },
  // opera.poznan.pl/pl/zespol - sekcja DYREKCJA i sekcja BALET
  'teatr-wielki-poznan':     { dyrektor: 'Adam Banaszak',               kierownikBaletu: 'Anna Hop' },
  // operalodz.4bip.pl - Dyrekcja oraz Balet; oba stanowiska nadal "p.o."
  'teatr-wielki-lodz':       { dyrektor: 'p.o. Rafał Kłoczko',          kierownikBaletu: 'p.o. Gintautas Potockas' },
  // operabaltycka.pl/zespol - Dyrekcja i Balet
  'opera-baltycka':          { dyrektor: 'Romuald Wicza-Pokojski',      kierownikBaletu: 'Izabela Sokołowska-Boulton' },
  // opera.wroclaw.pl/teatr/zespol-v2
  'opera-wroclawska':        { dyrektor: 'Agnieszka Franków-Żelazny',   kierownikBaletu: 'Małgorzata Dzierżon' },
  // opera.krakow.pl/zespol - Dyrekcja i Balet
  'opera-krakowska':         { dyrektor: 'Piotr Sułkowski',             kierownikBaletu: 'Jacek Tyski' },
  // opera.bydgoszcz.pl/kontakt/kadra-kierownicza-1
  'opera-nova-bydgoszcz':    { dyrektor: 'Maciej Figas',                kierownikBaletu: 'Małgorzata Chojnacka' },
  // opera.szczecin.pl/teatr/nasz-zespol/dyrekcja + .../balet-opery-na-zamku
  'opera-na-zamku-szczecin': { dyrektor: 'Jacek Jekiel',                kierownikBaletu: 'Grzegorz Brożek' },
  // opera-slaska.pl/zespol - Dyrekcja i kierownictwo
  'opera-slaska-bytom':      { dyrektor: 'Łukasz Goik',                 kierownikBaletu: 'Grzegorz Pajdzik' },
  // operalubelska.pl/o-nas/artysci - Zespół baletu, "Kierownik - ..."
  'opera-lubelska':          { dyrektor: 'Kamila Lendzion',             kierownikBaletu: 'Dorota Wiśniewska' },
}

async function main() {
  console.log(APPLY ? '=== TRYB WYKONANIA ===\n' : '=== PROBA NA SUCHO (--apply zeby wykonac) ===\n')

  const teatry = await client.fetch(
    '*[_type=="teatr"]|order(nazwa asc){_id, nazwa, "slug": slug.current, dyrektor, kierownikBaletu}',
  )

  let zmian = 0
  for (const t of teatry) {
    const nowe = DYREKCJE[t.slug]
    if (!nowe) { console.log(`! brak danych dla slug "${t.slug}" - pomijam`); continue }

    const diff = []
    if (t.dyrektor !== nowe.dyrektor) diff.push(`   dyrektor        : ${t.dyrektor ?? '(brak)'} -> ${nowe.dyrektor}`)
    if (t.kierownikBaletu !== nowe.kierownikBaletu) diff.push(`   kierownik baletu: ${t.kierownikBaletu ?? '(brak)'} -> ${nowe.kierownikBaletu}`)

    if (!diff.length) { console.log(`${t.nazwa}\n   bez zmian\n`); continue }

    zmian += diff.length
    console.log(`${t.nazwa}`)
    diff.forEach((l) => console.log(l))
    console.log()

    if (APPLY) await client.patch(t._id).set(nowe).commit()
  }

  console.log(`Pól do zmiany: ${zmian}`)
  if (!APPLY) { console.log('\nProba na sucho - nic nie zapisano.'); return }

  const po = await client.fetch('*[_type=="teatr"]{"slug": slug.current, dyrektor, kierownikBaletu}')
  const zle = po.filter((t) => {
    const w = DYREKCJE[t.slug]
    return !w || t.dyrektor !== w.dyrektor || t.kierownikBaletu !== w.kierownikBaletu
  })
  if (zle.length) { console.error('ALARM: nie zgadza się:', zle.map((t) => t.slug).join(', ')); process.exit(1) }
  console.log(`\nOK - wszystkie ${po.length} teatrów zgodne z zestawieniem.`)
}

main().catch((e) => { console.error('Blad:', e.message); process.exit(1) })
