/**
 * create-artykul-weekend-16-18-10.mjs
 * "Sześć premier w trzy dni" - przewodnik po weekendzie 16-18 października 2026.
 * Źródło: Google Drive, "2026-10-16 - Weekend 16-18.10 (artykuł + post IG)".
 *
 * KOREKTY WOBEC WERSJI Z DRIVE'A (sprawdzone u źródeł 16.10.2026):
 *  - DOPISANA prapremiera "Matek Chersonia" w Teatrze Wielkim - Operze Narodowej
 *    (16.10, 19:00). Pierwsza na świecie inscenizacja sceniczna, koprodukcja
 *    z Metropolitan Opera. Wersja z Drive'a odnotowywała krakowskiego "Fausta",
 *    a pomijała prapremierę w Operze Narodowej tego samego wieczoru.
 *  - W efekcie zmieniony tytuł i rama: nie "cztery premiery w dwa dni", tylko
 *    sześć premier w trzy dni, z dwiema prapremierami światowymi jednego wieczoru.
 *  - DOPISANY sobotni "Weiser" (17.10, 18:00). Wersja z Drive'a wymieniała go
 *    w piątek i w niedzielę, a sobotnia sekcja go gubiła.
 *  - Czas trwania "Weisera": było "około 90 minut", jest rozpisane za teatrem -
 *    akt I 51 minut, przerwa 20, akt II 32, czyli 1 godzina 43 minuty wieczoru.
 *  - "Conrad": przekaz choreograficzny to czworo osób, nie troje - teatr podaje
 *    też Emila Wesołowskiego.
 *  - "Conrad": słowa "rekonstrukcja" teatr używa wyłącznie przy "Etiudzie b-moll".
 *    Wersja z Drive'a rozciągała je na wszystkie cztery choreografie.
 *  - "Conrad": zamiast "ostatni dzień" - "ostatnie pokazy w tej serii". Filtr
 *    miesięcy na stronie spektaklu podaje obok października także kwiecień.
 *  - Odniesienia względne ("dziś", "jutro", "dzisiejszy wieczór") zamienione
 *    na daty. Artykuł zostaje na portalu po weekendzie.
 *  - DOPISANY bilans: ile pozycji baletowych, a ile operowych.
 *
 * BILANS 16-18.10 (nasz repertuar, odczyt 16.10.2026, plus "Rezerwuary",
 * których Stacji Orunia GAK nie zbieramy):
 *   baletowe i taneczne .. 7  (Conrad x2, Coppélia x2, Lalka x2, Rezerwuary)
 *   operowe .............. 10 (Weiser x3, Matki Chersonia x2, Faust x3,
 *                              Romeo i Julia, Salome)
 *   operetkowe ........... 2  (Zemsta nietoperza, Lublin)
 *   koncert .............. 1  (Nigel Kennedy, Poznań)
 *   rodzinne i edukacyjne  9
 *   premiery ............. 6  (3 baletowe i taneczne, 3 operowe, w tym
 *                              2 prapremiery światowe)
 * Jedyne teatry bez pozycji w ten weekend to Opera Nova w Bydgoszczy
 * i Opera Śląska w Bytomiu; obie mają terminy w innych dniach października,
 * więc to nie jest luka w imporcie.
 *
 * ZDJĘCIA: cztery z sześciu premier odbywają się w ten weekend, więc zdjęć
 * z tych spektakli jeszcze nie ma. "Conrad" zagrał 14 i 15 października, ale
 * teatr nie podaje przy zdjęciach nazwiska fotografa, a bez podpisu nie
 * publikujemy. Zostaje klucz wizualny szczecińskiej "Lalki" - materiał
 * prasowy Opery na Zamku, proj. A. Pełechaty.
 *
 * Idempotentny: po slug - patchuje istniejący, bez ruszania daty publikacji.
 */
import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const SLUG = 'szesc-premier-w-trzy-dni-weekend-16-18-pazdziernika'

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
const blockZLinkiem = (przed, tekstLinku, href, po) => {
  const k = key()
  return {
    _type: 'block', _key: key(), style: 'normal',
    markDefs: [{ _key: k, _type: 'link', href }],
    children: [
      { _type: 'span', _key: key(), text: dash(przed), marks: [] },
      { _type: 'span', _key: key(), text: dash(tekstLinku), marks: [k] },
      { _type: 'span', _key: key(), text: dash(po), marks: [] },
    ],
  }
}
const obraz = (assetId, podpis) => ({
  _type: 'image', _key: key(),
  asset: { _type: 'reference', _ref: assetId },
  alt: dash(podpis),
})

