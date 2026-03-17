/**
 * Update theater data in Sanity with real descriptions and photos
 * Run: node scripts/update-theaters.mjs
 */
import { createClient } from 'next-sanity'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Real theater photos from Wikipedia (via API - verified URLs)
const THEATER_PHOTOS = {
  'teatr-warszawa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Warszawa%2C_ul._Senatorska_21%2C_25_20170516_001.jpg/1280px-Warszawa%2C_ul._Senatorska_21%2C_25_20170516_001.jpg',
  'teatr-krakow': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Krakow_Opera_house%2C_2008_by_arch._Romuald_Loegler%2C_48_Lubicz_street%2C_Krak%C3%B3w%2C_Poland.jpg/1280px-Krakow_Opera_house%2C_2008_by_arch._Romuald_Loegler%2C_48_Lubicz_street%2C_Krak%C3%B3w%2C_Poland.jpg',
  'teatr-gdansk': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Opera_Ba%C5%82tycka_w_Gda%C5%84sku.JPG/1280px-Opera_Ba%C5%82tycka_w_Gda%C5%84sku.JPG',
  'teatr-lodz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/2012-06-02_Photo_from_tram_trip_09.jpg/1280px-2012-06-02_Photo_from_tram_trip_09.jpg',
  'teatr-poznan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Budynek_Teatru_Wielkiego_w_Poznaniu.jpg/1280px-Budynek_Teatru_Wielkiego_w_Poznaniu.jpg',
  'teatr-wroclaw': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Opera_We_Wroclawiu_%28152991775%29.jpeg/1280px-Opera_We_Wroclawiu_%28152991775%29.jpeg',
}

