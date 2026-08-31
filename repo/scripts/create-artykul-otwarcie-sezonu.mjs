/**
 * create-artykul-otwarcie-sezonu.mjs
 * Artykuł "Kurtyna w górę..." (otwarcie sezonu 2026/27) w Sanity.
 * Źródło: Google Drive / Publikacje / "2026-08-31 - Otwarcie sezonu 2026/27 (artykuł + post IG)"
 * - długie myślniki (—, –) zamieniane na krótkie "-" automatycznie przez dash()
 * - zdjęcie główne: images/otwarcie-sezonu-2026-27.jpg (1600x900)
 * - featured: true + dzisiejsza data => trafia na hero strony głównej
 * KOREKTA 31.08: brief z 28.08 przypisywał Operze Bałtyckiej "Karnawał zwierząt"
 * i "Kopciuszka" - żadnego z nich nie ma w jej repertuarze 2026/27 (brief powstał
 * bez odczytu przyszłych miesięcy, patrz sekcja "PROBLEM TECHNICZNY" w logu 28.08).
 * Zamienione na "Fantazję i Fortunę" (3-10.04.2027, potwierdzone w Supabase).
 * KOREKTA 31.08 (2): "Amerykanin w Paryżu" nie jest pierwszym pełnospektaklowym
 * baletem sezonu - "Androidy" w TW-ON grają tego samego dnia i o tej samej
 * godzinie (17.09.2026, 17:00). Teza zdjęta, zdanie przeredagowane.
 * Idempotentny: po slug - patchuje istniejący.
 */
import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const SLUG = 'kurtyna-w-gore-otwarcie-sezonu-2026-27'
const IMAGE_FILE = 'otwarcie-sezonu-2026-27.jpg'

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

// Długie myślniki (em i en dash) na krótkie - wymóg redakcyjny.
const dash = (t) => t.replace(/[—–]/g, '-')

const key = () => Math.random().toString(36).slice(2, 10)
const block = (text, style = 'normal') => ({
  _type: 'block', _key: key(), style,
  children: [{ _type: 'span', _key: key(), text: dash(text), marks: [] }],
  markDefs: [],
})
const h2 = (t) => block(t, 'h2')
const h3 = (t) => block(t, 'h3')

const TYTUL = 'Kurtyna w górę. Polskie teatry wracają po wakacjach — oto czym otwierają sezon 2026/27'

const ZAJAWKA =
  'Przez dwa miesiące sceny milczały. Tancerze regenerowali ciała, krawcowe szyły kostiumy, ' +
  'w magazynach powstawały dekoracje do jesiennych premier. Teraz ta cisza dobiega końca. ' +
  'We wrześniu polskie teatry operowe podnoszą kurtynę — i robią to z rozmachem: sezon baletowy ' +
  'startuje w sześciu miastach w ciągu zaledwie sześciu tygodni.'

