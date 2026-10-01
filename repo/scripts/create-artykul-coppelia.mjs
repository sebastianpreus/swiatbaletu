/**
 * create-artykul-coppelia.mjs
 * "Trzy „Coppélie" w jednym sezonie" - bogatszy artykuł z okładką i zdjęciami
 * w treści, zbudowany na wzór tekstu o „Giselle".
 *
 * ŹRÓDŁA (sprawdzone 1 października 2026):
 *  - operabaltycka.pl/wydarzenie/coppelia - terminy, realizatorzy, obsady
 *    rozpisane osobno dla 2, 3 i 4 października, premiera inscenizacji 6.04.2024,
 *    czas trwania, opis nawiązujący do obrazów Chagalla
 *  - operalodz.com/COPPLIA,29,794 - terminy (17 i 18.10 g. 19:00, 14.11 g. 18:30,
 *    15.11 g. 17:00), choreografia Guérin, kier. muz. Gorelik, dekoracje Fontaine,
 *    kostiumy de Vilmorin, plakat Olbińskiego; "po 26 latach"
 *  - teatrwielki.pl, strona terminu 6.12.2026 - 11 terminów, realizatorzy,
 *    prapremiera 25.05.1870, premiera polska 7.12.1882, informacja o galicyjskim
 *    miasteczku i o tym, że ostatnia warszawska „Coppélia" to wersja Messerera
 *  - archiwum.teatrwielki.pl - premiera wersji Messerera 6 kwietnia 1974
 *  - Wikipedia (Coppélia, Giuseppina Bozzacchi, Arthur Saint-Léon) - obsada
 *    prapremiery, 18 spektakli, daty śmierci
 *  - tchaikovsky-research.net - list do Taniejewa z 23.11/5.12.1877 o „Sylwii"
 *
 * CZEGO ŚWIADOMIE NIE MA:
 *  - obsad łódzkich i warszawskich. Oba teatry grają premiery, żaden nie podał
 *    jeszcze nazwisk przy terminach. Gdańskie obsady są, bo teatr rozpisuje je
 *    przy każdej z trzech dat (zasada z artykułu o „Giselle").
 *  - cen biletów
 *  - określeń względnych w rodzaju "dziś" czy "jutro"
 *
 * UWAGA DO DANYCH: w naszym repertuarze listopadowe terminy łódzkie miały
 * godzinę wcześniejszą (17:30 i 16:00) niż strona teatru. Poprawione na dane
 * teatru; przy kolejnym imporcie z bilety24 warto sprawdzić, czy nie wrócą.
 *
 * Zdjęcia: wszystkie z gdańskiej inscenizacji, fot. Krzysztof Mystkowski / KFP,
 * z galerii Opery Bałtyckiej. Łódź i Warszawa jeszcze nie grały, więc zdjęć
 * z tych produkcji po prostu nie ma.
 * Okładka to karta tytułowa generowana skryptem scripts/karta-tytulowa.py:
 *   karta-tytulowa.py <katalog> <zdjęcie> <wynik> "" "Coppélia" \
 *     "Historia baletu o lalce, która nigdy nie ożyła" 0.68 0 1.40
 * Zero to brak poświaty (kadr sam jest po lewej czarny), 1.40 to gamma -
 * zdjęcie ze sceny było za ciemne wokół baletnicy i pod tytułem.
 *
 * Idempotentny: po slug - patchuje istniejący.
 */
import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const SLUG = 'trzy-coppelie-w-jednym-sezonie'

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
// Akapit z odnośnikiem: markDefs trzyma adres, a span wskazuje na niego kluczem.
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

const TYTUL = 'Trzy „Coppélie" w jednym sezonie. Francuski balet, którego akcja dzieje się w galicyjskim miasteczku'

