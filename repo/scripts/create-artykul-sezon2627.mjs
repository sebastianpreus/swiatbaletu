/**
 * Script: create-artykul-sezon2627.mjs
 * Tworzy artykuł "Sezon 2026/27 w Teatrze Wielkim" w Sanity
 * z obrazkami pobranymi ze strony teatrwielki.pl
 *
 * Uruchamianie: node scripts/create-artykul-sezon2627.mjs
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
// fetch is available natively in Node 18+

// Wczytaj .env.local
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim()
}

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: env.SANITY_API_TOKEN,
  useCdn: false,
})

// Obrazki do pobrania (URL teatrwielki.pl → klucz identyfikatora)
const IMAGES = {
  androidy: 'https://teatrwielki.pl/fileadmin/import/media/img/Sezon_2026_27/androidy_26_27_desktop_2.jpg',
  coppelia: 'https://teatrwielki.pl/fileadmin/import/media/img/Sezon_2026_27/04_Coppelia_Pod_Spektakl_1920x1600.jpg',
  symfoniaGallery: 'https://teatrwielki.pl/fileadmin/import/media/img/SPEKTAKLE_KONCERTY/symfonia_tanca/3.__Ssss...__Edwarda_Cluga__tancza_Daria_Majewska_i_Ryota_Kitai__fot._Ewa_Krasucka__EKR_2632.jpg',
  dracula: 'https://teatrwielki.pl/fileadmin/import/media/img/SPEKTAKLE_KONCERTY/Dracula/3._Chinara_Alizade__Mina__i_Ryota_Kitai__Hrabia_Dracula___fot._Ewa_Krasucka_Drac_EKR_3793.jpg',
  pieknoIronia: 'https://teatrwielki.pl/fileadmin/import/media/img/Sezon_2026_27/10_Piekno_Pod_Spektakl_1920x1600.jpg',
  calineczka: 'https://teatrwielki.pl/fileadmin/import/media/img/SPEKTAKLE_KONCERTY/Calineczka/Calineczka_www_fot._Marta_Ankiersztejn-2.jpg',
  matkiChersonia: 'https://teatrwielki.pl/fileadmin/import/media/img/Sezon_2026_27/01_Matki_Pod_Spektakl_1920x1600.jpg',
  donKichot: 'https://teatrwielki.pl/fileadmin/import/media/img/SPEKTAKLE_KONCERTY/Don_Kichot/01._DonKichot_IMG_7816_1.jpg',
}

// Funkcja uploadowania obrazka z URL do Sanity
async function uploadImageFromUrl(url, label) {
  console.log(`  ↑ Uploading: ${label}`)
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  if (!resp.ok) throw new Error(`Failed to fetch ${url}: ${resp.status}`)
  const arrayBuf = await resp.arrayBuffer()
  const buffer = Buffer.from(arrayBuf)
  const ext = url.split('.').pop().toLowerCase().split('?')[0]
  const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
  const contentType = mimeMap[ext] || 'image/jpeg'
  const asset = await client.assets.upload('image', buffer, {
    filename: `${label}.${ext}`,
    contentType,
  })
  console.log(`  ✓ Uploaded: ${label} → ${asset._id}`)
  return asset
}

// Blok tekstowy (normal paragraph)
function block(text, style = 'normal', marks = []) {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2),
    style,
    children: [
      {
        _type: 'span',
        _key: Math.random().toString(36).slice(2),
        text,
        marks,
      },
    ],
    markDefs: [],
  }
}

// Blok z linkiem
function blockWithLink(parts) {
  // parts: [{ text, href? }]
  const markDefs = []
  const children = parts.map(part => {
    const key = Math.random().toString(36).slice(2)
    if (part.href) {
      const markKey = 'lnk_' + Math.random().toString(36).slice(2, 8)
      markDefs.push({ _type: 'link', _key: markKey, href: part.href })
      return { _type: 'span', _key: key, text: part.text, marks: [markKey] }
    }
    return { _type: 'span', _key: key, text: part.text, marks: [] }
  })
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2),
    style: 'normal',
    children,
    markDefs,
  }
}

// Blok nagłówka h2
function h2(text) { return block(text, 'h2') }

// Blok cytatu
function blockquote(text) { return block(text, 'blockquote') }

// Blok obrazka (z już uploadowanym assetem)
function imageBlock(asset, alt) {
  return {
    _type: 'image',
    _key: Math.random().toString(36).slice(2),
    asset: { _type: 'reference', _ref: asset._id },
    alt,
  }
}

// Blok YouTube embed
function youtubeBlock(url) {
  return {
    _type: 'youtubeEmbed',
    _key: Math.random().toString(36).slice(2),
    url,
  }
}

// Blok listy punktowanej
function bulletList(items) {
  return items.map(text => ({
    _type: 'block',
    _key: Math.random().toString(36).slice(2),
    style: 'normal',
    listItem: 'bullet',
    children: [
      { _type: 'span', _key: Math.random().toString(36).slice(2), text, marks: [] },
    ],
    markDefs: [],
  }))
}

async function main() {
  console.log('\n🎭 Tworzenie artykułu: Sezon 2026/27 w Teatrze Wielkim\n')

  // 1. Upload images
  console.log('📷 Pobieranie i uploadowanie obrazków...')
  const assets = {}
  for (const [key, url] of Object.entries(IMAGES)) {
    try {
      assets[key] = await uploadImageFromUrl(url, key)
    } catch (e) {
      console.error(`  ✗ Błąd uploadu ${key}: ${e.message}`)
    }
  }

  console.log('\n📝 Budowanie treści artykułu...')

  // 2. Buduj treść (trescGlowna) jako tablicę bloków PortableText
  const tresc = [

    // === INTRO ===
    block('Konferencja prasowa nowego sezonu w Teatrze Wielkim – Operze Narodowej odbyła się 11 maja. Dyrektor naczelny Boris Kudlička zapowiedział dziesięć premier i wzrost liczby spektakli o blisko 20 procent, dyrektor muzyczny Yoel Gamzou – osobny cykl koncertów symfonicznych, a Krzysztof Pastor – program Polskiego Baletu Narodowego, w którym obok klasyki pojawiają się nowe choreografie Manuela Legrisa, Aleksandra Ekmana, Eyala Dadona i Katarzyny Kozielskiej.'),

    // === OTWARCIE ===
    h2('Otwarcie: gala i powrót „Androidów"'),
    blockWithLink([
      { text: 'Pierwszym akordem sezonu jest ' },
      { text: 'gala baletowa', href: 'https://teatrwielki.pl/kalendarium/2026-2027/gala-baletowa/' },
      { text: ' 12 i 13 września 2026 – wieczory na Sali Moniuszki z udziałem solistów Polskiego Baletu Narodowego oraz gości z Opery Paryskiej, Royal Ballet i La Scali. Od 17 września na scenę wraca ' },
      { text: '„Androidy"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/androidy/' },
      { text: ' Roberta Bondary z muzyką Przemysława Zycha – opowieść o człowieku w epoce sztucznej inteligencji, której premiera odbyła się 10 maja 2026 i od początku zbiera bardzo pozytywne opinie. We wrześniu zaplanowano sześć wieczorów z tym spektaklem (17, 18, 19 – dwa razy, 20 i 22).' },
    ]),
    ...(assets.androidy ? [imageBlock(assets.androidy, 'Androidy – balet Roberta Bondary, Teatr Wielki Opera Narodowa')] : []),

    // === COPPÉLIA ===
    h2('Coppélia po półwieczu: premiera 6 grudnia'),
    blockWithLink([
      { text: 'Pierwsza z dwóch wielkich premier baletowych sezonu – ' },
      { text: '„Coppélia"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/coppelia/' },
      { text: ' do muzyki Léo Delibes\'a w choreografii Manuela Legrisa, byłego dyrektora Wiener Staatsballett, do libretta współtworzonego z Jean-François Vazelle\'em. To pierwsza inscenizacja tego tytułu w Warszawie od półwiecza – Krzysztof Pastor zaznaczał, że ma ona umocować klasykę na stałe w repertuarze zespołu. Po premierze 6 grudnia – dziesięć wieczorów do końca grudnia (9, 12, 15, 16 dwa razy, 17, 19, 22 dwa razy, 23) i powrót 22 stycznia.' },
    ]),
    ...(assets.coppelia ? [imageBlock(assets.coppelia, 'Coppélia – premiera 6 grudnia 2026, choreografia Manuel Legris')] : []),

    // === SYMFONIA TAŃCA BIS ===
    h2('„Symfonia tańca BIS": Balanchine, Clug, Pastor'),
    blockWithLink([
      { text: '31 października do Moniuszki wraca ' },
      { text: '„Symfonia tańca BIS"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/symfonia-tanca-bis/' },
      { text: ' – jednowieczorny program złożony z trzech choreografii. Otwiera go „Symphony in C” George’a Balanchine’a do muzyki Bizeta, środkową częścią jest „Ssss...” Edwarda Cluga do muzyki elektronicznej, a sygnowana przez Krzysztofa Pastora finalna odsłona idzie do Ravela. To wiecz\xf3r, w kt\xf3rym ten sam zesp\xf3ł pokazuje trzy zupełnie r\xf3żne słowniki ruchu – od neoklasycznego Balanchine’a po teatralną ekspresję Cluga. Reprize 3 i 14 listopada.' },
    ]),
    ...(assets.symfoniaGallery ? [imageBlock(assets.symfoniaGallery, '„Ssss..." Edwarda Cluga – część wieczoru „Symfonia tańca BIS"')] : []),

    // === POWROTY ===
    h2('Powroty: od Giselle do Prometeusza'),
    blockWithLink([
      { text: 'Po przerwie wraca ' },
      { text: '„Dracula"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/dracula/' },
      { text: ' Wojciecha Kilara w choreografii Krzysztofa Pastora – 27 i 28 lutego, plus pięć wieczorów marcowych (2, 3, 6, 9 i 10). Spektakl, który Pastor stworzył dla warszawskiej sceny, pozostaje jego najmocniejszym autorskim tytułem fabularnym. Równolegle w lutym – dziewięć wieczorów ' },
      { text: '„Don Kichota"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/don-kichot/' },
      { text: ' Minkusa w klasycznej choreografii Petipy i Gorskiego w opracowaniu Aleksieja Fadiejeczewa (premiera: 2014). ' },
      { text: '„Giselle"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/giselle/' },
      { text: ' w klasycznej choreografii Coralli, Perrota i Petipy idzie cztery razy na przełomie września i października.' },
    ]),
    blockWithLink([
      { text: 'Kolejne powracające mocne tytuły to ' },
      { text: '„Prometeusz"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/prometeusz/' },
      { text: ' do muzyki Philipa Glassa i Mozarta w choreografii Pastora (prapremiera: czerwiec 2025), który gra siedem razy w kwietniu, oraz ' },
      { text: '„Urojenia"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/urojenia/' },
      { text: ' Izadory Weiss – koprodukcyjny powrót choreografki na warszawską scenę po latach. „Urojenia" to wieczór do muzyki Beethovena, Ecclesa, Kanchelego, Zoë Keating, Szymanowskiego, Caroline Shaw, Tabakovej i Vivaldiego – trzy razy w marcu (18, 19, 20, 21) i cztery razy w czerwcu (5, 6, 8, 9).' },
    ]),
    ...(assets.dracula ? [imageBlock(assets.dracula, 'Dracula – Chinara Alizade i Ryota Kitai, fot. Ewa Krasucka')] : []),

    // === PIĘKNO I IRONIA ===
    h2('Piękno i Ironia: premiera majowa z Ekmanem'),
    blockWithLink([
      { text: 'Druga premiera baletowa sezonu – 14 maja 2027 – to wieczór ' },
      { text: '„Piękno i ironia"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/piekno-i-ironia/' },
      { text: ', złożony z trzech nowych choreografii. Pierwszą część sygnuje Katarzyna Kozielska, polska choreografka pracująca regularnie z Bayerisches Staatsballett, Pacific Northwest Ballet i Stuttgarter Ballett – do muzyki Paula Dreshera. Środek wieczoru tworzy Eyal Dadon, izraelski choreograf związany z Batshevą. Finał podpisze Alexander Ekman – jego choreografia powstanie do muzyki Beethovena, Haydna, Schuberta i Andy\'ego Steina. To dla zespołu Krzysztofa Pastora pierwsza współpraca z Ekmanem.' },
    ]),
    ...(assets.pieknoIronia ? [imageBlock(assets.pieknoIronia, '„Piękno i ironia" – premiera 14 maja 2027')] : []),

    // === PBN JUNIOR ===
    h2('Polski Balet Narodowy Junior: Juvenalia 5 i 6, Kreacje 19'),
    blockWithLink([
      { text: 'Młodsza scena – Sala Młynarskiego – dostaje w sezonie sześć wieczorów Polskiego Baletu Narodowego Junior (' },
      { text: '„Juvenalia 5"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/juvenalia-5/' },
      { text: ' w listopadzie i styczniu, ' },
      { text: '„Juvenalia 6"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/juvenalia-6/' },
      { text: ' w maju i czerwcu) oraz cykl ' },
      { text: '„Kreacje 19"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/kreacje-19/' },
      { text: ' (19, 21 i 23 lutego) – warsztaty choreograficzne, w których tancerze PBN pokazują własne, samodzielne prace. To w tych projektach najwyraźniej widać następne pokolenie.' },
    ]),

    // === DLA NAJMŁODSZYCH ===
    h2('Dla najmłodszych: „Kopciuszek" i „Calineczka"'),
    blockWithLink([
      { text: 'Część baletowa dla dzieci to ' },
      { text: '„Kopciuszek"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/kopciuszek/' },
      { text: ' do muzyki Masseneta dla widzów od szóstego roku życia (listopad, styczeń, maj) oraz ' },
      { text: '„Calineczka"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/calineczka/' },
      { text: ' dla widzów 8–13 lat (wrzesień, kwiecień). Towarzyszą im edukacyjne cykle „Mała Akademia Teatru" i „Wielki dla Małych".' },
    ]),
    ...(assets.calineczka ? [imageBlock(assets.calineczka, 'Calineczka – spektakl dla dzieci, fot. Marta Ankiersztejn')] : []),

    // === CYTAT ===
    blockquote('„Tworzymy nowe przestrzenie, nie burząc fundamentów." — Boris Kudlička, dyrektor naczelny TW-ON, 11 maja 2026'),

    // === YOUTUBE ===
    youtubeBlock('https://www.youtube.com/watch?v=xlLMSSsmeIY'),

    // === OPERA ===
    h2('Dziesięć premier operowych. Co warto zapamiętać'),
    blockWithLink([
      { text: 'Sezon operowy zaczyna się mocnym uderzeniem. 16 października – światowa prapremiera ' },
      { text: '„Matki Chersonia"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/matki-chersonia/' },
      { text: ' Maksyma Kolomijca do libretta George\'a Branta, opowieść o ukraińskich dzieciach uprowadzonych przez Rosję. Dzieło zamówione wspólnie z Metropolitan Opera; reżyseria Barbary Wysockiej, dyrygent Keri-Lynn Wilson, w obsadzie m.in. Olga Bezsmertna, Izabela Matuła, Małgorzata Walewska i islandzki baryton Ólafur Sigurðarson. „Matki Chersonia" pojadą rok później do Nowego Jorku.' },
    ]),
    blockWithLink([
      { text: '20 listopada – w Nowym Teatrze nowa ' },
      { text: '„Czarodziejska góra"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/czarodziejska-gora/' },
      { text: ' Pawła Mykietyna w reżyserii Andrzeja Chyry, do libretta Małgorzaty Sikorskiej-Miszczuk. 22 listopada – ' },
      { text: '„Salome"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/salome/' },
      { text: ' Richarda Straussa w reżyserii Clausa Gutha, koprodukcja z Teatro Real w Madrycie, partia tytułowa: Monika Radecka, dyryguje Yoel Gamzou.' },
    ]),
    blockWithLink([
      { text: '17 stycznia 2027 – ' },
      { text: '„Katia Kabanowa"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/katia-kabanowa/' },
      { text: ' Leoša Janáčka w reżyserii Kornéla Mundruczó (Aušrinė Stundytė i Natalia Tanasii w partii tytułowej, Evelyn Herlitzius jako Kabanicha; dyryguje Yoel Gamzou). 25 lutego – polska prapremiera ' },
      { text: '„Najlepsze miasto świata. Opera o Warszawie"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/najlepsze-miasto-swiata-opera-o-warszawie/' },
      { text: ' Cezarego Duchnowskiego do libretta Beniamina M. Bukowskiego, na motywach książki Grzegorza Piątka. Spektakl zostanie zarejestrowany przez Telewizję Polską.' },
    ]),
    blockWithLink([
      { text: '4 marca – prapremiera ' },
      { text: '„Ślōnskie gołymbie. Śląska opowieść o miłości, pracy i cudzie"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/sloonskie-golymbie/' },
      { text: ' – kameralny spektakl muzyczny w koprodukcji z Muzeum Historii Polski i Operą Śląską w Bytomiu, koncepcja muzyczna Łukasza Godyli, scenariusz i reżyseria Anny Hop. Po sukcesie kaszubskiego „Wòlô Bòskô" jest to kolejny etap projektu o regionalnych językach i folklorach.' },
    ]),
    blockWithLink([
      { text: '25 marca – jeden z najmocniejszych punktów sezonu: ' },
      { text: '„Głos ludzki"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/glos-ludzki-another-silence-oczekiwanie/' },
      { text: ' Poulenca, „Another silence" (monodram aktorski) i „Erwartung" Schönberga w reżyserii Christophera Loya. Trzy kobiety, trzy stany po stracie. Środkową część Loy buduje z udziałem Mai Ostaszewskiej; obok niej śpiewają Malin Byström i Marianne Croux. Dyryguje Robert Jindra.' },
    ]),
    blockWithLink([
      { text: '23 kwietnia – ' },
      { text: '„Poławiacze pereł"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/polawiacze-perel/' },
      { text: ' Bizeta w inscenizacji Ersana Mondtaga (koprodukcja z Wiener Staatsoper) z Magdaleną Lucjan w partii Leïli i Akselem Daveyanem; dyryguje Piotr Jaworski, nowy zastępca dyrektora muzycznego TW-ON.' },
    ]),
    blockWithLink([
      { text: '4 czerwca – ' },
      { text: '„Opowieści Hoffmanna"', href: 'https://teatrwielki.pl/kalendarium/2026-2027/opowiesci-hoffmanna/' },
      { text: ' Offenbacha w reżyserii Lydii Steier (koprodukcja ze Staatsoper Unter den Linden), w obsadzie Kang Wang, Aleksandra Olczyk, Gabriela Legun i Adam Pałka; dyryguje Pierre Dumoussaud.' },
    ]),
    ...(assets.matkiChersonia ? [imageBlock(assets.matkiChersonia, '„Matki Chersonia" – światowa prapremiera 16 października 2026')] : []),

    // === BEZ TRELIŃSKIEGO ===
    h2('Bez premiery Trelińskiego – ale z Master Class'),
    block('Po raz pierwszy od lat sezon w Teatrze Wielkim odbywa się bez premiery przygotowanej przez Mariusza Trelińskiego, dzisiaj pełnomocnika ds. artystycznych TW-ON. Reżyser poprowadzi natomiast cykl warsztatów Master Class – dla młodszych inscenizatorów operowych. Drugim takim okołoprogramowym wątkiem jest „Opera i sztuka" – współpraca z Mirosławem Bałką i Piotrem Uklańskim.'),

    // === WIELKIE GŁOSY / GAMZOU ===
    h2('Wielkie Głosy i nowa seria symfoniczna Yoela Gamzou'),
    blockWithLink([
      { text: '„Wielkie Głosy" trwa w nowej, recitalowej formule – 13 marca ' },
      { text: 'Jakub Józef Orliński', href: 'https://teatrwielki.pl/kalendarium/2026-2027/jakub-jozef-orlinski-wielkie-glosy/' },
      { text: ' z Michałem Bielem, 2 maja ' },
      { text: 'Aigul Akhmetshina', href: 'https://teatrwielki.pl/kalendarium/2026-2027/aigul-akhmetshina-wielkie-glosy/' },
      { text: ' z Jonathanem Pappem. Równolegle Yoel Gamzou otwiera własny cykl koncertów symfonicznych – 26 września II Symfonia „Zmartwychwstanie" Mahlera (soliści: Marie Smolka i Beth Taylor), 29 stycznia „Wariacje Enigma" Elgara pod batutą Marka Wigglesworth\'a, 26 marca koncert verdiowski w ramach 31. Wielkanocnego Festiwalu Beethovena, 8 maja program Szymanowski / Golijov / Czajkowski, 11 czerwca „From England with Love" z muzyką Waltona, Bacewicz, ale też Beatlesów i Queen w drugiej części. Galę Sylwestrową i Koncert Noworoczny sygnują Benjamin Grosvenor, Sophie Bevan i Hubert Kowalczyk.' },
    ]),
    blockWithLink([
      { text: 'Sezon zamyka tygodniowa rezydencja ' },
      { text: 'Ukrainian Freedom Orchestra', href: 'https://teatrwielki.pl/kalendarium/2026-2027/ukrainian-freedom-orchestra-swiadectwo-niezlomnosci/' },
      { text: ' w Warszawie – program z prawykonaniem „Glorii" Bohdany Frolyak, „Rückert-Liedern" Mahlera i VII Symfonią Beethovena, przed tournée po Europie i USA.' },
    ]),

    // === OPERA NOWYCH MOŻLIWOŚCI ===
    h2('Opera nowych możliwości: ponad 100 mln zł'),
    block('Najważniejszy wątek pozaartystyczny konferencji to program inwestycyjny „Opera nowych możliwości" – siedem zadań modernizacyjnych w gmachu Teatru Wielkiego, łącznie ponad 100 milionów zł. Zaplanowano m.in. nową salę teatralną i sale konferencyjne na trzecim piętrze, modernizację sal redutowych, przebudowę podscenia i utworzenie nowej przestrzeni edukacyjnej. Pierwsze etapy startują jeszcze w tym sezonie, całość zaplanowano do początku 2028 r.'),

    // === DATY DO KALENDARZA ===
    h2('Daty, które warto wpisać do kalendarza'),
    ...bulletList([
      '12–13 IX 2026 – Gala baletowa, otwarcie sezonu (Sala Moniuszki)',
      '17 IX 2026 – powrót „Androidów" Roberta Bondary',
      '16 X 2026 – PREMIERA: „Matki Chersonia" Maksyma Kolomijca (światowa prapremiera)',
      '31 X 2026 – „Symfonia tańca BIS" – Balanchine / Clug / Pastor',
      '6 XII 2026 – PREMIERA: „Coppélia" w choreografii Manuela Legrisa',
      '27 II 2027 – powrót „Draculi" Krzysztofa Pastora',
      '4 II 2027 – start cyklu „Don Kichota" (9 wieczorów lutowych)',
      '18 III 2027 – „Urojenia" Izadory Weiss',
      '8 IV 2027 – „Prometeusz" (Glass / Mozart / Pastor)',
      '14 V 2027 – PREMIERA: „Piękno i ironia" (Kozielska / Dadon / Ekman)',
      '19, 21, 23 II 2027 – „Kreacje 19" – młode choreografie PBN',
    ]),

    block('Bilety w sprzedaży od 21 maja 2026, godz. 11:00 → teatrwielki.pl/kalendarium'),

  ]

  // 3. Utwórz dokument artykułu w Sanity
  console.log('\n📤 Tworzenie dokumentu artykułu w Sanity...')

  const doc = {
    _type: 'artykul',
    tytul: 'Sezon 2026/27 w Teatrze Wielkim',
    slug: { _type: 'slug', current: 'sezon-2026-27-w-teatrze-wielkim' },
    kategoria: 'Premiera',
    zajawka: 'Pierwszy sezon pod dyrekcją Borisa Kudlički to dla zespołu Krzysztofa Pastora dwie premiery na dużej scenie, „Symfonia tańca BIS" na otwarcie listopada, powrót „Draculi" i czternaście wieczorów „Don Kichota".',
    autor: 'Redakcja Świat Baletu',
    dataPublikacji: new Date().toISOString(),
    featured: true,
    czasCzytania: 8,
    tagi: ['Teatr Wielki', 'Polski Balet Narodowy', 'sezon 2026/27', 'Krzysztof Pastor', 'Boris Kudlička'],
    trescGlowna: tresc,
  }

  const result = await client.create(doc)
  console.log(`\n✅ Artykuł utworzony!`)
  console.log(`   ID: ${result._id}`)
  console.log(`   URL: https://swiatbaletu.vercel.app/artykuly/${result.slug.current}`)
  console.log(`   Studio: https://nri4izo1.sanity.studio/structure/artykul;${result._id}\n`)
}

main().catch(err => {
  console.error('\n❌ Błąd:', err.message)
  process.exit(1)
})
