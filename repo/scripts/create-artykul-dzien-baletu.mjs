/**
 * create-artykul-dzien-baletu.mjs
 * Światowy Dzień Baletu 2026 (29 października).
 * Źródło: Google Drive, "2026-10-29 - Światowy Dzień Baletu (artykuł + post IG)".
 *
 * KOREKTY WOBEC WERSJI Z DRIVE'A (sprawdzone u źródeł 29.10.2026):
 *
 *  - SEKCJA "CZEGO NIE WIEMY" WYLECIAŁA W CAŁOŚCI. Brief pisał, że przy wpisie
 *    PBN widnieje "Programmes to be announced", a w aktualnościach Teatru
 *    Wielkiego nie ma nic o tegorocznej edycji - i sam ostrzegał, że to jedyny
 *    akapit, który może zdezaktualizować się w ciągu godzin. Zdezaktualizował
 *    się: teatr opublikował wpis "World Ballet Day 2026" datowany na dziś.
 *    PBN pokazuje kulisy przygotowań do "Coppélii" Manuela Legrisa i sztukę
 *    pantomimy baletowej. Akapit o niewiedzy zastąpiony konkretem, który przy
 *    okazji trafia prosto w hasło edycji i linkuje do naszych dwóch tekstów
 *    o "Coppélii".
 *
 *  - "DZIEWIĘĆ POZOSTAŁYCH DZIŚ NIE ISTNIEJE" - zdanie zmienione. Brief sam je
 *    oznaczył jako publicystyczne. Problem nie w ostrości, tylko w tym, że jest
 *    nieprawdziwe: te teatry dziś pracują, część gra. Teza dotyczy transmisji
 *    z sal prób, nie istnienia, i tak została sformułowana.
 *
 *  - DRZEWIECKI, SETNA ROCZNICA. Brief opisywał poznański wieczór 11 listopada
 *    bez podania powodu. Powód jest mocny: Conrad Drzewiecki urodził się
 *    14 października 1926, teatr gra ten program w setną rocznicę urodzin.
 *
 *  - LISTOPAD UZUPEŁNIONY o "Coppélię" w Łodzi (14 i 15 listopada). Brief ją
 *    pominął, a pisaliśmy o niej dwa razy - bez niej lista listopadowa
 *    wyglądała na chudszą, niż jest.
 *
 * CO SPRAWDZONE I ZGODNE Z BRIEFEM:
 *  - data, hasło, 45 pozycji na liście, PBN jedynym polskim zespołem
 *    - worldballetday.com
 *  - start transmisji The Royal Ballet 11:30 czasu brytyjskiego. Od 25.10
 *    Wielka Brytania jest na GMT, Polska na CET, więc 12:30 u nas - zgadza się
 *  - "Requiem" w Krakowie 29 i 30.10 o 18:30, 31.10 o 17:00, powrót 21, 23
 *    i 24 marca 2027 - nasz repertuar, zgodne ze stroną teatru
 *  - "Balladyna", prapremiera światowa 15.11, chor. i reż. Monika Myśliwiec,
 *    muzyka Chopina - opera.krakow.pl
 *  - siedem "Snów nocy letniej" we Wrocławiu 14-21.11 - nasz repertuar
 *  - poznański wieczór 11.11, godz. 18:00, cztery choreografie Drzewieckiego,
 *    dyr. Marta Kluczyńska, bilety 1 zł od 3.11 od 13:00 - opera.poznan.pl
 *
 * CO SPRAWDZONE I ODRZUCONE:
 *  - Teza "dziś gra dokładnie jeden balet" wymagała przejrzenia całego
 *    dzisiejszego afisza. Dwie pozycje wyglądały podejrzanie: "Pchła
 *    Szachrajka" we Wrocławiu (2 pokazy) i "Piotruś Pan i Wanda"
 *    w Bydgoszczy. Pierwsza to spektakl dla dzieci ze śpiewakami do muzyki
 *    Macieja Małeckiego, druga to musical - Opera Nova trzyma go pod adresem
 *    /spektakle/musical/. Teza się broni, ale nie na słowo.
 *
 * OKŁADKA: images/dzien-baletu-okladka.jpg, 2000x1125, złożona przez redakcję.
 * Powstało kilka wersji generowanych skryptem scripts/karta-rozciagnieta.py,
 * ale ostateczny kadr Sebastian złożył sam i to jego wgrywamy. Skrypt zostaje
 * w repozytorium, bo układ "zdjęcie pionowe po lewej, tekst na rozjaśnionym
 * przedłużeniu po prawej" jeszcze się przyda - razem z tym, czego się przy
 * nim nauczyliśmy: gradient nie może wchodzić na fotografię, a żeby mógł
 * wygaszać cokolwiek poza nią, kadr trzeba najpierw przedłużyć kolorem
 * własnej krawędzi, liczonym osobno dla każdego wiersza.
 *
 * UWAGA: brak podpisu autora zdjęcia - do uzupełnienia w polu `zrodlo`.
 */
