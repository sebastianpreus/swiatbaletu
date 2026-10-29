/**
 * create-artykul-dzien-baletu.mjs
 * Światowy Dzień Baletu 2026 (29 października).
 * Źródło: Google Drive, "2026-10-29 - Światowy Dzień Baletu (artykuł + post IG)".
 *
 * DECYZJA REDAKCYJNA: TEKST JEST ŚWIĄTECZNY, NIE ROZLICZENIOWY.
 * Brief z Drive'a budował całość wokół tezy "Polska ma na liście jeden zespół
 * i na afiszu jeden spektakl" - od tytułu, przez lead, po puentę o dziewięciu
 * teatrach, które "dziś nie istnieją". Wszystkie te liczby są prawdziwe,
 * ale rama jest rozliczeniowa, a piszemy dla polskiego czytelnika w dniu,
 * który dla tancerzy jest świętem. Stawianie na wejściu, że jest nas mało,
 * obniża rangę rzeczy, którą opisujemy.
 *
 * Dlatego:
 *  - tytuł skrócony do "Światowy Dzień Baletu",
 *  - lead mówi, co dziś obchodzimy i czym ten dzień jest dla teatrów
 *    i dla tancerzy osobiście, zamiast otwierać statystyką,
 *  - zdania "jedyny polski zespół na liście", "dokładnie jedna pozycja
 *    baletowa" i puenta o dziewięciu teatrach - usunięte,
 *  - obecność Polskiego Baletu Narodowego podana jako to, czym jest:
 *    udziałem w gronie najlepszych zespołów świata, i to nie pierwszy raz,
 *  - ciężar przeniesiony na historię dnia i na to, co u nas widać teraz
 *    i w listopadzie.
 * Żaden fakt nie został przy tym przeinaczony ani wycięty jako niewygodny -
 * zmieniła się kolejność i akcent, nie treść.
 *
 * KOREKTY MERYTORYCZNE WOBEC BRIEFU (sprawdzone u źródeł 29.10.2026):
 *
 *  - SEKCJA "CZEGO NIE WIEMY" WYLECIAŁA. Brief pisał, że przy wpisie PBN
 *    widnieje "Programmes to be announced", a aktualności Teatru Wielkiego
 *    milczą - i sam ostrzegał, że to jedyny akapit, który może zdezaktualizować
 *    się w ciągu godzin. Zdezaktualizował się: teatr opublikował wpis
 *    "World Ballet Day 2026" datowany na dziś. PBN pokazuje kulisy przygotowań
 *    do "Coppélii" Manuela Legrisa i sztukę pantomimy baletowej.
 *
 *  - DRZEWIECKI, SETNA ROCZNICA. Brief opisywał poznański wieczór 11 listopada
 *    bez podania powodu. Powód jest mocny: Conrad Drzewiecki urodził się
 *    14 października 1926, teatr gra ten program w setną rocznicę urodzin.
 *
 *  - LISTOPAD UZUPEŁNIONY o "Coppélię" w Łodzi (14 i 15 listopada). Brief ją
 *    pominął, a pisaliśmy o niej dwa razy.
 *
 * CO SPRAWDZONE I ZGODNE Z BRIEFEM:
 *  - data, hasło, 45 pozycji na liście, obecność PBN - worldballetday.com
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
 * OKŁADKA: images/dzien-baletu-okladka.jpg, 2000x1125, złożona przez redakcję.
 * Powstało kilka wersji generowanych skryptem scripts/karta-rozciagnieta.py,
 * ale ostateczny kadr Sebastian złożył sam i to jego wgrywamy. Skrypt zostaje
 * w repozytorium, bo układ "zdjęcie pionowe po lewej, tekst na rozjaśnionym
 * przedłużeniu po prawej" jeszcze się przyda - razem z tym, czego się przy
 * nim nauczyliśmy: gradient nie może wchodzić na fotografię, a żeby mógł
 * wygaszać cokolwiek poza nią, kadr trzeba najpierw przedłużyć kolorem
 * własnej krawędzi, liczonym osobno dla każdego wiersza.
 *
 * Biel grafiki podciągnięta do koloru tła portalu skryptem
 * scripts/dopasuj-biel-do-tla.py. Oryginał leży obok jako
 * images/dzien-baletu-okladka-oryginal.jpg, więc korekta jest odwracalna
 * i nie nakłada JPEG-a na JPEG przy kolejnych poprawkach. Powód korekty:
 * ściana w tej sesji ma #E7E7EB, grafika wychodziła z tłem rgb(240,240,242),
 * a strona ma rgb(250,250,248) - dziesięć poziomów różnicy i chłodniejszy
 * odcień wystarczyły, żeby kadr czytał się na portalu jako szary.
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

const TYTUL = 'Światowy Dzień Baletu'

const ZAJAWKA =
  'Dziś, 29 października, obchodzimy Światowy Dzień Baletu. Dla teatrów to jedno z ważniejszych świąt w roku, ' +
  'a dla tancerzy dzień bardzo osobisty: raz w roku pokazują nie gotowy spektakl, tylko pracę, z której on powstaje. ' +
  'Skąd się ten dzień wziął, jak dziś wygląda i co można zobaczyć - wyjaśniamy poniżej.'

const tresc = [
  h2('Zaczęło się od sztafety'),
  block('Światowy Dzień Baletu wymyślono w 2014 roku jako transmisję dookoła świata. Pięć zespołów przekazywało sobie sygnał kolejno, według stref czasowych: The Royal Ballet, The Australian Ballet, San Francisco Ballet, Balet Bolszoj i The National Ballet of Canada. Kiedy w Londynie kończyła się poranna klasa, w Melbourne zaczynała się próba.'),
  block('Pomysł był prosty i do dziś jest sednem całej rzeczy: zamiast pokazywać gotowy spektakl, pokazać to, czego widz nigdy nie widzi. Poranną klasę. Próbę. Ten sam fragment poprawiany po raz dziesiąty. Balet jest sztuką, w której efekt ma wyglądać na niewymuszony, a cała praca ma zniknąć - raz w roku zespoły odwracają tę zasadę i pokazują właśnie pracę.'),
  block('Dla tancerzy to dzień osobisty. Klasa o dziewiątej rano, ta sama od stu lat i ta sama w każdym teatrze świata, jest ich codziennością, o której nikt poza nimi nie myśli. W Światowy Dzień Baletu to ona jest bohaterem transmisji.'),

  h2('Jak to wygląda dzisiaj'),
  block('Formuła z czasem się rozluźniła. Dziś nie ma jednej sztafety - każdy zespół nadaje u siebie, we własnej strefie czasowej, na własnych kanałach. Oglądanie jest bezpłatne i nie wymaga niczego poza kliknięciem.'),
  block('Na tegorocznej liście uczestników jest czterdzieści pięć pozycji z czterech kontynentów. Nie wszystkie to zespoły baletowe: są wśród nich także szkoły i organizacje branżowe, jak Royal Academy of Dance, ISTD czy The Royal Ballet School. Z Europy bierze udział jedenaście zespołów - Les Ballets de Monte-Carlo, Dutch National Ballet, Fiński Balet Narodowy, Norweski Balet Narodowy, Balet Opery Paryskiej, Polski Balet Narodowy, Królewski Balet Duński, Staatsballett Hannover, Stuttgart Ballet, Teatro alla Scala i Wiedeński Balet Państwowy.'),

  h2('Hasło tegorocznej edycji: jak powstają historie'),
  block('„How Stories Are Made" - jak powstają historie. The Royal Ballet, który prowadzi główną transmisję, poświęcił trzy godziny temu, w jaki sposób wiedza o spektaklu przechodzi z pokolenia na pokolenie: od klasy porannej nadawanej na żywo z Royal Opera House, przez próby, po rozmowy z byłymi tancerzami i korepetytorami, którzy dziś uczą młodszych tego, czego sami nauczyli się od swoich mistrzów.'),
  block('Start o 11:30 czasu brytyjskiego, czyli 12:30 u nas. Transmisja ma tłumaczenie na język migowy i audiodeskrypcję. Przy okazji wypada stulecie The Royal Ballet School.'),

  h2('Polski Balet Narodowy pokazuje pantomimę'),
  block('Polski Balet Narodowy jest w tegorocznym gronie uczestników i nie pierwszy raz - brał udział między innymi w edycjach 2017, 2021 i 2022.'),
  block('Dziś Teatr Wielki - Opera Narodowa ogłosił, co pokazuje: kulisy przygotowań do „Coppélii" w choreografii Manuela Legrisa oraz sztukę pantomimy baletowej, dzięki której tancerze opowiadają historie gestem, bez jednego słowa. „Dziękujemy The Royal Ballet za zaproszenie" - dopisał teatr.'),
  block('Trudno o lepsze trafienie w tegoroczne hasło. Pantomima jest dokładnie tym miejscem, w którym balet przestaje być układem ruchów, a zaczyna być opowiadaniem. Jest też tą częścią warsztatu, której współczesny widz najczęściej nie rozumie - nie dlatego, że jest trudna, tylko dlatego, że nikt mu jej nigdy nie wytłumaczył. Dobrze, że robi to zespół, który za sześć tygodni wychodzi z nią na scenę.'),
  blockZLinkiem('Premiera „Coppélii" w Warszawie jest 6 grudnia. O trzech polskich inscenizacjach tego baletu w jednym sezonie pisaliśmy w tekście ', 'Trzy „Coppélie" w jednym sezonie', 'https://swiatbaletu.pl/artykuly/trzy-coppelie-w-jednym-sezonie', '.'),
  blockZLinkiem('A o tym, co balet wziął z opowiadania Hoffmanna, a czego nie wziął - w tekście ', 'Balet kończy się weselem', 'https://swiatbaletu.pl/artykuly/coppelia-i-piaskun-co-balet-wzial-od-hoffmanna', '.'),

  h2('Co dziś na polskiej scenie'),
  block('Dziś wieczorem balet gra Opera Krakowska: „Requiem" o godz. 18:30.'),
  block('Choreografia i reżyseria Jacek Tyski, do „Requiem" d-moll Mozarta - tego, które kompozytor zostawił nieukończone i które dokończyli Joseph Eybler i Franz Xaver Süssmayr. Kierownictwo muzyczne Marc Moncusi, dyryguje Zbigniew Graca, scenografia Stefania Chiarelli, kostiumy Marta Koncewoj, światła Paweł Murlik, projekcja Piotr Bednarczyk. Godzina bez przerwy, bez antraktu, bez wytchnienia. Premiera była 28 lutego tego roku.'),
  block('Kto nie zdąży dziś, ma jeszcze dwie szanse w tym tygodniu: jutro o 18:30 i w sobotę o 17:00. Potem „Requiem" wraca dopiero 21, 23 i 24 marca. W sobotę gra też „Symfonia tańca bis" w Warszawie.'),

  h2('Co nas czeka w listopadzie'),
  block('Najbliższe tygodnie są gęste. 15 listopada Opera Krakowska pokazuje prapremierę światową „Balladyny" w choreografii i reżyserii Moniki Myśliwiec, do muzyki Chopina - dwuaktowy balet według dramatu Słowackiego. We Wrocławiu „Sen nocy letniej" gra siedem razy w ciągu ośmiu dni. W Łodzi „Coppélia" 14 i 15 listopada, w Gdańsku „Giselle" cztery razy pod koniec miesiąca.'),
  block('A 11 listopada w Poznaniu wieczór, który wart jest osobnej uwagi. Balet Teatru Wielkiego tańczy cztery choreografie Conrada Drzewieckiego - „Odwieczne pieśni" Karłowicza, „Etiudę b-moll" Szymanowskiego, „Adagio" Albinoniego i „Krzesanego" Kilara - pod batutą Marty Kluczyńskiej. Drzewiecki urodził się 14 października 1926 roku w Poznaniu, więc teatr gra ten program w setną rocznicę urodzin człowieka, który stworzył Polski Teatr Tańca i przestawił polski taniec na współczesne tory. Bilety po złotówce, sprzedaż rusza 3 listopada o 13:00.'),
  block('Światowy Dzień Baletu polega na pokazywaniu pracy, a nie efektu. Jeśli ktoś dziś pierwszy raz zobaczy, ile tej pracy mieści się w jednym podniesieniu ręki, dzień spełni swoje zadanie - a za kilka tygodni będzie miał gdzie zobaczyć efekt.'),
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