// Real theater descriptions as Portable Text blocks
const THEATER_DATA = {
  'teatr-warszawa': {
    adres: 'Plac Teatralny 1, 00-077 Warszawa',
    rokZalozenia: 1833,
    liczbaMiejsc: 1828,
    dyrektorArtystyczny: 'Waldemar Dąbrowski',
    stronaWww: 'https://teatrwielki.pl',
    linkBilety: 'https://teatrwielki.pl/repertuar/',
    opis: [
      {
        _type: 'block', _key: 'w1',
        style: 'h2',
        children: [{ _type: 'span', _key: 'w1s', text: 'Historia' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'w2',
        style: 'normal',
        children: [{ _type: 'span', _key: 'w2s', text: 'Teatr Wielki w Warszawie to monumentalny gmach przy Placu Teatralnym, wzniesiony w latach 1825\u20131833 w stylu klasycystycznym według projektu Antonia Corazziego. Kamień węgielny położono 19 listopada 1825 roku, w 60. rocznicę utworzenia Teatru Narodowego. Pierwsze przedstawienie — opera „Cyrulik sewilski" Rossiniego i balet Kurpińskiego — odbyło się 24 lutego 1833 roku.' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'w3',
        style: 'normal',
        children: [{ _type: 'span', _key: 'w3s', text: 'Podczas II wojny światowej budynek został niemal całkowicie zniszczony — ocalała jedynie klasycystyczna fasada. Odbudowa według projektu Bohdana Pniewskiego trwała do 1965 roku. Uroczyste otwarcie odbudowanego gmachu nastąpiło 19 listopada 1965 roku premierą „Strasznego dworu" Moniuszki.' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'w4',
        style: 'h2',
        children: [{ _type: 'span', _key: 'w4s', text: 'Budynek i scena' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'w5',
        style: 'normal',
        children: [{ _type: 'span', _key: 'w5s', text: 'Dziś Teatr Wielki jest jedną z największych scen operowych na świecie — scena główna w Sali Moniuszki mieści 1828 widzów, a jej powierzchnia wynosi 1150 m² przy wysokości 35 metrów. Gmach jest siedzibą Opery Narodowej i Polskiego Baletu Narodowego. Na fasadzie od 2002 roku znajduje się brązowa Kwadryga Apollina autorstwa profesorów ASP — Adama Myjaka i Antoniego Janusza Pastwy.' }],
        markDefs: []
      },
    ]
  },
  'teatr-krakow': {
    adres: 'ul. Lubicz 48, 31-512 Kraków',
    rokZalozenia: 1954,
    liczbaMiejsc: 764,
    dyrektorArtystyczny: 'Bogdan Tosza',
    stronaWww: 'https://opera.krakow.pl',
    linkBilety: 'https://opera.krakow.pl/repertuar',
    opis: [
      {
        _type: 'block', _key: 'k1',
        style: 'h2',
        children: [{ _type: 'span', _key: 'k1s', text: 'Historia' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'k2',
        style: 'normal',
        children: [{ _type: 'span', _key: 'k2s', text: 'Związki Krakowa z operą sięgają 1628 roku, gdy jedna z podwawelskich drukarni wydała pierwsze libretto operowe w języku polskim. Opera jako instytucja powstała w 1954 roku — pierwszym spektaklem był „Rigoletto" Verdiego. Początkowo zespół korzystał z sali Domu Żołnierza przy ul. Lubicz 48, dawnej austriackiej ujeżdżalni koni, a następnie występował w Teatrze im. Słowackiego.' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'k3',
        style: 'normal',
        children: [{ _type: 'span', _key: 'k3s', text: 'W 2002 roku rozpisano konkurs architektoniczny, który wygrał projekt krakowskiego architekta Romualda Loeglera. Budowę nowego gmachu rozpoczęto we wrześniu 2004 roku, a uroczyste otwarcie nastąpiło 13 grudnia 2008. To pierwszy gmach operowy zbudowany w Polsce po 1989 roku.' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'k4',
        style: 'h2',
        children: [{ _type: 'span', _key: 'k4s', text: 'Budynek' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'k5',
        style: 'normal',
        children: [{ _type: 'span', _key: 'k5s', text: 'Współczesny kompleks składa się z trzech brył opartych na kompozycji kwadratów i sześcianów, z charakterystycznym pasem ściany z czerwonych szklanych paneli. Zabytkowa dawna ujeżdżalnia z półokrągłym dachem została wpisana w nową bryłę — mieści główne wejście, hol kasowy, foyer i restaurację z tarasem. Widownia główna liczy 764 miejsca, scena ma powierzchnię 443 m².' }],
        markDefs: []
      },
    ]
  },
  'teatr-gdansk': {
    adres: 'al. Zwycięstwa 15, 80-219 Gdańsk',
    rokZalozenia: 1950,
    liczbaMiejsc: 476,
    dyrektorArtystyczny: 'Romuald Wicza-Pokojski',
    stronaWww: 'https://operabaltycka.pl',
    linkBilety: 'https://operabaltycka.pl/repertuar',
    opis: [
      {
        _type: 'block', _key: 'g1',
        style: 'h2',
        children: [{ _type: 'span', _key: 'g1s', text: 'Historia' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'g2',
        style: 'normal',
        children: [{ _type: 'span', _key: 'g2s', text: 'Tradycje operowe w Gdańsku sięgają 1646 roku, gdy artyści teatru królewskiego wystawili „Le nozze d\'Amore e di Psiche" Marco Scacchiego z okazji przyjazdu królowej Ludwiki Marii Gonzagi. Współczesna Opera Bałtycka rozpoczęła działalność 28 czerwca 1950 roku premierą „Eugeniusza Oniegina" Czajkowskiego.' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'g3',
        style: 'normal',
        children: [{ _type: 'span', _key: 'g3s', text: 'Budynek opery powstał w latach 1914–1915 jako maneż — ujeżdżalnia koni zaprojektowana przez Ernsta Schade na zlecenie Stowarzyszenia Handlu Końmi. Był bardzo nowoczesny, wyposażony w centralne ogrzewanie. Szybko zmienił przeznaczenie na halę widowiskowo-sportową, a w latach 30. odbywały się w nim wiece partii nazistowskiej.' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'g4',
        style: 'h2',
        children: [{ _type: 'span', _key: 'g4s', text: 'Współczesność' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'g5',
        style: 'normal',
        children: [{ _type: 'span', _key: 'g5s', text: 'W 1994 roku opera stała się samodzielną instytucją artystyczną. Pomimo licznych przebudów, Opera Bałtycka z 476 miejscami pozostaje najmniejszą salą operową w Polsce. W lipcu 2025 roku zapadła decyzja o lokalizacji nowej opery na Placu Zebrań Ludowych — otwarcie nowego obiektu planowane jest na 2032 rok.' }],
        markDefs: []
      },
    ]
  },
  'teatr-lodz': {
    adres: 'pl. Dąbrowskiego 1, 90-249 Łódź',
    rokZalozenia: 1967,
    liczbaMiejsc: 1074,
    dyrektorArtystyczny: 'Romuald Kaczmarek',
    stronaWww: 'https://operalodz.com',
    linkBilety: 'https://operalodz.com/repertuar',
    opis: [
      {
        _type: 'block', _key: 'l1',
        style: 'h2',
        children: [{ _type: 'span', _key: 'l1s', text: 'Historia' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'l2',
        style: 'normal',
        children: [{ _type: 'span', _key: 'l2s', text: 'Teatr Wielki w Łodzi to druga pod względem wielkości scena operowa w Polsce. Jego historia sięga 1948 roku, gdy Leon Schiller powołał Komitet Budowy Teatru Narodowego w Łodzi. Monumentalny gmach w stylu klasycyzującego socrealizmu zaprojektowali Witold Korski, Józef Korski i Roman Szymborski.' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'l3',
        style: 'normal',
        children: [{ _type: 'span', _key: 'l3s', text: 'Budowa trwała od 1949 do 1966 roku. Uroczyste otwarcie nastąpiło 19 stycznia 1967 roku cyklem premier: „Halką" i „Strasznym dworem" Moniuszki, „Kniaźiem Igorem" Borodina oraz „Carmen" Bizeta. Kubatura budynków wynosi łącznie 195 000 m³, a fosa orkiestrowa mieści 70 muzyków.' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'l4',
        style: 'h2',
        children: [{ _type: 'span', _key: 'l4s', text: 'Budynek' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'l5',
        style: 'normal',
        children: [{ _type: 'span', _key: 'l5s', text: 'Gmach dominuje nad Placem Dąbrowskiego i jest wpisany do Rejestru Zabytków. Widownia po modernizacji z 2003 roku liczy 1074 miejsca. W 2012 roku budynek przeszedł gruntowną modernizację dzięki środkom z Funduszu Europejskiego. Do dziś Teatr przygotował ponad 350 premier operowych i baletowych.' }],
        markDefs: []
      },
    ]
  },
  'teatr-poznan': {
    adres: 'ul. Fredry 9, 61-701 Poznań',
    rokZalozenia: 1910,
    liczbaMiejsc: 936,
    dyrektorArtystyczny: 'Renata Borowska-Juszczyńska',
    stronaWww: 'https://opera.poznan.pl',
    linkBilety: 'https://opera.poznan.pl/repertuar',
    opis: [
      {
        _type: 'block', _key: 'p1',
        style: 'h2',
        children: [{ _type: 'span', _key: 'p1s', text: 'Historia' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'p2',
        style: 'normal',
        children: [{ _type: 'span', _key: 'p2s', text: 'Teatr Wielki im. Stanisława Moniuszki w Poznaniu to zabytkowy gmach przy ul. Fredry 9, wzniesiony w latach 1909–1910 według projektu monachijskiego architekta Maxa Littmanna. Neoklasycystyczny budynek otwarto we wrześniu 1910 roku premierą „Czarodziejskiego fletu" Mozarta.' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'p3',
        style: 'normal',
        children: [{ _type: 'span', _key: 'p3s', text: 'Po powstaniu wielkopolskim, 31 sierpnia 1919 roku, odbyła się inauguracja polskiego teatru — wystawieniem „Halki" Moniuszki. Opera Poznańska była pierwszym w Polsce teatrem operowym, który wznowił działalność po II wojnie światowej — już 2 czerwca 1945 roku.' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'p4',
        style: 'h2',
        children: [{ _type: 'span', _key: 'p4s', text: 'Architektura' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'p5',
        style: 'normal',
        children: [{ _type: 'span', _key: 'p5s', text: 'Fasada to monumentalny portyk z sześcioma jońskimi kolumnami podtrzymującymi trójkątny tympanon z symbolem teatru — pegazem. Wejście zdobią rzeźby: po lewej kobieta na lwie symbolizująca Lirykę, po prawej mężczyzna prowadzący panterę — symbol Dramatu. Budynek wpisany jest do rejestru zabytków i stanowi część Dzielnicy Cesarskiej.' }],
        markDefs: []
      },
    ]
  },
  'teatr-wroclaw': {
    adres: 'ul. Świdnicka 35, 50-066 Wrocław',
    rokZalozenia: 1841,
    liczbaMiejsc: 650,
    dyrektorArtystyczny: 'Tomasz Szreder',
    stronaWww: 'https://opera.wroclaw.pl',
    linkBilety: 'https://opera.wroclaw.pl/repertuar',
    opis: [
      {
        _type: 'block', _key: 'wr1',
        style: 'h2',
        children: [{ _type: 'span', _key: 'wr1s', text: 'Historia' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'wr2',
        style: 'normal',
        children: [{ _type: 'span', _key: 'wr2s', text: 'Opera Wrocławska mieści się w klasycystycznym gmachu przy ul. Świdnickiej, wzniesionym w latach 1839–1841 według projektu Carla Ferdinanda Langhansa. Otwarcie nastąpiło 13 listopada 1841 roku koncertem „Egmonta" Beethovena. W XIX wieku budynek przeżył dwa pożary (1865 i 1871), po których został odbudowany i rozbudowany.' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'wr3',
        style: 'normal',
        children: [{ _type: 'span', _key: 'wr3s', text: 'Po II wojnie światowej, 8 września 1945 roku, Opera wznowiła działalność jako polska instytucja premierą „Halki" Moniuszki w reżyserii Stanisława Drabika. Gruntowna modernizacja trwała od 1997 do 2006 roku, przywracając budynkowi dawny blask.' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'wr4',
        style: 'h2',
        children: [{ _type: 'span', _key: 'wr4s', text: 'Budynek' }],
        markDefs: []
      },
      {
        _type: 'block', _key: 'wr5',
        style: 'normal',
        children: [{ _type: 'span', _key: 'wr5s', text: 'Gmach liczy 7 pięter, z czego dwa znajdują się pod ziemią. Zachowały się XIX-wieczne zdobienia — plafon z portretami kompozytorów, główny żyrandol i loża cesarska. Na złocenia wnętrz wykorzystano 2 kilogramy szczerego złota. Widownia mieści dziś 650 osób. Opera Wrocławska pozostaje jednym z najważniejszych zabytków architektonicznych miasta.' }],
        markDefs: []
      },
    ]
  },
}

async function downloadAndUpload(url, filename) {
  console.log(`  Downloading ${filename}...`)
  const response = await fetch(url, {
    headers: { 'User-Agent': 'SwiatBaletu/1.0 (sebastian@swiatbaletu.pl)' }
  })
  if (!response.ok) {
    console.log(`  FAILED to download ${filename}: ${response.status}`)
    return null
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  console.log(`  Uploading ${filename} to Sanity (${(buffer.length / 1024).toFixed(0)} KB)...`)
  const asset = await client.assets.upload('image', buffer, { filename })
  console.log(`  Uploaded: ${asset._id}`)
  return asset._id
}

async function main() {
  console.log('=== Updating theater data in Sanity ===\n')

  for (const [teatrId, data] of Object.entries(THEATER_DATA)) {
    console.log(`\n--- ${teatrId} ---`)

    // Upload photo if available
    const photoUrl = THEATER_PHOTOS[teatrId]
    let imageAssetId = null
    if (photoUrl) {
      try {
        imageAssetId = await downloadAndUpload(photoUrl, `${teatrId}.jpg`)
      } catch (err) {
        console.log(`  Photo upload failed: ${err.message}`)
      }
    }

    // Build patch
    const patch = client.patch(teatrId)
      .set({
        adres: data.adres,
        rokZalozenia: data.rokZalozenia,
        liczbaMiejsc: data.liczbaMiejsc,
        dyrektorArtystyczny: data.dyrektorArtystyczny,
        stronaWww: data.stronaWww,
        linkBilety: data.linkBilety,
        opis: data.opis,
      })

    if (imageAssetId) {
      patch.set({
        zdjecie: {
          _type: 'image',
          asset: { _type: 'reference', _ref: imageAssetId },
          alt: `Budynek ${data.adres.split(',')[0]} — ${teatrId.replace('teatr-', '').charAt(0).toUpperCase() + teatrId.replace('teatr-', '').slice(1)}`,
        },
      })
    }

    await patch.commit()
    console.log(`  Updated ${teatrId} ✓`)
  }

  console.log('\n=== Done! All theaters updated. ===')
}

main().catch(console.error)