import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const SLUG = 'swiatowy-dzien-baletu-2026'

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
const span = (text, marks = []) => ({ _type: 'span', _key: key(), text: dash(text), marks })
const block = (text, style = 'normal') => ({
  _type: 'block', _key: key(), style, children: [span(text)], markDefs: [],
})
const h2 = (t) => block(t, 'h2')
const blockZLinkiem = (przed, tekstLinku, href, po) => {
  const k = key()
  return {
    _type: 'block', _key: key(), style: 'normal',
    markDefs: [{ _key: k, _type: 'link', href }],
    children: [span(przed), span(tekstLinku, [k]), span(po)],
  }
}

const TYTUL = 'Światowy Dzień Baletu. Polska ma na liście jeden zespół i na afiszu jeden spektakl'

const ZAJAWKA =
  'Dziś, 29 października, zespoły baletowe z czterech kontynentów otwierają sale prób i pokazują online, ' +
  'jak powstaje spektakl. Na oficjalnej liście jest czterdzieści pięć pozycji. Polski zespół jest wśród nich jeden. ' +
  'Na polskich scenach gra dziś jeden balet.'

const tresc = [
  h2('Co to właściwie jest'),
  block('Światowy Dzień Baletu wymyślono w 2014 roku jako transmisję dookoła świata. Pięć zespołów przekazywało sobie sygnał kolejno, według stref czasowych: The Royal Ballet, The Australian Ballet, San Francisco Ballet, Balet Bolszoj i The National Ballet of Canada. Pomysł był prosty - zamiast pokazywać gotowy spektakl, pokazać to, czego widz nigdy nie widzi: poranną klasę, próbę, poprawianie tego samego fragmentu po raz dziesiąty.'),
  block('Formuła od tamtej pory się rozluźniła. Dziś każdy zespół nadaje u siebie, we własnej strefie czasowej, na własnych kanałach. Oglądanie jest bezpłatne.'),
  block('Hasło tegorocznej edycji brzmi „How Stories Are Made" - jak powstają historie. The Royal Ballet, który prowadzi główną transmisję, poświęcił trzy godziny temu, jak wiedza o spektaklu przechodzi z pokolenia na pokolenie: od klasy porannej prowadzonej na żywo z Royal Opera House, przez próby, po rozmowy z byłymi tancerzami i korepetytorami. Start o 11:30 czasu brytyjskiego, czyli 12:30 u nas. Transmisja ma tłumaczenie na język migowy i audiodeskrypcję. Przy okazji wypada stulecie The Royal Ballet School.'),

  h2('Kto gra'),
  block('Na liście uczestników jest czterdzieści pięć pozycji, choć nie wszystkie to zespoły baletowe - są wśród nich szkoły i organizacje branżowe, jak Royal Academy of Dance, ISTD czy The Royal Ballet School. Magazyn „Pointe" liczy czterdzieści trzy zespoły.'),
  block('Z Europy jest jedenaście: Les Ballets de Monte-Carlo, Dutch National Ballet, Fiński Balet Narodowy, Norweski Balet Narodowy, Balet Opery Paryskiej, Polski Balet Narodowy, Królewski Balet Duński, Staatsballett Hannover, Stuttgart Ballet, Teatro alla Scala i Wiedeński Balet Państwowy.'),
  block('Polski Balet Narodowy jest jedynym polskim zespołem na tej liście. Nie pierwszy raz - brał udział między innymi w edycjach 2017, 2021 i 2022.'),

  h2('Co pokazuje Polski Balet Narodowy'),
  block('Jeszcze wczoraj przy wpisie polskiego zespołu widniała adnotacja, że program zostanie ogłoszony. Dziś Teatr Wielki - Opera Narodowa ogłosił, co pokazuje: kulisy przygotowań do „Coppélii" w choreografii Manuela Legrisa oraz sztukę pantomimy baletowej, dzięki której tancerze opowiadają historie gestem, bez słowa. „Dziękujemy The Royal Ballet za zaproszenie" - dopisał teatr.'),
  block('Trudno o lepsze trafienie w tegoroczne hasło. Pantomima jest dokładnie tym miejscem, w którym balet przestaje być układem ruchów, a zaczyna być opowiadaniem - i jest zarazem tą częścią warsztatu, której współczesny widz najczęściej nie rozumie, bo nikt mu jej nigdy nie wytłumaczył.'),
  blockZLinkiem('Premiera „Coppélii" w Warszawie jest 6 grudnia. O trzech polskich inscenizacjach tego baletu w jednym sezonie pisaliśmy w tekście ', 'Trzy „Coppélie" w jednym sezonie', 'https://swiatbaletu.pl/artykuly/trzy-coppelie-w-jednym-sezonie', '.'),
  blockZLinkiem('A o tym, co balet wziął z opowiadania Hoffmanna, a czego nie wziął - w tekście ', 'Balet kończy się weselem', 'https://swiatbaletu.pl/artykuly/coppelia-i-piaskun-co-balet-wzial-od-hoffmanna', '.'),

  h2('A na scenie'),
  block('Na afiszu polskich teatrów operowych jest dziś dokładnie jedna pozycja baletowa: „Requiem" w Operze Krakowskiej, godz. 18:30.'),
  block('Choreografia i reżyseria Jacek Tyski, do „Requiem" d-moll Mozarta - tego, które kompozytor zostawił nieukończone i które dokończyli Joseph Eybler i Franz Xaver Süssmayr. Kierownictwo muzyczne Marc Moncusi, dyryguje Zbigniew Graca, scenografia Stefania Chiarelli, kostiumy Marta Koncewoj, światła Paweł Murlik, projekcja Piotr Bednarczyk. Godzina bez przerwy. Premiera była 28 lutego tego roku.'),
  block('Spektakl gra jeszcze jutro o 18:30 i w sobotę o 17:00, a potem wraca dopiero 21, 23 i 24 marca. W sobotę dochodzi do tego „Symfonia tańca bis" w Warszawie - i to tyle do końca miesiąca.'),

  h2('Co z tego wynika'),
  block('Nic dramatycznego, i warto to powiedzieć wprost: jeden spektakl w dniu świętowania baletu nie jest dowodem na zapaść. Balet w polskich teatrach idzie seriami - tygodnie pustki, potem osiem pokazów w dwa tygodnie.'),
  block('Listopad to pokaże. Prapremiera światowa „Balladyny" w Krakowie 15 listopada, w choreografii i reżyserii Moniki Myśliwiec do muzyki Chopina. Siedem „Snów nocy letniej" we Wrocławiu w ciągu ośmiu dni. „Coppélia" w Łodzi 14 i 15 listopada. „Giselle" w Gdańsku pod koniec miesiąca, cztery razy.'),
  block('A 11 listopada w Poznaniu wieczór, który wart jest osobnej uwagi: Balet Teatru Wielkiego tańczy cztery choreografie Conrada Drzewieckiego - „Odwieczne pieśni" Karłowicza, „Etiudę b-moll" Szymanowskiego, „Adagio" Albinoniego i „Krzesanego" Kilara - pod batutą Marty Kluczyńskiej. Drzewiecki urodził się 14 października 1926 roku w Poznaniu, więc teatr gra ten program w setną rocznicę urodzin człowieka, który stworzył Polski Teatr Tańca i przestawił polski taniec na współczesne tory. Bilety po złotówce, sprzedaż rusza 3 listopada o 13:00.'),
  block('Ale dzisiejszy dzień jest dobrą okazją, żeby zapytać o coś innego. Światowy Dzień Baletu polega na pokazywaniu pracy, a nie efektu - na wpuszczeniu widza na salę prób. Zespoły baletowe ma w Polsce dziesięć teatrów operowych. Na światowej liście jest jeden z nich. Pozostałe dziewięć nie pokazuje dziś niczego, i nie dlatego, że nie mają czego pokazać.'),
  blockZLinkiem('Pełne repertuary wszystkich polskich teatrów operowych i baletowych, z datami i godzinami, zbieramy w jednym miejscu: ', 'swiatbaletu.pl/repertuar', 'https://swiatbaletu.pl/repertuar', '.'),
]