const TYTUL = 'Sześć premier w trzy dni. Dwie prapremiery światowe jednego wieczoru, dwie premiery baletowe o tej samej godzinie'

const ZAJAWKA =
  'To najgęstszy weekend od początku sezonu. W piątek 16 października dwie prapremiery światowe tego samego wieczoru - ' +
  '„Weiser" w Gdańsku i „Matki Chersonia" w Warszawie - a do tego premiera „Fausta" w Krakowie. W sobotę 17 października ' +
  'dwie premiery baletowe dokładnie o tej samej godzinie, w Łodzi i w Szczecinie. W niedzielę 18 października jeszcze ' +
  'premiera taneczna w Gdańsku. Razem sześć premier. Oto cały weekend, pozycja po pozycji.'

const tresc = (A) => [
  h2('Bilans na wejściu'),
  block('W naszym repertuarze weekend 16-18 października to siedem spektakli baletowych i tanecznych oraz dziesięć operowych. Do tego dwa operetkowe, jeden koncert i dziewięć pozycji rodzinnych i edukacyjnych.'),
  block('Premier jest sześć. Trzy baletowe i taneczne: „Coppélia" w Łodzi, „Lalka" w Szczecinie i „Rezerwuary" w Gdańsku. Trzy operowe: „Weiser" w Gdańsku, „Matki Chersonia" w Warszawie i „Faust" w Krakowie. Dwie z tych operowych to prapremiery światowe i obie wypadają tego samego piątkowego wieczoru.'),
  block('Jedyne sceny, które w ten weekend nie grają nic, to Opera Nova w Bydgoszczy i Opera Śląska w Bytomiu.'),

  h2('Piątek 16 października: dwie prapremiery światowe o tej samej porze'),
  block('O 19:00 w Gdańsku i o 19:00 w Warszawie zaczynają się dwa tytuły, których wcześniej nikt na świecie nie widział na scenie.'),

  h3('„Weiser" - Opera Bałtycka, Gdańsk, 19:00'),
  block('Światowa prapremiera. Opera do powieści Pawła Huellego z 1987 roku, o chłopcu, który znika. Muzyka Ewy Fabiańskiej-Jelińskiej, libretto Anny Czekanowicz, reżyseria Romualda Wiczy-Pokojskiego, kierownictwo muzyczne i dyrygentura Radosław Droń. Akt pierwszy 51 minut, przerwa 20, akt drugi 32 - w sumie godzina czterdzieści trzy.'),
  block('Dla nas najważniejsze jest to, czego nie widać w zapowiedziach: w spektaklu tańczy balet Opery Bałtyckiej, w choreografii Bartosza Dopytalskiego. Teatr wymienia zespół baletu w obsadzie obok chóru i orkiestry.'),
  block('Partię tytułową śpiewa Jan Jakub Monowid albo Michał Sławecki, Elkę - Anna Bochnak-Fryc albo Joanna Gostkowska; teatr nie przypisuje nazwisk do konkretnych dat. Scenografia Aleksandra Iwańczyk, kostiumy Marek Adamski, światła Paulina Góral-Stykowska.'),
  block('Prapremierowy wieczór jest wyprzedany. Na 17 i 18 października teatr podaje ostatnie bilety, a „Weiser" wraca jeszcze 20, 23, 24 i 25 października - siedem pokazów w jednym miesiącu, co przy prapremierze jest liczbą poważną.'),

  h3('„Matki Chersonia" - Teatr Wielki - Opera Narodowa, Warszawa, 19:00'),
  block('Druga prapremiera światowa tego wieczoru i pierwsza premiera operowa sezonu w Operze Narodowej. Opera Maxima Kolomiietsa do libretta George\'a Branta, w dwóch aktach, śpiewana po angielsku. Rzecz o dzieciach wywiezionych z okupowanych terenów Ukrainy i o matkach, które próbują je odnaleźć.'),
  block('Reżyseruje Barbara Wysocka, scenografię przygotowała Barbara Hanicka, dyryguje Keri-Lynn Wilson. To koprodukcja z Metropolitan Opera, która pokaże tytuł u siebie w 2028 roku. Spektakl grany jest jeszcze 18, 23, 25 i 27 października.'),
  block('Odnotowujemy to, choć nie jest to balet, bo prapremiera światowa w Operze Narodowej to wydarzenie, które wyznacza ten weekend tak samo jak sobotnie premiery baletowe.'),

  h3('„Faust" - Opera Krakowska, 18:30'),
  block('Premiera. Również opera, również odnotowana, bo wypada tego samego wieczoru i obsadza trzeci punkt na mapie. Kolejne pokazy 17 października o 18:30 i 18 października o 17:00, oba już wyprzedane.'),

  h3('„Conrad" - Teatr Wielki w Poznaniu, 11:00 i 19:00'),
  block('Ostatnie dwa pokazy tej serii. Spektakl wszedł na afisz 14 października, dokładnie w setną rocznicę urodzin Conrada Drzewieckiego, i 16 października gra po raz trzeci i czwarty.'),
  block('Wieczór przywraca cztery jego choreografie: „Etiudę b-moll" Szymanowskiego, „Adagio na smyczki i organy" Albinoniego, „Krzesanego" Kilara i „Odwieczne pieśni" Karłowicza. Teatr zaznacza, że „Etiuda b-moll" jest rekonstrukcją dzieła. Przekaz choreograficzny: Dominika Antkowiak, Arkadiusz Gumny, Agnieszka Wolna-Bartosik i Emil Wesołowski. Dyryguje Marta Kluczyńska.'),
  block('Warto mieć na uwadze, że to nie jest pożegnanie z tytułem - filtr terminów na stronie teatru podaje obok października także kwiecień.'),

  h2('Sobota 17 października: dwie premiery baletowe, jedna godzina, dwa miasta'),
  block('To jest ten wieczór. O 19:00 zaczynają się dwie premiery baletowe naraz, w Łodzi i w Szczecinie.'),

  h3('„Coppélia" - Teatr Wielki w Łodzi, 19:00'),
  block('Pierwsza premiera baletowa jubileuszowego, sześćdziesiątego sezonu teatru. Tytuł wraca do Łodzi po dwudziestu sześciu latach, w nowej choreografii Juliena Guérina. Dekoracje Roland Fontaine, kostiumy Charles de Vilmorin, plakat Rafał Olbiński, dyryguje Luis Gorelik. Drugie przedstawienie 18 października o 19:00, potem seria wraca 14 i 15 listopada.'),
  blockZLinkiem('O tej inscenizacji i o dwóch pozostałych „Coppéliach" tego sezonu pisaliśmy osobno: ', 'Trzy „Coppélie" w jednym sezonie', 'https://swiatbaletu.pl/artykuly/trzy-coppelie-w-jednym-sezonie', '.'),

  h3('„Lalka" - Opera na Zamku w Szczecinie, 19:00'),
  block('Premiera baletu w dwóch aktach na motywach powieści Bolesława Prusa. Choreografia Grzegorz Brożek, dramaturgia Karol Urbański, kierownictwo muzyczne Kuba Wnuk, kostiumy i konsultacja scenograficzna Zuzanna Markiewicz, reżyseria świateł Paweł Kois, projekcje Mateusz Kokot, asystentka choreografa Emma McBeth. Około półtorej godziny z przerwą, Sala Główna.'),
  block('Najciekawsza jest tu partytura, bo nie istniała. Spektakl zbudowano z muzyki dwóch polskich kompozytorów, którzy zmarli w tym samym 1909 roku: Zygmunta Noskowskiego i Mieczysława Karłowicza. Z Noskowskiego wzięto poemat symfoniczny „Step", z Karłowicza „Biancę da Molenę", fragment „Odwiecznych pieśni", dwie części Serenady na orkiestrę smyczkową i „Epizod na maskaradzie" - ten ostatni dokończony i zinstrumentowany po śmierci Karłowicza przez Grzegorza Fitelberga. Całość w orkiestracji Przemysława Zycha.'),
  block('17 października Wokulskiego tańczy Paweł Wdówka, Izabelę Łęcką Aleksandra Januszak-Kacperska, Rzeckiego Patryk Kowalski. 18 października wszystkie trzy partie obsadzone są inaczej: Damiano Maffeis, Alice Anderson i So Hadano.'),

  h3('Co jeszcze w sobotę'),
  block('W Gdańsku „Weiser" o 18:00, w Krakowie „Faust" o 18:30, w Warszawie „Romeo i Julia" Gounoda o 19:00. W Lublinie „Zemsta nietoperza" o 18:00, w Poznaniu koncert Nigela Kennedy\'ego o 20:00.'),
  block('A w Łodzi, sześć i pół godziny przed premierą i w tym samym budynku, warsztaty familijne „Magiczne figurki" o 12:30. Dwie godziny: historia lalki o imieniu Coppélia, słuchanie fragmentów partytury, tworzenie własnych figurek, projektowanie scenografii i zabawy ruchowe. Rodzice uczestniczą razem z dziećmi, każdy zabiera swoją pracę do domu.'),

  h2('Niedziela 18 października'),

  h3('„Rezerwuary" - Stacja Orunia GAK, Gdańsk, 18:00'),
  block('Premiera Dużego Formatu, wyłoniona w otwartym naborze programu Przestrzenie Sztuki - Taniec. Koncepcja i choreografia Katarzyna Chmielewska, scenografia i wideo Antek Jancelewicz, muzyka Krzysztof Topolski, światła Michał Kołodziej. Na scenie Tatiana Dziewanowska, Patryk Jarczok, Marika Kornacka, Daniel Michna i Yelyzaveta Tereshonok.'),
  block('Punktem wyjścia są historyczne gdańskie zbiorniki wodne - ich architektura i funkcja - a ciało potraktowane jest jak zbiornik pamięci i siły. Spektakl prowadzi widza przez osiem poziomów, od zerowego do siódmego.'),

  h3('Powtórki'),
  block('„Coppélia" gra w Łodzi po raz drugi, o 19:00. „Lalka" w Szczecinie o 18:00, w drugiej obsadzie. „Weiser" w Gdańsku o 17:00, „Matki Chersonia" w Warszawie o 18:00, „Faust" w Krakowie o 17:00, „Salome" we Wrocławiu o 18:00.'),

  h2('Drobiazg, który łatwo przeoczyć'),
  block('„Odwieczne pieśni" Karłowicza brzmią w ten weekend dwa razy, w dwóch różnych baletach i dwóch różnych miastach. W Poznaniu jako jedna z czterech przywróconych choreografii Drzewieckiego, w Szczecinie jako fragment nowej partytury do „Lalki". Dwa zupełnie różne spektakle, jeden kompozytor, jeden utwór, jeden weekend.'),

  h2('Co dalej'),
  block('Po tym weekendzie afisz na chwilę rzednie. „Weiser" wraca 20, 23, 24 i 25 października, „Matki Chersonia" 23, 25 i 27 października, „Requiem" w choreografii Jacka Tyskiego gra w Operze Krakowskiej 29, 30 i 31 października, a 31 października Teatr Wielki - Opera Narodowa pokazuje „Symfonię tańca bis".'),
  blockZLinkiem('Pełne repertuary wszystkich polskich teatrów operowych i baletowych, z datami, godzinami i statusem biletów, zbieramy w jednym miejscu: ', 'swiatbaletu.pl/repertuar', 'https://swiatbaletu.pl/repertuar', '.'),
]

