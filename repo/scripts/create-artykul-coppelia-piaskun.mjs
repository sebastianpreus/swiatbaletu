/**
 * create-artykul-coppelia-piaskun.mjs
 * "Balet kończy się weselem..." - „Coppélia" a „Piaskun" Hoffmanna.
 * Źródło: Google Drive, "2026-10-23 - Coppélia i Piaskun (artykuł + post IG)".
 *
 * KOREKTY WOBEC WERSJI Z DRIVE'A (sprawdzone u źródeł 23.10.2026):
 *  - WIEŻA RATUSZA, nie kościelna. Wersja z Drive'a pisała o wieży kościelnej,
 *    i w artykule, i w notce na Instagram. U Hoffmanna Nathanael i Klara wchodzą
 *    na wieżę ratusza (Rathausturm).
 *  - Zakończenie "Piaskuna" stało na jednym źródle (angielska Wikipedia) i było
 *    tak opatrzone w tekście. Potwierdzone niezależnie w niemieckiej Wikipedii,
 *    razem ze szczegółem, którego brakowało: na wieży Nathanael patrzy na Klarę
 *    PRZEZ LUNETĘ Coppoli. To domyka wątek oczu, więc wchodzi do tekstu,
 *    a zastrzeżenie o jednym źródle znika.
 *  - Imię brata Klary: Lothar. Wersja z Drive'a pisała "brat dziewczyny".
 *  - "W tym sezonie zobaczymy ją dwa razy" - nieprawda. Opera Bałtycka zagrała
 *    "Coppélię" 2, 3 i 4 października, czyli w tym samym sezonie. Teatry są
 *    trzy, nie dwa; dwa terminy są jeszcze przed nami.
 *  - "czterdzieści lat temu" przy gdańskiej realizacji z 1987 roku -> "blisko
 *    czterdzieści". Prapremiera 25 kwietnia 1987, czyli trzydzieści dziewięć lat.
 *  - Warszawa: "akcja przeniesiona do galicyjskiego miasteczka" sugerowała, że
 *    to pomysł Legrisa. Galicja jest w oryginalnym libretcie Nuittera
 *    i Saint-Léona z 1870 roku - przeformułowane.
 *  - Godziny łódzkie: 14.11 o 18:30 i 15.11 o 17:00, za stroną teatru. Nasz
 *    import miał je o godzinę za wcześnie; błąd naprawiony u źródła, patrz
 *    scripts/fix-lodz-godziny.mjs.
 *  - Polska premiera 7.12.1882 - wersja z Drive'a trzymała tę datę poza tekstem
 *    jako niepotwierdzoną. Jest potwierdzona: podaje ją karta spektaklu TW-ON
 *    ("Premiera polska: 7/12/1882, Teatr Wielki, Warszawa"). Tu i tak nie
 *    wchodzi, bo opisaliśmy ją w osobnym artykule o trzech "Coppéliach".
 *  - Nagłówki wersalikami zamienione na normalne. Sekcja "CZEGO NIE NAPISZEMY"
 *    to język redakcyjny, nie czytelniczy - przemianowana.
 *
 * ŹRÓDŁA:
 *  - "Der Sandmann", fabuła, motyw oczu, Olimpia, Spalanzani, Klara jako
 *    uosobienie oświecenia, Freud 1919 - portal E.T.A. Hoffmanna Biblioteki
 *    Państwowej w Berlinie oraz de.wikipedia.org "Der Sandmann (Hoffmann)"
 *  - "Coppelia, czyli Dziewczyna o szklanych oczach", Opera i Filharmonia
 *    Bałtycka, prapremiera 25.04.1987, chor. i libretto Vitałtas Brazdylis,
 *    kier. muz. i dyrygent Jerzy Michalak, scenografia Władysław Wigura -
 *    e-teatr.pl, karta realizacji, sprawdzone 23.10.2026
 *  - Łódź i Warszawa - operalodz.com i teatrwielki.pl, karty spektakli
 *
 * ZDJĘCIA: z gdańskiej "Coppélii", fot. Krzysztof Mystkowski / KFP / Opera
 * Bałtycka, przekazane redakcji przez Izabelę Sokołowską-Boulton. Łódzka
 * premiera odbyła się 17 października, ale teatr nie udostępnił jeszcze zdjęć;
 * warszawska jest dopiero przed nami. Kadr z lalką siedzącą bez ruchu z boku
 * sceny pasuje do tekstu o oczach lepiej niż cokolwiek z pozostałych teatrów.
 *
 * Idempotentny: po slug - patchuje istniejący, bez ruszania daty publikacji.
 */
