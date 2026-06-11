/**
 * create-wywiad-karolina.mjs
 * Tworzy wywiad z Karoliną Urbaniak jako artykuł (kategoria "Wywiad") w Sanity.
 * - wgrywa zdjęcie główne z images/karolina-urbaniak.jpg
 * - osadza film YouTube (jeśli podano YOUTUBE_URL)
 * - dodaje sekcję "Kariera Karoliny Urbaniak" (bio + przebieg + role)
 *
 * Uruchom: node scripts/create-wywiad-karolina.mjs
 */
import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ── Konfiguracja ─────────────────────────────────────────────────────────────
const YOUTUBE_URL = 'https://youtu.be/nidMSMpKWYo' // ← link do filmu YouTube (puste = bez wideo)
const IMAGE_FILE = 'karolina-urbaniak.jpg' // baner — miniaturka (strona główna, listy)
const COVER_FILE = 'karolina.jpg'  // okładka — duże zdjęcie w artykule (opcjonalnie)
const SLUG = 'karolina-urbaniak'

const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '..', '.env.local')
const env = {}
readFileSync(envPath, 'utf8').split('\n').forEach((l) => {
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

// ── Helpery bloków Portable Text ─────────────────────────────────────────────
function block(text, style = 'normal') {
  return {
    _type: 'block', _key: key(), style,
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
    markDefs: [],
  }
}
function h2(text) { return block(text, 'h2') }
function h3(text) { return block(text, 'h3') }

function bullet(text) {
  return {
    _type: 'block', _key: key(), style: 'normal',
    listItem: 'bullet', level: 1,
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
    markDefs: [],
  }
}
// punkt listy z pogrubionym wstępem (np. "2016–2021 — ...")
function bulletMixed(parts) {
  return {
    _type: 'block', _key: key(), style: 'normal',
    listItem: 'bullet', level: 1,
    children: parts.map((p) => ({ _type: 'span', _key: key(), text: p.text, marks: p.bold ? ['strong'] : [] })),
    markDefs: [],
  }
}
function youtube(url) {
  return { _type: 'youtubeEmbed', _key: key(), url }
}

// ── Treść artykułu ───────────────────────────────────────────────────────────
const role = [
  'Julia — Romeo i Julia (Sasha Waltz / Hector Berlioz)',
  'Giselle — Giselle (Zofia Rudnicka wg J. Perrot i J. Coralli / Adolphe Adam)',
  'Marina — Grek Zorba (Lorca Massine / Mikis Theodorakis)',
  'Ona — Harnasie (Karol Urbański / Karol Szymanowski)',
  'Chora Dziewczyna — Carmina Burana (Tamás Juronics / Carl Orff)',
  'III ruch — Displaced (Joshua Legge / Edward Elgar)',
  'Królowa Śniegu, Wróżka — Dziadek do Orzechów (Yuri Vámos / Piotr Czajkowski)',
  'Dwie Solistki — Tańce Połowieckie (Anna Krzyśków / Aleksandr Borodin)',
  'N.O.M. (Jacek Przybyłowicz / Wojciech Kilar)',
  'Ariadne — Hubris (Joshua Legge / Adrian Copeland)',
  'Duet — Piękny Rozmaryn (Giorgio Madia / Fritz Kreisler)',
  'Eurydyka — Orfeusz i Eurydyka | Słowo ciało przestrzeń (Joshua Legge / Adrian Copeland)',
  'Teresa, Leah — Casanova (Gray Veredon / Antonio Vivaldi)',
  'Duety — Bolero (Jacek Przybyłowicz / Maurice Ravel)',
  'Kobieta — Panem et Concerto (Joshua Legge / Antonio Vivaldi)',
  'Epitaph (Joshua Legge / Zbigniew Preisner)',
  'Kobieta II — Niobe (Antonina Jakubowska / Jan Gromski)',
  'Kobieta III — Górska odyseja (Monika Myśliwiec / Adam Wesołowski)',
  'Anka — Ziemia obiecana (Gray Veredon / Franz von Suppé, Michael Nyman)',
]

const tresc = [
  block('W rozmowie dla Świata Baletu Karolina zdradza kulisy pracy nad najważniejszymi rolami — Mariną w „Greku Zorbie", tytułową „Giselle" czy Julią w „Romeo i Julii" w choreografii Saszy Waltz, którą tańczyła także w Berlinie i Barcelonie. Mówi szczerze o presji i tremie, kontuzjach, o katharsis na scenie podczas „Carminy Burany", a także o życiu poza baletem i studiach, które wybrała wbrew utartym schematom.'),

  h2('W odcinku m.in.'),
  bullet('jak zaczęła się jej przygoda z tańcem (Poznań → Warszawa → Łódź)'),
  bullet('pierwsza wielka rola — Marina w „Greku Zorbie"'),
  bullet('dramaturgia i emocje w „Giselle"'),
  bullet('taniec na pochyłej scenie u Saszy Waltz'),
  bullet('co czuje na scenie w finale „Carminy Burany"'),
  bullet('czy myślała o emigracji i co planuje „po tańcu"'),

  // film YouTube (wstawiany warunkowo poniżej)

  h2('Kariera Karoliny Urbaniak'),
  block('Absolwentka Ogólnokształcącej Szkoły Baletowej im. Romana Turczynowicza w Warszawie oraz magister Zarządzania Zasobami Ludzkimi Uniwersytetu Łódzkiego. Od 2020 roku pełni funkcję ambasadorki Akademii Humanistyczno-Ekonomicznej w Łodzi. Swoje umiejętności doskonaliła, występując na międzynarodowych scenach, m.in. w wieczorze „Sacre" z zespołem Sasha Waltz & Guests, gdzie zatańczyła „Scène d’Amour" w Berlinie i Barcelonie.'),

  h3('Kariera zawodowa'),
  bulletMixed([{ text: '2016–2021', bold: true }, { text: ' — tancerka zespołu baletu Teatru Wielkiego w Łodzi' }]),
  bulletMixed([{ text: '2021–2023', bold: true }, { text: ' — koryfejka zespołu baletu Teatru Wielkiego w Łodzi' }]),
  bulletMixed([{ text: 'od 2023', bold: true }, { text: ' — solistka zespołu baletu Teatru Wielkiego w Łodzi' }]),

  h3('Najważniejsze role'),
  ...role.map((r) => bullet(r)),

  block('Dzięki swojej wszechstronności i pasji do tańca zyskała uznanie zarówno w Polsce, jak i na międzynarodowych scenach.'),
]

// Wstaw film YouTube po liście "W odcinku m.in." (po 7. elemencie: 1 akapit + h2 + 6 punktów = index 7)
if (YOUTUBE_URL) {
  tresc.splice(8, 0, youtube(YOUTUBE_URL))
} else {
  console.warn('⚠ YOUTUBE_URL puste — artykuł powstanie bez osadzonego filmu (można dodać później w Studio).')
}

// ── Główna logika ────────────────────────────────────────────────────────────
async function main() {
  // 1. Upload zdjęcia
  const imgPath = join(__dir, '..', '..', 'images', IMAGE_FILE)
  if (!existsSync(imgPath)) {
    console.error(`✗ Brak pliku zdjęcia: ${imgPath}`)
    console.error('  Zapisz baner jako images/karolina-urbaniak.jpg i uruchom ponownie.')
    process.exit(1)
  }
  console.log('Wgrywam zdjęcie (miniaturka):', imgPath)
  const asset = await client.assets.upload('image', readFileSync(imgPath), { filename: IMAGE_FILE })
  console.log('  ✓ Asset ID:', asset._id)

  // 1b. Upload okładki artykułu (opcjonalnie)
  let coverAsset = null
  const coverPath = join(__dir, '..', '..', 'images', COVER_FILE)
  if (existsSync(coverPath)) {
    console.log('Wgrywam okładkę artykułu:', coverPath)
    coverAsset = await client.assets.upload('image', readFileSync(coverPath), { filename: COVER_FILE })
    console.log('  ✓ Cover asset ID:', coverAsset._id)
  } else {
    console.warn(`⚠ Brak okładki (${COVER_FILE}) — artykuł użyje miniaturki jako zdjęcia głównego.`)
  }

  // 2. Sprawdź czy artykuł już istnieje (po slug) — jeśli tak, nadpisz
  const existing = await client.fetch('*[_type=="artykul" && slug.current==$slug][0]{_id}', { slug: SLUG })

  const doc = {
    _type: 'artykul',
    tytul: 'Karolina Urbaniak — od „Dziadka do orzechów" po solistkę Teatru Wielkiego',
    slug: { _type: 'slug', current: SLUG },
    kategoria: 'Wywiad',
    zajawka: 'Karolina Urbaniak — solistka baletu Teatru Wielkiego w Łodzi — opowiada o swojej drodze do zawodu: od dziecięcego marzenia, które zrodziło się na widowni „Dziadka do orzechów", przez jedną z najtrudniejszych szkół baletowych w Warszawie, aż po scenę w Łodzi, z którą związała się na ponad dekadę.',
    zdjecie: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: 'Karolina Urbaniak — solistka baletu Teatru Wielkiego w Łodzi',
    },
    ...(coverAsset
      ? {
          zdjecieArtykul: {
            _type: 'image',
            asset: { _type: 'reference', _ref: coverAsset._id },
            alt: 'Karolina Urbaniak w sali baletowej',
          },
        }
      : {}),
    trescGlowna: tresc,
    autor: 'Świat Baletu',
    dataPublikacji: new Date().toISOString(),
    featured: true,
    czasCzytania: 6,
    tagi: ['wywiad', 'Karolina Urbaniak', 'Teatr Wielki w Łodzi', 'balet', 'solistka'],
    bannerGlowna: false,
  }

  if (existing?._id) {
    const updated = await client.patch(existing._id).set(doc).commit()
    console.log('  ✓ Zaktualizowano istniejący artykuł:', updated._id)
  } else {
    const created = await client.create(doc)
    console.log('  ✓ Utworzono artykuł:', created._id)
  }

  console.log('\nGotowe! Adres: /artykuly/' + SLUG)
}

main().catch((err) => {
  console.error('Błąd:', err.message)
  process.exit(1)
})