async function wgraj(nazwa) {
  const p = join(__dir, '..', '..', 'images', nazwa)
  if (!existsSync(p)) { console.error('✗ Brak zdjęcia:', p); process.exit(1) }
  const asset = await client.assets.upload('image', readFileSync(p), { filename: nazwa })
  console.log('  ✓', nazwa, '->', asset._id)
  return asset._id
}

async function main() {
  console.log('Wgrywam zdjęcia:')
  const A = { okladka: await wgraj('weekend-16-18-10-okladka.jpg') }

  const body = tresc(A)
  const slowa = body.filter((b) => b._type === 'block')
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
      asset: { _type: 'reference', _ref: A.okladka },
      alt: 'Klucz wizualny baletu „Lalka" Opery na Zamku w Szczecinie',
      zrodlo: 'mat. Opery na Zamku w Szczecinie, proj. A. Pełechaty',
    },
    trescGlowna: body,
    autor: 'Redakcja Świat Baletu',
    dataPublikacji: new Date().toISOString(),
    featured: true,
    czasCzytania,
    tagi: ['weekend w balecie', 'premiery', 'Coppélia', 'Lalka', 'Weiser', 'Matki Chersonia', 'Conrad Drzewiecki', 'Rezerwuary', 'Opera na Zamku', 'Teatr Wielki w Łodzi', 'Opera Bałtycka'],
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
