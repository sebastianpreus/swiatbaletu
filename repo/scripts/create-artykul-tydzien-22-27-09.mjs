/**
 * create-artykul-tydzien-22-27-09.mjs
 * "Tydzień w balecie" 22-27.09.2026.
 * Źródło: Google Drive, "2026-09-21_tydzien-w-balecie_artykul.md"
 * - długie myślniki zamieniane na krótkie przez dash() + bramka przed zapisem
 * - zdjęcie: images/tydzien-w-balecie-22-27-09.jpg (kadr 16:9 ze zdjęcia
 *   "Androidów" z galerii Opery Narodowej, tej samej, której używa majowy artykuł)
 * Idempotentny: po slug - patchuje istniejący.
 *
 * KOREKTY WOBEC WERSJI Z DRIVE'A (szczegóły w rozmowie):
 *  - usunięta sprzeczność: Łódź nie jest "jedynym poza Warszawą" wieczorem
 *    baletowym tygodnia, bo Sanok też nim jest
 *  - "około godziny pięćdziesięciu" -> brakowało słowa "minut"
 *  - Sanok leży u bram Bieszczadów, nie w Bieszczadach -> "na Podkarpacie"
 *  - ujednolicone "reżyseria świateł" (było raz "światła")
 *  - dopisany zweryfikowany termin: ten sam wieczór 29.09 w Katowicach
 */
import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const SLUG = 'tydzien-w-balecie-22-27-wrzesnia'
const IMAGE_FILE = 'tydzien-w-balecie-22-27-09.jpg'

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

const dash = (t) => t.replace(/[—–]/g, '-')
const key = () => Math.random().toString(36).slice(2, 10)
const block = (text, style = 'normal') => ({
  _type: 'block', _key: key(), style,
  children: [{ _type: 'span', _key: key(), text: dash(text), marks: [] }],
  markDefs: [],
})
const h2 = (t) => block(t, 'h2')
const h3 = (t) => block(t, 'h3')

const TYTUL = 'Tydzień w balecie: ostatnie „Androidy", dwie „Giselle" w różnych obsadach i wieczór dwóch choreografów w Łodzi'

const ZAJAWKA =
  'Od wtorku do niedzieli polski balet gra w czterech miastach. W Warszawie kończy się wrześniowa seria ' +
  '„Androidów" i wracają dwie „Giselle" - za każdym razem z inną obsadą. Łódź daje trzy wieczory „Bolera" ' +
  'i „Carminy Burany". Opera Śląska wiezie swoją wrześniową premierę do Sanoka, a Kraków otwiera salę ' +
  'baletową dla widzów. Do tego dwa festiwale tańca współczesnego, które kończą się w niedzielę. ' +
  'Oto cały tydzień, spektakl po spektaklu.'

