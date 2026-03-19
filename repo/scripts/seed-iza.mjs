import { createClient } from 'next-sanity'
import { readFileSync } from 'fs'
import { config } from 'dotenv'
config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

let keyCounter = 0
function rk() { return 'k' + Date.now().toString(36) + (keyCounter++).toString(36) }

async function uploadFile(path, filename) {
  const buf = readFileSync(path)
  console.log('  Upload', filename, (buf.length / 1024).toFixed(0), 'KB')
  return client.assets.upload('image', buf, { filename })
}

function block(style, text) {
  const children = []
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      children.push({ _type: 'span', _key: rk(), text: part.slice(2, -2), marks: ['strong'] })
    } else if (part) {
      children.push({ _type: 'span', _key: rk(), text: part, marks: [] })
    }
  }
  return { _type: 'block', _key: rk(), style, children, markDefs: [] }
}

function imgBlock(assetId, alt) {
  return { _type: 'image', _key: rk(), asset: { _type: 'reference', _ref: assetId }, alt }
}

const imgDir = 'C:/Users/Sebastian/CLAUDE/IzabelaSokolowska/repo/images'

async function main() {
  console.log('=== Uploading images ===')
  const heroAsset = await uploadFile(imgDir + '/hero-main.jpg', 'iza-portret.jpg')
  const galAssets = []
  for (let i = 1; i <= 6; i++) {
    const a = await uploadFile(imgDir + '/gallery-0' + i + '.jpg', 'iza-gallery-0' + i + '.jpg')
    galAssets.push(a)
  }

  const captions = [
    'Królewski Teatr Duński, 2005',
    'Konkurs Baletowy w Warnie, 2002',
    'Opera Bałtycka, Don Kichot, 2023',
    'Sesja portretowa, Gdańsk',
    'Próba, Opera Bałtycka, 2024',
    'La Sylphide, Kopenhaga, 2004',
  ]

  console.log('\n=== Creating sylwetka ===')
  const bioBlocks = [
    block('h2', 'Izabela Sokołowska-Boulton \u2014 od złota Warny do gdańskiej sceny'),
    block('h3', 'Narodziny talentu'),
    block('normal', 'Izabela Sokołowska-Boulton urodziła się w 1984 roku w Gdańsku. Miała osiem lat, gdy do jej klasy w gdańskiej podstawówce przyszła pani ze szkoły baletowej szukając dzieci z predyspozycjami. Od 1994 roku była uczennicą Szkoły Baletowej w Gdańsku \u2014 codzienne treningi, rygor i nauczyciele, którzy nie znali słowa \u201ewystarczająco\u201d. Dla Izabeli był to właśnie ten rodzaj presji, który zamieniała w napęd.'),
    block('normal', 'Prawdziwy przełom nastąpił latem 2002 roku w Warnie, w Bułgarii. Międzynarodowy Konkurs Baletowy w Warnie \u2014 zwany olimpiadą baletu \u2014 gromadzi co dwa lata najzdolniejszych tancerzy z całego świata. Trzy tygodnie prób, dziesiątki konkurentów. Kiedy zobaczyła swoje nazwisko na samej górze tablicy wyników, wiedziała że coś właśnie się zmieniło. Złoty medal \u2014 do dziś pozostaje jedyną Polką z tym wyróżnieniem.'),
    imgBlock(heroAsset._id, 'Izabela Sokołowska-Boulton'),
    block('h3', 'Kopenhaga \u2014 solistka Królewskiego Teatru Duńskiego'),
    block('normal', 'Mając siedemnaście lat, Izabela wsiadła sama na prom w Gdańsku. Bez konsultacji z rodzicami, bez planu B. Prosto z promu trafiła do Królewskiego Teatru Duńskiego w Kopenhadze \u2014 jednej z najstarszych i najbardziej prestiżowych scen baletowych na świecie, z tradycją sięgającą XVIII wieku i dziedzictwem Augusta Bournonville\u2019a.'),
    block('normal', 'Podpisała kontrakt na miejscu. W 2005 roku awansowała na solistkę. Tańczyła główne partie w repertuarze klasycznym i współczesnym: Caroline Mathilde w Livl\u00e6gen bes\u00f8g, Nausikaa w Odyssey, Klarę w Dziadku do orzechów, tytułową Sylfidę w La Sylphide Bournonville\u2019a. Pracowała z najwybitniejszymi choreografami współczesności \u2014 Williamem Forsythe\u2019em, Ji\u0159\u00edm Kyli\u00e1nem, Sidi Larbi Cherkaoui, Johnem Neumeierem i Alexeiem Ratmanskym.'),
    imgBlock(galAssets[0]._id, 'Izabela Sokołowska-Boulton \u2014 Królewski Teatr Duński'),
    block('h3', 'Nagrody i wyróżnienia'),
    block('normal', 'Oprócz złotego medalu w Warnie, Izabela otrzymała Gryfa Pomorskiego \u2014 nagrodę Marszałka Województwa Pomorskiego za wybitne osiągnięcia, odznakę honorową \u201eZasłużony dla Kultury Polskiej\u201d przyznaną przez Ministerstwo Kultury i Dziedzictwa Narodowego, a także stypendium Ministra Kultury. Jej osiągnięcia wielokrotnie były opisywane w polskiej i duńskiej prasie.'),
    block('h3', 'Powrót do Gdańska'),
    block('normal', 'Po latach spędzonych za granicą Izabela wróciła do rodzinnego Gdańska \u2014 miasta, z którego kiedyś uciekła na prom do Kopenhagi. Ukończyła pedagogikę baletu na Uniwersytecie Muzycznym Fryderyka Chopina w Warszawie i objęła stanowisko Kierownika Baletu i Choreografa w Operze Bałtyckiej w Gdańsku.'),
    block('normal', 'Dziś tworzy choreografie na wielką scenę \u2014 ostatnio Don Kichota Ludwiga Minkusa. Przekazuje swoje doświadczenie i pasję nowej generacji tancerzy. Na swoim Instagramie opisuje siebie jednym słowem: Survivor.'),
  ]

  const sylwetkaDoc = {
    _id: 'sylwetka-sokolowska-boulton',
    _type: 'sylwetka',
    imieNazwisko: 'Izabela Sokołowska-Boulton',
    slug: { _type: 'slug', current: 'izabela-sokolowska-boulton' },
    rola: 'Choreograf',
    teatrGlowny: 'Opera Bałtycka w Gdańsku',
    narodowosc: 'Polska',
    dataUrodzenia: '1984-01-01',
    aktywny: true,
    polskiArtysta: true,
    wyroznienie: true,
    najwazniejszeRole: ['Sylfida (La Sylphide)', 'Clara (Dziadek do orzechów)', 'Caroline Mathilde', 'Nausikaa (Odyssey)', 'Kitri (Don Kichot)'],
    zdjecie: { _type: 'image', asset: { _type: 'reference', _ref: heroAsset._id } },
    bio: bioBlocks,
    galeria: galAssets.map((a, i) => ({
      _type: 'image',
      _key: rk(),
      asset: { _type: 'reference', _ref: a._id },
      alt: captions[i],
      caption: captions[i],
    })),
  }

  await client.createOrReplace(sylwetkaDoc)
  console.log('\u2713 Sylwetka Izabeli zapisana')

  // Featured article
  console.log('\n=== Creating featured article ===')
  const articleBlocks = [
    block('normal', 'Gdańsk, Wybrzeże, szara codzienność lat dziewięćdziesiątych \u2014 nieoczywiste tło dla przyszłej gwiazdy światowego baletu. A jednak właśnie stąd wyszła jedna z najwybitniejszych polskich baletnic swojego pokolenia. Izabela Sokołowska-Boulton, jedyna Polka ze złotym medalem Międzynarodowego Konkursu Baletowego w Warnie, solistka Królewskiego Teatru Duńskiego w Kopenhadze, a dziś Kierownik Baletu Opery Bałtyckiej w rodzinnym mieście.'),
    block('h2', 'Od gdańskiej szkoły do olimpiady baletu'),
    block('normal', 'Wszystko zaczęło się od przypadku \u2014 miała osiem lat, gdy szkoła baletowa szukała talentów w jej podstawówce. Od 1994 roku codziennie treningi w Szkole Baletowej w Gdańsku. W 2002 roku, mając osiemnaście lat, zdobyła złoty medal w Warnie \u2014 najbardziej prestiżowym konkursie baletowym na świecie. Do dziś żadna inna Polka nie powtórzyła tego osiągnięcia.'),
    imgBlock(galAssets[1]._id, 'Izabela Sokołowska-Boulton \u2014 Konkurs w Warnie'),
    block('h2', 'Kopenhaga \u2014 siedemnaście lat i bilet w jedną stronę'),
    block('normal', 'Z medalem w kieszeni i pluszakiem pod pachą wsiadła na prom do Danii. Królewski Teatr Duński \u2014 scena z tradycją sięgającą XVIII wieku, dziedzictwem Bournonville\u2019a \u2014 stał się jej artystycznym domem. W 2005 roku awansowała na solistkę. Tańczyła z najlepszymi, pracowała pod okiem Forsythe\u2019a, Kyli\u00e1na, Cherkaoui, Neumeiera.'),
    imgBlock(galAssets[4]._id, 'Izabela Sokołowska-Boulton \u2014 próba w Operze Bałtyckiej'),
    block('h2', 'Nowy rozdział w Gdańsku'),
    block('normal', 'Po latach za granicą wróciła tam, skąd wyszła. Ukończyła pedagogikę baletu na UMFC i objęła kierownictwo baletu w Operze Bałtyckiej. Tworzy nowe choreografie \u2014 w tym Don Kichota Minkusa \u2014 i kształci następne pokolenie polskich tancerzy. Na Instagramie opisuje siebie jednym słowem: Survivor. I trudno o lepsze podsumowanie jej niezwykłej drogi.'),
  ]

  const articleDoc = {
    _id: 'art-sokolowska-boulton',
    _type: 'artykul',
    tytul: 'Izabela Sokołowska-Boulton \u2014 jedyna Polka ze złotem Warny',
    slug: { _type: 'slug', current: 'izabela-sokolowska-boulton' },
    kategoria: 'Aktualności',
    zajawka: 'Od gdańskiej szkoły baletowej przez olimpiadę baletu w Warnie i scenę Królewskiego Teatru Duńskiego do kierowania baletem Opery Bałtyckiej. Historia jedynej Polki ze złotym medalem najważniejszego konkursu baletowego świata.',
    zdjecie: { _type: 'image', asset: { _type: 'reference', _ref: heroAsset._id }, alt: 'Izabela Sokołowska-Boulton' },
    trescGlowna: articleBlocks,
    autor: 'Redakcja Świat Baletu',
    dataPublikacji: '2026-03-19T10:00:00Z',
    featured: true,
    czasCzytania: 5,
    tagi: ['Izabela Sokołowska-Boulton', 'Opera Bałtycka', 'Gdańsk', 'Warna', 'balet'],
  }

  await client.createOrReplace(articleDoc)
  console.log('\u2713 Artykuł wyróżniony o Izabeli zapisany')
  console.log('\nGotowe!')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
