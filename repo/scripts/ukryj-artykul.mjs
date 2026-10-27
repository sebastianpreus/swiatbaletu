/**
 * ukryj-artykul.mjs
 * Zdejmuje artykuł z portalu, nie kasując go, i przywraca z powrotem.
 *
 * JAK TO DZIAŁA. Portal czyta Sanity bez tokena (sanity/lib/client.ts nie ma
 * pola `token`), a zapytania bez tokena widzą wyłącznie dokumenty
 * opublikowane. Dokument o identyfikatorze "drafts.<id>" jest dla nich
 * niewidoczny - i o to chodzi. Artykuł znika z /artykuly, ze strony głównej
 * i spod własnego adresu, ale dalej istnieje, dalej jest edytowalny w /studio
 * i wraca na portal jednym poleceniem.
 *
 * To natywny mechanizm Sanity, nie obejście: dokładnie tak działa przycisk
 * "Publish" w Studio. Nie trzeba więc ruszać schematu ani zapytań GROQ.
 *
 * Uruchomienie:
 *   node scripts/ukryj-artykul.mjs <slug>                 # pokaż stan
 *   node scripts/ukryj-artykul.mjs <slug> --ukryj --apply # zdejmij z portalu
 *   node scripts/ukryj-artykul.mjs <slug> --publikuj --apply
 *
 * Przykład:
 *   node scripts/ukryj-artykul.mjs kto-prowadzi-polski-balet --ukryj --apply
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const args = process.argv.slice(2)
const SLUG = args.find((a) => !a.startsWith('--'))
const APPLY = args.includes('--apply')
const UKRYJ = args.includes('--ukryj')
const PUBLIKUJ = args.includes('--publikuj')

if (!SLUG) {
  console.error('Podaj slug artykułu, np.:\n  node scripts/ukryj-artykul.mjs kto-prowadzi-polski-balet --ukryj --apply')
  process.exit(1)
}
if (UKRYJ && PUBLIKUJ) { console.error('Wybierz jedno: --ukryj albo --publikuj.'); process.exit(1) }

const __dir = dirname(fileURLToPath(import.meta.url))
const env = {}
readFileSync(join(__dir, '..', '.env.local'), 'utf8').split('\n').forEach((l) => {
  const m = l.match(/^([^#=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim()
})
const PROJECT = env.NEXT_PUBLIC_SANITY_PROJECT_ID
const DATASET = env.NEXT_PUBLIC_SANITY_DATASET || 'production'

// Klient z tokenem - widzi i szkice, i dokumenty opublikowane.
const client = createClient({
  projectId: PROJECT, dataset: DATASET, apiVersion: '2024-01-01',
  token: env.SANITY_API_TOKEN, useCdn: false,
})

/** Zapytanie bez tokena, czyli dokładnie to, co widzi portal. */
async function widzianePrzezPortal(slug) {
  const q = encodeURIComponent('*[_type=="artykul" && slug.current==$slug]{_id,tytul}')
  const p = encodeURIComponent(JSON.stringify(slug))
  const url = `https://${PROJECT}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=${q}&%24slug=${p}`
  const r = await fetch(url)
  if (!r.ok) throw new Error(`zapytanie bez tokena: HTTP ${r.status}`)
  return (await r.json()).result || []
}

async function main() {
  const wszystkie = await client.fetch(
    '*[_type=="artykul" && slug.current==$slug]{_id, tytul, featured, bannerGlowna}', { slug: SLUG },
  )
  if (!wszystkie.length) { console.error(`Nie ma artykułu o slugu "${SLUG}".`); process.exit(1) }

  const opublikowany = wszystkie.find((d) => !d._id.startsWith('drafts.'))
  const szkic = wszystkie.find((d) => d._id.startsWith('drafts.'))

  console.log(`Artykuł: ${(opublikowany || szkic).tytul}`)
  console.log(`  opublikowany: ${opublikowany ? opublikowany._id : 'brak'}`)
  console.log(`  szkic       : ${szkic ? szkic._id : 'brak'}`)
  const naPortalu = await widzianePrzezPortal(SLUG)
  console.log(`  widzi portal: ${naPortalu.length ? 'TAK' : 'nie'}\n`)

  if (!UKRYJ && !PUBLIKUJ) { console.log('Nic nie robię. Dodaj --ukryj albo --publikuj.'); return }

  if (UKRYJ) {
    if (!opublikowany) { console.log('Już jest tylko szkicem - portal go nie widzi.'); return }
    console.log(`Zdejmuję z portalu: ${opublikowany._id} -> drafts.${opublikowany._id}`)
    if (!APPLY) { console.log('\nProba na sucho - nic nie zapisano. Dodaj --apply.'); return }

    // Kolejność ma znaczenie: najpierw powstaje szkic, dopiero potem znika
    // wersja opublikowana. Przy odwrotnej artykuł mógłby zniknąć bez śladu,
    // gdyby drugi krok się nie udał.
    const { _id, _rev, _createdAt, _updatedAt, ...tresc } = await client.getDocument(opublikowany._id)
    await client.createOrReplace({ ...tresc, _id: `drafts.${opublikowany._id}` })
    await client.delete(opublikowany._id)
  }

  if (PUBLIKUJ) {
    if (!szkic) { console.log('Nie ma szkicu do opublikowania.'); return }
    const docelowy = szkic._id.replace(/^drafts\./, '')
    console.log(`Publikuję: ${szkic._id} -> ${docelowy}`)
    if (!APPLY) { console.log('\nProba na sucho - nic nie zapisano. Dodaj --apply.'); return }

    const { _id, _rev, _createdAt, _updatedAt, ...tresc } = await client.getDocument(szkic._id)
    await client.createOrReplace({ ...tresc, _id: docelowy })
    await client.delete(szkic._id)
  }

  // Sprawdzenie po fakcie, tym samym kanałem, którym czyta portal.
  // Cache strony ma revalidate 60, więc na samej stronie zmiana widoczna
  // będzie najpóźniej po minucie.
  const po = await widzianePrzezPortal(SLUG)
  const oczekiwane = PUBLIKUJ
  if (!!po.length !== oczekiwane) {
    console.error(`\nALARM: portal ${po.length ? 'nadal widzi' : 'nie widzi'} artykułu, a miał ${oczekiwane ? 'widzieć' : 'nie widzieć'}.`)
    process.exit(1)
  }
  console.log(`\nOK - portal ${po.length ? 'widzi' : 'nie widzi'} artykułu "${SLUG}".`)
  console.log(oczekiwane
    ? `  Adres: https://swiatbaletu.pl/artykuly/${SLUG}`
    : '  Szkic nadal jest w Sanity Studio (/studio) i można go tam edytować.')
}

main().catch((e) => { console.error('Blad:', e.message); process.exit(1) })