const tresc = [
  h2('Wtorek 22 września'),
  h3('„Androidy" - Teatr Wielki - Opera Narodowa, Warszawa, godz. 19:00, Sala Moniuszki'),
  block('Ostatni z sześciu wrześniowych pokazów. Seria ruszyła 17 września i we wtorek się domyka - kolejnej okazji w tym sezonie teatr na razie nie zapowiedział.'),
  block('Dwuaktowy balet Roberta Bondary do muzyki Przemysława Zycha, scenografia Diana Marszałek, kostiumy Martyna Kander. Około dwóch godzin z przerwą. Rzecz dzieje się w dystopijnej przyszłości po katastrofie ekologicznej: Łowca i badaczka dr Ræ tropią świadome androidy, które zbuntowały się przeciw swoim twórcom. Im dłużej trwa pościg, tym trudniej powiedzieć, która strona jest bardziej ludzka - i to jest właściwy temat tego spektaklu.'),

  h2('Czwartek 24 i niedziela 27 września'),
  h3('„Giselle" - Teatr Wielki - Opera Narodowa, Warszawa, godz. 19:00 i 18:00, Sala Moniuszki'),
  block('Najstarszy balet romantyczny w repertuarze Polskiego Baletu Narodowego, w choreografii Jeana Coralliego i Jules\'a Perrota, w realizacji Mainy Gielgud. Scenografia i kostiumy Andrzej Kreutz Majewski, dyryguje Alexei Baklan. Dwie godziny pięć minut: akt pierwszy pięćdziesiąt minut, przerwa dwadzieścia pięć, akt drugi znowu pięćdziesiąt.'),
  block('Najciekawsze w tych dwóch wieczorach jest to, że żadna z czterech głównych ról nie powtarza się w obu obsadach. W czwartek tytułową partię tańczy Chinara Alizade, Alberta - Vladimir Yaroshenko, Mirtę - Yana Shtanhei, Hilariona - Kristóf Szabó. W niedzielę tytułową partię tańczy Jaeeun Jung, Alberta - Ryota Kitai, Mirtę - Vanessa Vestita, Hilariona - Paweł Koncewoj. Kto ma ochotę porównać dwa odczytania tej samej partii w odstępie trzech dni, ma okazję, jaka w polskim repertuarze nie zdarza się często.'),
  block('„Giselle" wraca jeszcze 1 października wieczorem i 3 października dwa razy - o 12:00 i o 19:00.'),

  h2('Piątek 25 września'),
  h3('„Szeherezada / Głód" - Opera Śląska, godz. 18:00, Sanocki Dom Kultury, 35. Festiwal im. Adama Didura'),
  block('Bytomski wieczór baletowy jedzie na Podkarpacie. To ten sam wieczór dwóch jednoaktówek, którym Opera Śląska otworzyła 12 września swój 82. sezon: „Szeherezada" Roberta Bondary do Rimskiego-Korsakowa, przeniesiona z orientalnej baśni do zimnego wnętrza zamożnego domu z kamerami monitoringu, oraz „Głód" - prapremiera w choreografii Wiktora Perdka według powieści Knuta Hamsuna, ze ścieżką zszytą z Bacha, Händla, Mozarta, Paganiniego, Masseneta, Rachmaninowa i Arvo Pärta.'),
  block('Perdek ma w tym wieczorze podwójną rolę: w „Głodzie" jest choreografem debiutującym pełnowymiarowym spektaklem, a w „Szeherezadzie" tańczy Szahrijara.'),
  block('Dzień wcześniej, w czwartek 24 września, ten sam festiwal gra „Króla Rogera". A kto nie zdąży do Sanoka, ma drugą szansę we wtorek 29 września - ten sam wieczór baletowy Opera Śląska pokazuje w Teatrze Śląskim w Katowicach.'),

  h2('Piątek 25, sobota 26 i niedziela 27 września'),
  h3('„Bolero / Carmina Burana" - Teatr Wielki w Łodzi, godz. 18:30, 18:30 i 17:00'),
  block('Jedyny wieczór baletowy tego tygodnia, który można zobaczyć trzy razy.'),
  block('Dwie części, dwóch choreografów, dwie skrajnie różne partytury. „Bolero" - choreografia i scenografia Jacka Przybyłowicza do Ravela, reżyseria świateł Kagami, multimedia Mikołaj Molenda. „Carmina Burana" - choreografia i koncepcja scenograficzna Tamása Juronicsa do Orffa, dekoracje i kostiumy Bianca Imelda Jeremias, reżyseria świateł Máté Vajda. Kierownictwo muzyczne obu części: Piotr Sułkowski. Około godziny i pięćdziesięciu minut z jedną przerwą, bilety od 60 do 120 zł w czterech strefach.'),
  block('Zestawienie jest przewrotne. Ravel napisał piętnastominutowe crescendo, w którym temat nie rozwija się ani razu - zmieniają się tylko instrumenty, a werbel nie milknie od pierwszego do ostatniego taktu. Orff po drugiej stronie przerwy daje kantatę sceniczną na chór, orkiestrę i solistów, z „O Fortuną" jako klamrą otwierającą i zamykającą całość. Jedno jest ćwiczeniem z powtórzenia, drugie z nadmiaru.'),

  h2('Niedziela 27 września'),
  h3('„Spotkania z baletem" - Opera Krakowska, godz. 17:00'),
  block('To nie jest spektakl, tylko wejście za kulisy. W programie pokazowa lekcja tańca, trzydziestominutowa próba z choreografem, pokaz etiudy baletowej, spotkanie z artystą i na koniec półgodzinne warsztaty dla publiczności. Cykl jest dofinansowany ze środków Ministra Kultury i Dziedzictwa Narodowego.'),
  block('Format rzadki i wart uwagi zwłaszcza dla tych, którzy chcieliby zobaczyć, jak wygląda codzienna praca zespołu, zanim kupią bilet na duży tytuł. Na niedzielę zostały ostatnie miejsca.'),

  h2('Dwa festiwale, które kończą się w niedzielę'),
  block('Opolska Scena Tańca - Teatr im. Jana Kochanowskiego w Opolu, do 27 września. Festiwal ruszył 20 września: dziewięć spektakli na kilku scenach teatru, warsztaty prowadzone przez polskich i zagranicznych artystów, laboratorium choreograficzne Silvii Gribaudi i immersyjna wystawa VR „Współobecność". Szczegółowy rozkład dnia teatr publikuje na swojej stronie.'),
  block('VII Warszawski Konkurs Choreograficzny - Centrum Teatru i Tańca Zawirowania, Al. Jerozolimskie 181, 26 i 27 września. Etiudy z obszaru szeroko pojętego tańca współczesnego, konkurs adresowany do twórców związanych z Warszawą. W sobotę prezentacje, w niedzielę finał. Lista finalistek i finalistów jest już ogłoszona.'),

  h2('A w operze'),
  block('Czwartek 24 września należy w Gdańsku do „Głosu Potwora" Aleksandra Nowaka (Opera Bałtycka, 19:00), a w Sanoku do „Króla Rogera" w wykonaniu Opery Śląskiej. W sobotę 26 września Teatr Wielki - Opera Narodowa gra wieczór „Gustav Mahler" (19:00), a Opera Nova w Bydgoszczy rozpoczyna dwudniową serię „La Traviaty" (26.09 o 19:00 i 27.09 o 18:00). W niedzielę Opera Śląska wraca do Bytomia z „Don Giovannim" (18:00).'),

  h2('Co potem'),
  block('Zaraz po tym tygodniu przychodzi najgęstszy baletowy weekend tej jesieni. Od 1 do 4 października balet gra jednocześnie w pięciu miastach: „Carmen" Johana Ingera w Operze Nova w Bydgoszczy (1-4.10), „Coppélia" w Operze Bałtyckiej w Gdańsku (2-4.10), „Giselle" w Warszawie (1 i 3.10), „Żywioły IV" w Operze Wrocławskiej (2 i 3.10) i „Spartakus" w Operze Śląskiej w Bytomiu (3 i 4.10). W samą sobotę 3 października pięć zespołów gra tego samego wieczoru. W Bytomiu dochodzi do tego premiera „Partytur topnienia" w Teatrze Rozbark (2 i 3.10).'),
  block('Dalej w październiku: 14 października Teatr Wielki w Poznaniu daje „Conrada" w setną rocznicę urodzin Conrada Drzewieckiego, 17 października Łódź ma premierę „Coppélii" w choreografii Juliena Guérina - tytuł wraca tam po dwudziestu sześciu latach - a 29, 30 i 31 października Opera Krakowska wznawia „Requiem" w choreografii Jacka Tyskiego. O każdym z tych tytułów napiszemy osobno.'),
  block('Pełne repertuary wszystkich polskich teatrów operowych i baletowych, z datami i linkami do biletów, znajdziecie jak zawsze na swiatbaletu.pl.'),
]