const ZAJAWKA =
  'W piątek 2 października Opera Bałtycka otwiera jesień „Coppélią", a to dopiero początek. ' +
  'W październiku tytuł wraca do Łodzi po dwudziestu sześciu latach, w grudniu na scenę Teatru Wielkiego - Opery Narodowej ' +
  'po pięćdziesięciu dwóch. Trzy teatry, dwie premiery i jeden z najweselszych baletów XIX wieku, który - o czym ' +
  'rzadko się pamięta - jego francuscy twórcy osadzili na ziemiach polskich pod zaborem austriackim. ' +
  'Opowiadamy, skąd wzięła się historia o lalce, która nigdy nie ożyła, i co dokładnie zobaczymy w Gdańsku, Łodzi i Warszawie.'

const tresc = (A) => [
  // Streszczenie libretta jako blockquote - renderer daje mu złotą kreskę
  // i kursywę, więc odcina się od reszty i można je przeczytać osobno.
  block('Miasteczko szykuje się do święta. Swanilda i Franz mają się pobrać, ale dziewczyna zauważa, że narzeczony kręci się pod oknem domu starego Coppeliusa i przesyła uśmiechy jego pięknej, milczącej córce Coppélii, która całymi dniami siedzi na balkonie z książką. Zazdrosna Swanilda wkrada się nocą z przyjaciółkami do warsztatu Coppeliusa i odkrywa prawdę: Coppélia nie jest żadną córką, tylko mechaniczną lalką, jedną z wielu, które starzec buduje i traktuje jak żywe istoty. Gdy Coppelius wraca, Swanilda chowa się i przebiera za lalkę. Tymczasem Franz wspina się po drabinie do okna - Coppelius łapie go, upija i zabiera się do rzeczy, o której marzył całe życie: chce przenieść życie chłopaka w swoją lalkę. Jest przekonany, że mu się udało, bo "Coppélia" rzeczywiście zaczyna się ruszać. To oczywiście Swanilda, która naigrawa się ze starca, budzi Franza i ucieka razem z nim. Akt ostatni to wesele, pojednanie i cały wieczór tańców.', 'blockquote'),

  h2('Balet, który Francuzi osadzili w Galicji'),
  block('Rzecz zaczęła się od opowiadania E.T.A. Hoffmanna „Piaskun" z 1816 roku - mrocznej historii o studencie, który zakochuje się w Olimpii, nie wiedząc, że to automat, i po odkryciu prawdy traci rozum. U Hoffmanna kończy się to samobójstwem. Libreciści Opery Paryskiej zrobili z tego komedię.'),
  block('Scenariusz napisał Charles Nuitter, muzykę Léo Delibes, choreografię ułożył Arthur Saint-Léon. I tu rzecz, o której w Polsce mówi się zaskakująco rzadko: akcję umieścili w galicyjskim miasteczku, czyli na terenie, który wtedy należał do zaboru austriackiego, a dziś leży częściowo w Polsce, częściowo na Ukrainie. Nie był to kaprys scenografa, tylko decyzja wpisana w partyturę.'),
  block('„Coppélia" uchodzi bowiem za pierwszy balet, który na serio wpuścił na scenę tańce narodowe. W partyturze Delibesa jest mazur, jest czardasz, jest bolero i jest szkocka giga. Mazur z pierwszego aktu to do dziś jeden z najbardziej rozpoznawalnych numerów całego dziewiętnastowiecznego repertuaru baletowego - i wielu widzów w Polsce słyszy go z poczuciem, że skądś go zna, zanim dowie się, dlaczego.'),
  obraz(A.taniec, 'Tańce charakterystyczne w gdańskiej „Coppélii". fot. Krzysztof Mystkowski / KFP / Opera Bałtycka'),

  h2('Osiemnaście wieczorów i dwa pogrzeby'),
  block('Prapremiera odbyła się 25 maja 1870 roku w Théâtre Impérial de l\'Opéra w Paryżu. Swanildę tańczyła szesnastoletnia Włoszka Giuseppina Bozzacchi, dla której była to pierwsza wielka rola w życiu. Franza - i to nie jest pomyłka - tańczyła kobieta, Eugénie Fiocre, w męskim kostiumie. Obsadzanie męskich partii baletnicami było wtedy w Paryżu normą i w Operze Paryskiej utrzymało się aż do czasów po drugiej wojnie światowej.'),
  block('Balet od razu się przyjął. I niemal od razu przestał istnieć.'),
  block('W lipcu wybuchła wojna francusko-pruska. 31 sierpnia 1870 roku Opera zamknęła podwoje, a Bozzacchi zatańczyła Swanildę po raz osiemnasty i ostatni. Dwa dni później, 2 września, zmarł Arthur Saint-Léon. Teatr przestał wypłacać pensje, Paryż znalazł się w oblężeniu, a osłabiona głodem Bozzacchi zachorowała na ospę. Zmarła 23 listopada 1870 roku - w dniu swoich siedemnastych urodzin.'),
  block('Największy komediowy balet epoki stracił więc w ciągu trzech miesięcy choreografa i odtwórczynię głównej roli. Z osiemnastu spektakli zrobiła się jedna z najdłużej granych pozycji w historii teatru - ale już bez nich.'),

  h2('Lalka, która nigdy nie ożywa'),
  block('Warto zauważyć, co właściwie dzieje się w drugim akcie, bo to jedno z najzgrabniejszych rozwiązań w całym klasycznym repertuarze. Coppélia nie ożywa. Ani przez chwilę. Cała scena, w której stary mechanik tryumfuje, że oto udało mu się tchnąć życie w swoje dzieło, jest kpiną - lalkę gra podszywająca się pod nią dziewczyna.'),
  block('Dla tancerki oznacza to zadanie odwrotne do wszystkiego, czego uczy się w szkole: ma tańczyć źle. Sztywno, kanciasto, z opóźnieniem, jak nakręcana zabawka, i dopiero stopniowo przepuszczać przez tę maskę coraz więcej człowieka. Po akcie pierwszym, w którym Swanilda jest po prostu rozżaloną dziewczyną, i przed aktem ostatnim, w którym czeka ją klasyczne pas de deux. Trzy różne sposoby poruszania się w ciągu jednego wieczoru.'),
  obraz(A.warsztat, 'Swanilda z przyjaciółkami w warsztacie Coppeliusa, po prawej lalka. Gdańska „Coppélia". fot. Krzysztof Mystkowski / KFP / Opera Bałtycka'),
  block('Osobna sprawa to muzyka. Delibes napisał partyturę, która nie towarzyszy tańcowi, tylko go prowadzi, i to ona zrobiła z „Coppélii" przełom. Piotr Czajkowski był pod ogromnym wrażeniem jego baletów. Po wysłuchaniu „Sylwii" napisał do Siergieja Taniejewa, w liście z Wiednia z 1877 roku, że gdyby znał tę muzykę wcześniej, nie napisałby „Jeziora łabędziego". Trudno o szczersze wyznanie między kompozytorami.'),

  h2('Polski wątek zaczyna się w 1882 roku'),
  block('Polska premiera „Coppélii" odbyła się 7 grudnia 1882 roku w Teatrze Wielkim w Warszawie - dwanaście lat po Paryżu. Potem tytuł wracał na warszawską scenę wielokrotnie, ostatni raz 6 kwietnia 1974 roku, w rosyjskiej wersji Asafa Messerera. Od tamtej pory minęły pięćdziesiąt dwa lata.'),
  block('Grudniowa premiera Polskiego Baletu Narodowego wypada więc niemal co do dnia sto czterdzieści cztery lata po polskiej premierze: 6 grudnia 2026 roku, dzień przed rocznicą.'),

  h2('Trzy „Coppélie" tego sezonu'),
  block('Sprawdziliśmy w naszym repertuarze wszystkie miesiące sezonu, teatr po teatrze. „Coppélię" grają dokładnie trzy sceny, łącznie osiemnaście razy. Dwie z tych produkcji to premiery.'),

  h3('Gdańsk: Chagall nad Bałtykiem, a Coppeliusa tańczy choreograf'),
  block('Opera Bałtycka, wznowienie. Terminy: 2.10 (pt.) 19:00, 3.10 (sob.) 18:00 oraz 4.10 (niedz.) 17:00.'),
  block('Inscenizacja Johana Kobborga miała premierę 6 kwietnia 2024 roku i teraz wraca na afisz. Kobborg, duński tancerz, pierwszy solista The Royal Ballet i Duńskiego Baletu Królewskiego, napisał do niej własne libretto na podstawie oryginału Nuittera i Saint-Léona. Teatr zapowiada świat wizualny przywołujący obrazy Chagalla; scenografię i kostiumy przygotowała Hanna Wójcikowska-Szymczak, reżyserię świateł Paulina Góral-Stykowska, multimedia Michał Lewandowski. Kierownictwo muzyczne i dyrygentura Luis Gorelik. Dwie godziny z jedną przerwą.'),
  block('Ciekawostka obsadowa: Coppeliusa we wszystkich trzech spektaklach tańczy sam Kobborg. Lalkę Coppélię - Izabela Sokołowska-Boulton. Swanilda i Franz zmieniają się z wieczoru na wieczór: 2 października Ludwiga Andruszkiewicz i Gento Yoshimoto, 3 października Oliwia Bryłkowska i Victor Verdecia, 4 października Saya Ikeda i Jacopo Severini.'),
  obraz(A.coppelius, 'Coppelius i jego lalka w inscenizacji Johana Kobborga. fot. Krzysztof Mystkowski / KFP / Opera Bałtycka'),

  h3('Łódź: powrót po dwudziestu sześciu latach'),
  block('Teatr Wielki w Łodzi, premiera. Terminy: 17.10 (sob.) 19:00, 18.10 (niedz.) 19:00, 14.11 (sob.) 18:30 oraz 15.11 (niedz.) 17:00.'),
  block('Choreografię przygotował Francuz Julien Guérin, kierownictwo muzyczne objął Luis Gorelik, dekoracje zaprojektował Roland Fontaine, kostiumy Charles de Vilmorin. Plakat jest autorstwa Rafała Olbińskiego. Teatr zapowiada rzecz lekką i familijną, zbudowaną wokół zacierającej się granicy między tym, co żywe, a tym, co sztuczne.'),
  block('Dla Łodzi to powrót tytułu po dwudziestu sześciu latach nieobecności i pierwsza premiera baletowa jubileuszowego, sześćdziesiątego sezonu. Obsad teatr jeszcze nie ogłosił.'),

  h3('Warszawa: nowa inscenizacja Manuela Legris'),
  block('Teatr Wielki - Opera Narodowa, Polski Balet Narodowy, premiera. Jedenaście terminów: 6.12 (niedz.) 18:00, 9.12 (śr.) 19:00, 12.12 (sob.) 19:00, 15.12 (wt.) 19:00, 16.12 (śr.) o 12:00 i 19:00, 17.12 (czw.) 19:00, 19.12 (sob.) 19:00, 22.12 (wt.) o 12:00 i 19:00 oraz 23.12 (śr.) 19:00.'),
  block('Balet w trzech aktach. Choreografię i libretto, we współpracy z Jean-François Vazelle\'em, przygotowuje Manuel Legris - gwiazda Opery Paryskiej, potem dyrektor baletu Opery Wiedeńskiej i mediolańskiej La Scali, warszawskiej publiczności znany z „Korsarza". Teatr podkreśla, że Legris opracowuje tę „Coppélię" specjalnie dla tej sceny i że obok paryskiej tradycji zapowiedział własne rozwiązania dramaturgiczne i choreograficzne.'),
  block('Dyryguje Manuel Coves, scenografię przygotował Jean-Luc Simonini, kostiumy Stephanie Bäuerle, światła Maciej Igielski. Obsad przy terminach teatr na razie nie podaje.'),

  h2('Na koniec dwie rzeczy, które łatwo przeoczyć'),
  block('Pierwsza: Luis Gorelik, argentyński dyrygent, prowadzi w tym sezonie dwie z trzech polskich „Coppélii" - gdańską i łódzką. W odstępie dwóch tygodni, w dwóch zupełnie różnych inscenizacjach, przy dwóch różnych orkiestrach.'),
  block('Druga: tytułowa bohaterka nie ma w całym balecie ani jednego kroku. Coppélia jest lalką, siedzi, czyta i milczy, a wszystko, co widzimy jako jej taniec, tańczy ktoś inny. Najsłynniejsza postać tego baletu to rola, w której nie wolno się ruszyć.'),
  obraz(A.final, 'Finałowe pas de deux gdańskiej „Coppélii". fot. Krzysztof Mystkowski / KFP / Opera Bałtycka'),
  blockZLinkiem('Pełne repertuary wszystkich polskich teatrów operowych i baletowych znajdziecie jak zawsze na ', 'swiatbaletu.pl/repertuar', 'https://swiatbaletu.pl/repertuar', '.'),
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
  const A = {
    okladka:    await wgraj('coppelia-okladka-karta.jpg'),
    taniec:     await wgraj('coppelia-taniec.jpg'),
    warsztat:   await wgraj('coppelia-warsztat.jpg'),
    coppelius:  await wgraj('coppelia-coppelius.jpg'),
    final:      await wgraj('coppelia-final.jpg'),
  }

  const body = tresc(A)
  const slowa = body.filter((b) => b._type === 'block')
    .flatMap((b) => b.children.map((c) => c.text)).join(' ').split(/\s+/).length
  const czasCzytania = Math.max(1, Math.round(slowa / 200))

  const doc = {
    _type: 'artykul',
    tytul: dash(TYTUL),
    slug: { _type: 'slug', current: SLUG },
    kategoria: 'Historia',
    zajawka: dash(ZAJAWKA),
    zdjecie: {
      _type: 'image',
      asset: { _type: 'reference', _ref: A.okladka },
      alt: 'Swanilda w gdańskiej „Coppélii" w choreografii Johana Kobborga',
      zrodlo: 'fot. Krzysztof Mystkowski / KFP / Opera Bałtycka',
    },
    trescGlowna: body,
    autor: 'Redakcja Świat Baletu',
    dataPublikacji: new Date().toISOString(),
    featured: true,
    czasCzytania,
    tagi: ['Coppélia', 'Léo Delibes', 'historia baletu', 'Opera Bałtycka', 'Teatr Wielki w Łodzi', 'Polski Balet Narodowy', 'Johan Kobborg', 'Manuel Legris', 'Julien Guérin'],
    bannerGlowna: false,
  }

  const dlugie = JSON.stringify(doc).match(/[—–]/g)
  if (dlugie) { console.error('✗ Zostały długie myślniki:', dlugie.length); process.exit(1) }

  const existing = await client.fetch('*[_type=="artykul" && slug.current==$slug][0]{_id, dataPublikacji}', { slug: SLUG })
  if (existing?._id) {
    // Ponowne uruchomienie nie może przestawiać daty publikacji na dzisiejszą -
    // artykuł zmieniłby wtedy miejsce w kolejności i w nagłówku.
    if (existing.dataPublikacji) doc.dataPublikacji = existing.dataPublikacji
    await client.patch(existing._id).set(doc).commit()
    console.log('\n  ✓ Zaktualizowano:', existing._id)
  } else {
    const created = await client.create(doc)
    console.log('\n  ✓ Utworzono:', created._id)
  }
  console.log(`  ✓ ${slowa} słów, czas czytania: ${czasCzytania} min, zdjęć w treści: ${body.filter((b) => b._type === 'image').length}`)
  console.log('\nGotowe! Adres: /artykuly/' + SLUG)
}

main().catch((e) => { console.error('Błąd:', e.message); process.exit(1) })