async function wgraj(nazwa) {
  const p = join(__dir, '..', '..', 'images', nazwa)
  if (!existsSync(p)) { console.error('✗ Brak zdjęcia:', p); process.exit(1) }
  const asset = await client.assets.upload('image', readFileSync(p), { filename: nazwa })
  console.log('  ✓', nazwa, '->', asset._id)
  return asset._id
}

async function main() {
  console.log('Wgrywam okładkę:')
  const okladka = await wgraj('dzien-baletu-okladka.jpg')

  const slowa = tresc.filter((b) => b._type === 'block')
    .flatMap((b) => b.children.map((c) => c.text)).join(' ').split(/\s+/).length
  const czasCzytania = Math.max(1, Math.round(slowa / 200))

  const doc = {
    _type: 'artykul',
    tytul: dash(TYTUL),
    slug: { _type: 'slug', current: SLUG },
    kategoria: 'Aktualności',
    zajawka: dash(ZAJAWKA),
    zdjecie: {
      _type: 'image',
      asset: { _type: 'reference', _ref: okladka },
      alt: 'Tancerka w białej spódnicy na pointach w jasnej sali prób',
    },
    trescGlowna: tresc,
    autor: 'Redakcja Świat Baletu',
    dataPublikacji: new Date().toISOString(),
    featured: true,
    czasCzytania,
    tagi: [
      'Światowy Dzień Baletu', 'World Ballet Day', 'Polski Balet Narodowy', 'The Royal Ballet',
      'Opera Krakowska', 'Jacek Tyski', 'Requiem', 'Conrad Drzewiecki', 'Coppélia',
    ],
    bannerGlowna: false,
  }

  const dlugie = JSON.stringify(doc).match(/[—–]/g)
  if (dlugie) { console.error('✗ Zostały długie myślniki:', dlugie.length); process.exit(1) }

  const existing = await client.fetch('*[_type=="artykul" && slug.current==$slug][0]{_id, dataPublikacji}', { slug: SLUG })
  if (existing?._id) {
    if (existing.dataPublikacji) doc.dataPublikacji = existing.dataPublikacji
    await client.patch(existing._id).set(doc).commit()
    console.log('\n  ✓ Zaktualizowano:', existing._id)
  } else {
    const created = await client.create(doc)
    console.log('\n  ✓ Utworzono:', created._id)
  }
  console.log(`  ✓ ${slowa} słów, czas czytania: ${czasCzytania} min`)
  console.log('\nGotowe! Adres: /artykuly/' + SLUG)
}

main().catch((e) => { console.error('Błąd:', e.message); process.exit(1) })