async function main() {
  const imgPath = join(__dir, '..', '..', 'images', IMAGE_FILE)
  if (!existsSync(imgPath)) { console.error('✗ Brak zdjęcia:', imgPath); process.exit(1) }
  console.log('Wgrywam zdjęcie:', imgPath)
  const asset = await client.assets.upload('image', readFileSync(imgPath), { filename: IMAGE_FILE })
  console.log('  ✓ Asset:', asset._id)

  const slowa = tresc.flatMap((b) => b.children.map((c) => c.text)).join(' ').split(/\s+/).length
  const czasCzytania = Math.max(1, Math.round(slowa / 200))

  const doc = {
    _type: 'artykul',
    tytul: dash(TYTUL),
    slug: { _type: 'slug', current: SLUG },
    kategoria: 'Aktualności',
    zajawka: dash(ZAJAWKA),
    zdjecie: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: '„Androidy" - Polski Balet Narodowy, Teatr Wielki - Opera Narodowa',
    },
    trescGlowna: tresc,
    autor: 'Redakcja Świat Baletu',
    dataPublikacji: new Date().toISOString(),
    featured: true,
    czasCzytania,
    tagi: ['repertuar', 'tydzień w balecie', 'Androidy', 'Giselle', 'Polski Balet Narodowy', 'Opera Śląska', 'Teatr Wielki w Łodzi', 'Opera Krakowska', 'festiwale'],
    bannerGlowna: false,
  }

  const dlugie = JSON.stringify(doc).match(/[—–]/g)
  if (dlugie) { console.error('✗ Zostały długie myślniki:', dlugie.length); process.exit(1) }

  const existing = await client.fetch('*[_type=="artykul" && slug.current==$slug][0]{_id}', { slug: SLUG })
  if (existing?._id) {
    await client.patch(existing._id).set(doc).commit()
    console.log('  ✓ Zaktualizowano:', existing._id)
  } else {
    const created = await client.create(doc)
    console.log('  ✓ Utworzono:', created._id)
  }
  console.log(`  ✓ ${slowa} słów, czas czytania: ${czasCzytania} min`)
  console.log('\nGotowe! Adres: /artykuly/' + SLUG)
}

main().catch((e) => { console.error('Błąd:', e.message); process.exit(1) })
