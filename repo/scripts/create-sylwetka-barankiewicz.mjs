/**
 * create-sylwetka-barankiewicz.mjs
 * Tworzy sylwetkę Jerzego Barankiewicza w Sanity
 * Zdjęcia: taniecPOLSKA / fot. Leon Myszkowski
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '..', '.env.local')
const env = {}
readFileSync(envPath, 'utf8').split('\n').forEach(l => {
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

const key = () => Math.random().toString(36).slice(2, 10)

async function uploadFromUrl(url, filename, label) {
  console.log(`  ↑ Pobieranie: ${label}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} dla ${url}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, {
    filename,
    contentType: 'image/jpeg',
  })
  console.log(`  ✓ ${label} → ${asset._id}`)
  return asset
}

function block(text, style = 'normal') {
  return {
    _type: 'block', _key: key(), style,
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
    markDefs: [],
  }
}

function h3(text) { return block(text, 'h3') }

// --- Upload zdjęć ---
console.log('\n🎭 Sylwetka: Jerzy Barankiewicz\n')
console.log('📷 Upload zdjęć...')

const foto1 = await uploadFromUrl(
  'https://taniecpolska.pl/wp-content/uploads/2026/05/2.-Jerzy-Barankiewicz-i-Barbara-Rajska-w-%E2%80%9ECoppelii-fot.-Leon-Myszkowski-858x608.jpg',
  'barankiewicz-coppelia.jpg',
  'Jerzy Barankiewicz w "Coppelii" (fot. Leon Myszkowski)'
)

const foto2 = await uploadFromUrl(
  'https://taniecpolska.pl/wp-content/uploads/2026/05/3.-Jerzy-Barankiewcz-i-Monika-Ukielska-w-%E2%80%9ECorce-zle-strzezonej-fot.-Leon-Myszkowski-566x608.jpg',
  'barankiewicz-corka-zle-strzezona.jpg',
  'Jerzy Barankiewicz w "Córce źle strzeżonej" (fot. Leon Myszkowski)'
)

const foto3 = await uploadFromUrl(
  'https://taniecpolska.pl/wp-content/uploads/2026/05/1.-Jerzy-Barankiewicz-z-synem-Filipem-fot.-arch-792x608.jpg',
  'barankiewicz-z-synem-filipem.jpg',
  'Jerzy Barankiewicz z synem Filipem (fot. archiwum)'
)

// --- Biografia ---
const bio = [
  block('Jerzy Barankiewicz urodził się w 1953 roku w Grajewie. Ukończył Państwową Szkołę Baletową w Warszawie w 1972 roku — uczył się u Wacława Gaworczyka, Zygmunta Dąbrowskiego, Zbigniewa Strzałkowskiego i Barbary Kasprowicz. Jeszcze jako uczeń szkoły wystąpił w dwóch filmach fabularnych Haliny Bielińskiej: „Dziadek do orzechów" (1967) i „Piąta rano" (1969).'),

  h3('Teatr Wielki w Warszawie'),
  block('W 1972 roku dołączył do zespołu baletowego Teatru Wielkiego w Warszawie. Trzy lata później, po sukcesie w roli Franza w „Coppelii", awansował na koryfeja. Od 1977 do 1982 roku był pierwszym solistą teatru — w ciągu całej kariery na tej scenie zanotował 211 udokumentowanych występów, ceniony za precyzję tańca i szlachetny wizerunek sceniczny.'),
  block('Tańczył w choreografiach Wojciecha Grucy, Birgit Cullberg, Fredericka Ashtona i Serge\'a Lifara. Do jego ważniejszych ról należały: Albert w „Giselle", Colas w „Córce źle strzeżonej", główne partie w „Jeziorze łabędzim", „Don Kichocie" i „Spartakusie".'),

  h3('Theater Hof'),
  block('W 1982 roku wyemigrował do Niemiec i dołączył jako pierwszy solista do Theater Hof w Bawarii. Tańczył tam m.in. w „Romeo i Julii" Prokofiewa, „Fancy Free" Bernsteina i „Sylfidach". Od 1992 pełnił funkcję asystenta dyrektora, a od 1994 roku — inspektora teatru. Z Theater Hof związany był do końca życia.'),

  h3('Rodzina'),
  block('Był ojcem Filipa Barankiewicza — pierwszego solisty Stuttgart Ballet w latach 2002–2014, który karierę taneczną kontynuuje do dziś.'),

  block('Jerzy Barankiewicz zmarł 14 maja 2026 roku w Hofie, w wieku 73 lat.'),
]

// --- Dokument ---
console.log('\n📤 Tworzenie sylwetki w Sanity...')

const doc = {
  _type: 'sylwetka',
  imieNazwisko: 'Jerzy Barankiewicz',
  slug: { _type: 'slug', current: 'jerzy-barankiewicz' },
  rola: 'Legenda',
  zdjecie: {
    _type: 'image',
    asset: { _type: 'reference', _ref: foto1._id },
    alt: 'Jerzy Barankiewicz i Barbara Rajska w „Coppelii", fot. Leon Myszkowski',
  },
  teatrGlowny: 'Teatr Wielki w Warszawie / Theater Hof',
  narodowosc: 'Polska',
  dataUrodzenia: '1953-01-01',
  dataSmierci: '2026-05-14',
  bio,
  galeria: [
    {
      _type: 'image',
      _key: key(),
      asset: { _type: 'reference', _ref: foto2._id },
      alt: 'Jerzy Barankiewicz i Monika Ukielska w „Córce źle strzeżonej"',
      caption: 'Z Moniką Ukielską w „Córce źle strzeżonej", fot. Leon Myszkowski',
    },
    {
      _type: 'image',
      _key: key(),
      asset: { _type: 'reference', _ref: foto3._id },
      alt: 'Jerzy Barankiewicz z synem Filipem',
      caption: 'Jerzy Barankiewicz z synem Filipem, fot. archiwum',
    },
  ],
  najwazniejszeRole: [
    'Albert — Giselle',
    'Franz — Coppelia',
    'Colas — Córka źle strzeżona',
    'Książę Zygfryd — Jezioro łabędzie',
    'Don Kichot',
    'Spartakus',
    'Romeo — Romeo i Julia',
  ],
  aktywny: false,
  polskiArtysta: true,
  wyroznienie: false,
}

const result = await client.create(doc)
console.log('\n✅ Sylwetka utworzona!')
console.log('   ID:     ', result._id)
console.log('   URL:    https://swiatbaletu.vercel.app/sylwetki/jerzy-barankiewicz')
console.log('   Studio: https://nri4izo1.sanity.studio/structure/sylwetka;' + result._id)