const tresc = [
  h2('Zanim zabrzmi pierwszy takt'),
  block('Powrót po przerwie to nie tylko premiery. Kilka teatrów postanowiło w tym roku pokazać widzom to, czego zwykle nie widać — codzienną pracę zespołu.'),
  block('Opera Bałtycka w Gdańsku już 12 i 13 września otwiera drzwi sali baletowej w ramach Ballet Open Studio — publiczność może obejrzeć poranną lekcję i próby zespołu, zanim ten wyjdzie na scenę. Kilka dni później, 17 września, w Gdańsku rusza OKNO — Otwarty Klub Naukowy Opery. W Krakowie podobną formułę proponuje Opera Krakowska: Spotkania z baletem zaplanowano na 27 września.'),
  block('Sezon otwiera się też zmianami kadrowymi. Od 1 września dyrekcję Teatru Wielkiego w Poznaniu obejmuje Adam Banaszak, a w bytomskim Teatrze Rozbark Annę Piotrowską po siedmiu latach zastępuje Karolina Staneczek-Pucher. W Warszawie do programu PBN Junior — dwuletniego pomostu między szkołą a zespołem zawodowym — zgłosiło się pięciuset kandydatów. Miejsc jest dwanaście.'),

  h2('Kalendarz otwarć — teatr po teatrze'),

  h3('Warszawa — Polski Balet Narodowy, 12–13 września'),
  block('Sezon w Teatrze Wielkim – Operze Narodowej otwiera Gala baletowa na Sali Moniuszki, pod batutą Yoela Gamzou. Obok tancerzy PBN wystąpią goście z trzech największych scen Europy: Bleuenn Battistoni i Paul Marque z Opery Paryskiej, Mayara Magri i Matthew Ball z Royal Ballet oraz Nicoletta Manni i Timofej Andrijashenko z La Scali. Oba wieczory są już wyprzedane. Zaraz potem — sześć spektakli „Androidów" Roberta Bondary (17–22 września) i wznowienie „Giselle" w inscenizacji Mainy Gielgud (24 i 27 września, 1 i 3 października).'),

  h3('Bydgoszcz — Opera Nova, 17–20 września'),
  block('Tego samego wieczoru co warszawskie „Androidy" na scenę wchodzi „Amerykanin w Paryżu" do muzyki Gershwina - cztery wieczory z rzędu. 17 września sezon baletowy rusza więc w dwóch miastach naraz.'),

  h3('Gdańsk — Opera Bałtycka, 2–4 października'),
  block('Po wrześniowych otwartych próbach pierwszym baletem na gdańskiej scenie będzie „Coppélia" w choreografii Johana Kobborga — byłego pierwszego tancerza Royal Ballet i Duńskiego Baletu Królewskiego. Scenografia inspirowana obrazami Chagalla, kierownictwo muzyczne Luis Gorelik. W dalszej części sezonu m.in. „Giselle" (26–29 listopada), „Cztery pory roku", „Don Kichot" i „Fantazja i Fortuna".'),

  h3('Wrocław — Opera Wrocławska, 2–3 października'),
  block('Sezon otwiera „Żywioły IV" — wieczór choreografów, w którym młodzi twórcy pokazują własne prace. W listopadzie aż siedem spektakli „Snu nocy letniej" w ciągu tygodnia.'),

  h3('Poznań — Teatr Wielki, 14 października'),
  block('Pierwszy sezon nowego dyrektora rozpoczyna balet „Conrad" — w setną rocznicę urodzin Conrada Drzewieckiego, reformatora polskiego tańca, którego wspominaliśmy w tym roku już kilkakrotnie.'),

  h3('Łódź — Teatr Wielki, 17 października'),
  block('Sezon jubileuszowy 60-lecia teatru otwiera premiera „Coppélii" w choreografii Juliena Guerina — tytuł wraca do Łodzi po 26 latach. Scenografia Roland Fontaine, kostiumy Charles de Vilmorin, dyryguje — tak, ten sam — Luis Gorelik. W listopadzie na scenę wraca też „Supernova" (21–22 listopada).'),

  h3('Kraków — Opera Krakowska, 15 listopada'),
  block('Najpóźniej, ale z autorską premierą: „Balladyna" według Słowackiego w choreografii Moniki Myśliwiec. Wcześniej, 29–31 października, „Requiem".'),

  h3('Bytom — Opera Śląska, 21 listopada'),
  block('Wieczór jubileuszowy „Henryk Konwiński — życie i twórczość", hołd dla choreografa, który przez dekady kształtował balet na Śląsku.'),

  h2('Nie tylko balet'),
  block('Sezon operowy również rusza z rozmachem. Opera Wrocławska otwiera go już 5 września prapremierą „GenOM" Michała Ziółkowskiego, która inauguruje powracający po dziewięciu latach Festiwal Opery Współczesnej; w grudniu czeka nas tam nowa inscenizacja „Rigoletta" w reżyserii Michała Znanieckiego. W Gdańsku wrzesień należy do „Madame Butterfly" (11–13 września) i nowego tytułu — „Głosu potwora" Aleksandra Nowaka (20 i 24 września). Ten sam kompozytor otworzy sezon w Poznaniu prapremierą „Księgi dziwnych nowych rzeczy", a w październiku Teatr Wielki gości IV Festiwal Moniuszkowski. Łódź w sezonie jubileuszowym szykuje na koniec listopada premierę „Otella" Verdiego (28–29 listopada). O wszystkich tych tytułach będziemy pisać osobno.'),

  h2('Motyw sezonu: trzy „Coppélie"'),
  block('Jeśli szukać wątku, który spina ten sezon, jest nim „Coppélia" Delibesa — balet o lalce tak doskonałej, że mylono ją z człowiekiem. W ciągu dziewięciu tygodni zobaczymy trzy zupełnie różne wersje: Gdańsk (2–4 października) w tradycji duńsko-brytyjskiej Kobborga, Łódź (17 października) w ujęciu Guerina, a 6 grudnia Warszawa — światowa prapremiera choreografii Manuela Legrisa, byłego étoile Opery Paryskiej, przygotowanej specjalnie dla Polskiego Baletu Narodowego. Jeden tytuł, trzy podpisy, trzy szkoły. Będziemy je porównywać.'),

  h2('Wrzesień festiwali'),
  block('Zanim teatry rozkręcą się na dobre, scenę przejmuje taniec współczesny. Trzy festiwale nachodzą na siebie niemal dzień w dzień: 18. Gdański Festiwal Tańca (12–20 września, Klub Żak i Teatr Szekspirowski, z Solo Dance Contest i zespołami z Francji, Szwajcarii, Armenii), 9. Polska Platforma Tańca we Wrocławiu (17–20 września, dziewięć spektakli konkursowych, jury z pięciu krajów, ponad 150 zagranicznych kuratorów) oraz Opolska Scena Tańca (20–27 września, dziewięć spektakli, warsztaty, laboratorium Silvii Gribaudi).'),

  h2('Do zobaczenia w teatrze'),
  block('Lato było czasem ciszy — potrzebnej, jak pisaliśmy w lipcu. Teraz cisza się kończy. Pełne repertuary wszystkich polskich teatrów operowych, z datami i linkami do biletów, znajdziecie jak zawsze na swiatbaletu.pl. Do zobaczenia na widowni.'),
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
      alt: 'Zespół baletowy podczas porannej lekcji w sali baletowej',
    },
    trescGlowna: tresc,
    autor: 'Redakcja Świat Baletu',
    dataPublikacji: new Date().toISOString(),
    featured: true,
    czasCzytania,
    tagi: ['sezon 2026/27', 'otwarcie sezonu', 'Polski Balet Narodowy', 'Opera Bałtycka', 'Coppélia', 'Giselle', 'premiery', 'repertuar', 'opera'],
    bannerGlowna: false,
  }

  // Kontrola: żaden długi myślnik nie może przejść do Sanity.
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