import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const SLUG = 'coppelia-i-piaskun-co-balet-wzial-od-hoffmanna'

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

const TYTUL = 'Balet kończy się weselem. Opowiadanie, od którego się zaczęło, kończy się skokiem z wieży'

const ZAJAWKA =
  '„Coppélia" to najpogodniejszy tytuł klasycznego repertuaru: zalotna Swanilda, głupkowaty narzeczony, ' +
  'stary dziwak z lalką i wesele w finale. Opowiadanie, do którego się ją zwykle odsyła, jest historią człowieka, ' +
  'który traci zmysły i ginie. W tym sezonie „Coppélię" grają w Polsce trzy teatry. Gdańsk ma ją już za sobą, ' +
  'w listopadzie wraca do Łodzi, w grudniu premierę ma Polski Balet Narodowy.'

const tresc = (A) => [
  h2('Najpierw to, co na scenie'),
  block('Opera Bałtycka zagrała „Coppélię" 2, 3 i 4 października, w choreografii Johana Kobborga, który sam zatańczył Coppeliusa. Teatr Wielki w Łodzi pokazał swoją 17 października, po dwudziestu sześciu latach przerwy: choreografia Juliena Guérina, kierownictwo muzyczne Luis Gorelik. Kolejne dwa pokazy 14 listopada o 18:30 i 15 listopada o 17:00.'),
  block('Trzy tygodnie później, 6 grudnia, premierę ma warszawska „Coppélia" Polskiego Baletu Narodowego w choreografii Manuela Legrisa, który libretto napisał razem z Jean-François Vazelle\'em. Dyryguje Manuel Coves, scenografia Jean-Luc Simonini, kostiumy Stephanie Bäuerle, światła Maciej Igielski. Balet w trzech aktach, rzecz dzieje się - jak w oryginalnym libretcie z 1870 roku - w galicyjskim miasteczku, stąd mazur w partyturze. Teatr zapowiada jedenaście pokazów do 23 grudnia i opisuje spektakl jako propozycję familijną.'),
  block('Familijną i słusznie. Swanilda podejrzewa, że narzeczony durzy się w córce starego konstruktora automatów, zakrada się do pracowni, odkrywa, że rywalka jest lalką, przebiera się za nią i robi z całej sprawy żart. Kończy się weselem.'),
  blockZLinkiem('O trzech tegorocznych inscenizacjach, o prapremierze z 1870 roku i o tym, dlaczego akcja baletu toczy się akurat w Galicji, pisaliśmy osobno: ', 'Trzy „Coppélie" w jednym sezonie', 'https://swiatbaletu.pl/artykuly/trzy-coppelie-w-jednym-sezonie', '.'),

  h2('Teraz to, czego na scenie nie ma'),
  block('Opowiadanie, od którego ta historia się zaczęła, nazywa się „Piaskun" i otwiera zbiór E.T.A. Hoffmanna „Nachtstücke" z 1816 roku. Berlińska Biblioteka Państwowa, która prowadzi portal poświęcony Hoffmannowi, nazywa je najpopularniejszym jego tekstem; w Niemczech weszło do kanonu szkolnych lektur.'),
  block('Nathanael jako dziecko słyszy od niani opowieść o Piaskunie, który przychodzi po dzieci i wydziera im oczy. Nocnego gościa swojego ojca, prawnika Coppeliusa, utożsamia z tą postacią. Ojciec ginie przy eksperymencie z automatem.'),
  block('Lata później Nathanael kupuje lunetę od handlarza barometrów nazwiskiem Coppola, łudząco podobnego do Coppeliusa, i przez tę lunetę przygląda się Olimpii, rzekomej córce profesora Spalanzaniego. Zakochuje się. Odsuwa się od narzeczonej Klary, którą portal Biblioteki Berlińskiej nazywa wprost uosobieniem oświecenia.'),
  block('Olimpia okazuje się automatem. Nathanael popada w obłęd.'),
  block('Po chwilowym powrocie do zdrowia wchodzi z Klarą na wieżę ratusza. Tam wyjmuje lunetę Coppoli, patrzy przez nią na narzeczoną i próbuje zrzucić ją w dół; jej brat Lothar zdąża ją uratować. Nathanael dostrzega na rynku Coppeliusa, krzyczy coś o pięknych oczach, przeskakuje przez barierkę i ginie.'),

  h2('Oczy'),
  block('To jest ten motyw, który łączy opowiadanie i balet mocniej niż cokolwiek innego. U Hoffmanna strach zaczyna się od oczu wydzieranych dzieciom, przechodzi przez lunetę - narzędzie patrzenia, kupione od fałszywego Coppeliusa - i kończy się na wieży, gdzie ta sama luneta doprowadza bohatera do śmierci. W balecie zostaje z tego jedna rzecz: lalka, której spojrzenie nie jest spojrzeniem.'),
  obraz(A.lalka, 'Ze spektaklu w Gdańsku. fot. Krzysztof Mystkowski / KFP / Opera Bałtycka'),
  block('W 1919 roku Zygmunt Freud poświęcił „Piaskunowi" esej „Das Unheimliche", wiążąc lęk przed utratą oczu z lękiem kastracyjnym. To fakt o recepcji opowiadania, nie wyjaśnienie baletu, ale pokazuje, jak głęboko ten motyw siedzi w tekście.'),
  block('I jeszcze jedno, bliżej nas. Kiedy 25 kwietnia 1987 roku Opera Bałtycka wystawiła „Coppélię" w choreografii Vitałtasa Brazdylisa, zagrała ją pod tytułem „Coppelia, czyli Dziewczyna o szklanych oczach". Dyrygował Jerzy Michalak, scenografię przygotował Władysław Wigura. Ktoś w Gdańsku blisko czterdzieści lat temu dopisał do tego baletu podtytuł, który prowadzi prosto do Hoffmanna, i zrobił to w teatrze, nie w przypisie.'),

  h2('Balet nie jest adaptacją i nie udaje, że jest'),
  block('Ani Teatr Wielki w Łodzi, ani Teatr Wielki - Opera Narodowa nie wspominają Hoffmanna w opisach swoich spektakli. „Coppélia" z 1870 roku jest opowiadaniem inspirowana luźno i nie jest jego adaptacją; to dwie różne rzeczy i warto je rozdzielić. Balet wziął z „Piaskuna" automat, konstruktora i nazwisko. Resztę zostawił.'),
  block('Co nie znaczy, że zostawił bez śladu. Dziwaczność Coppeliusa, scena w pracowni pełnej nieruchomych figur, moment, w którym lalka zaczyna się ruszać - to wszystko jest w balecie i działa na widzu dokładnie tak, jak działać powinno. Po prostu w finale ktoś postanowił, że będzie wesele.'),

  h2('Gdzie zobaczyć'),
  block('Łódź: 14 listopada o 18:30 i 15 listopada o 17:00, choreografia Julien Guérin.'),
  block('Warszawa: premiera 6 grudnia, potem jedenaście pokazów do 23 grudnia, choreografia Manuel Legris.'),
  blockZLinkiem('Pełne repertuary wszystkich polskich teatrów operowych i baletowych zbieramy w jednym miejscu: ', 'swiatbaletu.pl/repertuar', 'https://swiatbaletu.pl/repertuar', '.'),
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
    okladka: await wgraj('coppelia-piaskun-okladka.jpg'),
    lalka:   await wgraj('coppelia-gd-final.jpg'),
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
      alt: 'Coppelius i podszywająca się pod lalkę Swanilda w gdańskiej „Coppélii"',
      zrodlo: 'fot. Krzysztof Mystkowski / KFP / Opera Bałtycka',
    },
    trescGlowna: body,
    autor: 'Redakcja Świat Baletu',
    dataPublikacji: new Date().toISOString(),
    featured: true,
    czasCzytania,
    tagi: ['Coppélia', 'E.T.A. Hoffmann', 'Piaskun', 'historia baletu', 'Léo Delibes', 'Teatr Wielki w Łodzi', 'Polski Balet Narodowy', 'Opera Bałtycka', 'Manuel Legris', 'Julien Guérin'],
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
