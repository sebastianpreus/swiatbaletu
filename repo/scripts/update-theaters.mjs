/**
 * Update theater data in Sanity with real Wikipedia data and Wikimedia Commons photos
 * Run: cd repo && node scripts/update-theaters.mjs
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

// Wikimedia Commons photos (verified URLs)
const THEATER_PHOTOS = {
  'teatr-warszawa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Warszawa%2C_ul._Senatorska_21%2C_25_20170516_001.jpg/1280px-Warszawa%2C_ul._Senatorska_21%2C_25_20170516_001.jpg',
  'teatr-krakow': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Krakow_Opera_house%2C_2008_by_arch._Romuald_Loegler%2C_48_Lubicz_street%2C_Krak%C3%B3w%2C_Poland.jpg/1280px-Krakow_Opera_house%2C_2008_by_arch._Romuald_Loegler%2C_48_Lubicz_street%2C_Krak%C3%B3w%2C_Poland.jpg',
  'teatr-gdansk': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Gda%C5%84sk_Opera_Ba%C5%82tycka.JPG/1280px-Gda%C5%84sk_Opera_Ba%C5%82tycka.JPG',
  'teatr-lodz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/%C5%81%C3%B3d%C5%BA_-_Teatr_Wielki.JPG/1280px-%C5%81%C3%B3d%C5%BA_-_Teatr_Wielki.JPG',
  'teatr-poznan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Budynek_Teatru_Wielkiego_w_Poznaniu.jpg/1280px-Budynek_Teatru_Wielkiego_w_Poznaniu.jpg',
  'teatr-wroclaw': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Wroc%C5%82awska_opera-front.jpg/1280px-Wroc%C5%82awska_opera-front.jpg',
  'teatr-bydgoszcz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Bydgoszcz%2C_Opera_Nova.jpg/1280px-Bydgoszcz%2C_Opera_Nova.jpg',
  'teatr-szczecin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Zamek_Ksi%C4%85%C5%BC%C4%85t_Pomorskich%2C_Szczecin_-_panoramio.jpg/1280px-Zamek_Ksi%C4%85%C5%BC%C4%85t_Pomorskich%2C_Szczecin_-_panoramio.jpg',
}

// Updated theater data based on Wikipedia research
const THEATER_DATA = {
  'teatr-warszawa': {
    adres: 'Plac Teatralny 1, 00-077 Warszawa',
    rokZalozenia: 1833,
    liczbaMiejsc: 1841,
    stronaWww: 'https://teatrwielki.pl',
    linkBilety: 'https://teatrwielki.pl/repertuar/',
    opis: [
      { _type: 'block', _key: 'w1', style: 'h2', children: [{ _type: 'span', _key: 'w1s', text: 'Historia' }], markDefs: [] },
      { _type: 'block', _key: 'w2', style: 'normal', children: [{ _type: 'span', _key: 'w2s', text: 'Teatr Wielki — Opera Narodowa to największy gmach operowy w Polsce i jeden z największych w Europie. Wzniesiony w latach 1825–1833 według projektu włoskiego architekta Antonio Corazziego, stanowi monumentalny przykład architektury neoklasycystycznej przy Placu Teatralnym w centrum Warszawy. Inauguracja odbyła się 24 lutego 1833 roku premierą „Cyrulika sewilskiego" Rossiniego.' }], markDefs: [] },
      { _type: 'block', _key: 'w3', style: 'normal', children: [{ _type: 'span', _key: 'w3s', text: 'To właśnie na tej scenie odbyły się prapremiery najsłynniejszych oper Stanisława Moniuszki — pełnej wersji „Halki" (1858) i „Strasznego dworu" (1865). Moniuszko pełnił funkcję dyrektora Opery Warszawskiej od 1858 roku aż do śmierci w 1872 roku.' }], markDefs: [] },
      { _type: 'block', _key: 'w4', style: 'normal', children: [{ _type: 'span', _key: 'w4s', text: 'Podczas oblężenia Warszawy w 1939 roku gmach został zbombardowany i niemal całkowicie zniszczony — ocalała jedynie klasycystyczna fasada. Odbudowa według projektu Bohdana Pniewskiego trwała ponad 20 lat. Teatr ponownie otwarto 19 listopada 1965 roku. Odbudowany budynek, o kubaturze ok. 500 tys. m³, był wówczas największym gmachem teatralnym na świecie.' }], markDefs: [] },
      { _type: 'block', _key: 'w5', style: 'h2', children: [{ _type: 'span', _key: 'w5s', text: 'Budynek i scena' }], markDefs: [] },
      { _type: 'block', _key: 'w6', style: 'normal', children: [{ _type: 'span', _key: 'w6s', text: 'W 2002 roku fasadę zwieńczono rzeźbą Kwadrygi Apollina — zgodnie z pierwotną wizją Corazziego sprzed 180 lat, autorstwa profesorów ASP Adama Myjaka i Antoniego Janusza Pastwy. Sala im. Moniuszki mieści 1841 widzów, a kameralna Sala im. Młynarskiego — 248. Gmach jest siedzibą Opery Narodowej, Polskiego Baletu Narodowego, jednej ze scen Teatru Narodowego oraz Muzeum Teatralnego.' }], markDefs: [] },
    ],
  },
  'teatr-krakow': {
    adres: 'ul. Lubicz 48, 31-512 Kraków',
    rokZalozenia: 1954,
    liczbaMiejsc: 764,
    stronaWww: 'https://opera.krakow.pl',
    linkBilety: 'https://opera.krakow.pl/repertuar',
    opis: [
      { _type: 'block', _key: 'k1', style: 'h2', children: [{ _type: 'span', _key: 'k1s', text: 'Historia' }], markDefs: [] },
      { _type: 'block', _key: 'k2', style: 'normal', children: [{ _type: 'span', _key: 'k2s', text: 'Opera Krakowska to jedna z najważniejszych scen operowych w Polsce, z tradycją sięgającą 1628 roku. Współczesna instytucja powstała w 1954 roku dzięki inicjatywie Towarzystwa Przyjaciół Opery — pierwszym spektaklem było „Rigoletto" Verdiego (13 października 1954). Przez ponad pół wieku Opera nie miała własnej siedziby.' }], markDefs: [] },
      { _type: 'block', _key: 'k3', style: 'normal', children: [{ _type: 'span', _key: 'k3s', text: 'W 2002 roku rozpisano konkurs architektoniczny, który wygrał krakowski architekt Romuald Loegler. Budowę nowego gmachu przy ul. Lubicz 48 rozpoczęto w 2004 roku, a otwarcie nastąpiło jesienią 2008 — to pierwszy gmach operowy zbudowany w Polsce po 1989 roku.' }], markDefs: [] },
      { _type: 'block', _key: 'k4', style: 'h2', children: [{ _type: 'span', _key: 'k4s', text: 'Budynek i działalność' }], markDefs: [] },
      { _type: 'block', _key: 'k5', style: 'normal', children: [{ _type: 'span', _key: 'k5s', text: 'Gmach mieści salę główną na 764 osoby ze sceną o powierzchni 443 m², scenę kameralną na 180 miejsc oraz rozbudowane zaplecze techniczne. Zabytkowa dawna ujeżdżalnia z półokrągłym dachem została wpisana w nową bryłę. Opera słynie z inscenizacji plenerowych — m.in. „Madama Butterfly" w Kopalni Soli w Wieliczce i „Tosca" z Wawelem w tle. Rocznie prezentuje ok. 200 przedstawień przy frekwencji na poziomie 98%.' }], markDefs: [] },
    ],
  },
  'teatr-gdansk': {
    adres: 'al. Zwycięstwa 15, 80-219 Gdańsk',
    rokZalozenia: 1949,
    liczbaMiejsc: 476,
    stronaWww: 'https://operabaltycka.pl',
    linkBilety: 'https://operabaltycka.pl/repertuar',
    opis: [
      { _type: 'block', _key: 'g1', style: 'h2', children: [{ _type: 'span', _key: 'g1s', text: 'Historia' }], markDefs: [] },
      { _type: 'block', _key: 'g2', style: 'normal', children: [{ _type: 'span', _key: 'g2s', text: 'Opera Bałtycka w Gdańsku to największa instytucja kultury województwa pomorskiego. Tradycja operowa Gdańska sięga 1646 roku, kiedy z okazji przyjazdu żony króla Władysława IV wystawiono „Le nozze d\'Amore e di Psiche" Marco Scacchiego dla trzech tysięcy widzów. Współczesna instytucja powstała w 1949 roku jako Studio Muzyczno-Dramatyczne założone przez Iwo Galla.' }], markDefs: [] },
      { _type: 'block', _key: 'g3', style: 'normal', children: [{ _type: 'span', _key: 'g3s', text: 'Obecny budynek przy al. Zwycięstwa 15, w dzielnicy Aniołki, powstał w 1915 roku jako hala widowiskowo-sportowa. Kolejne przebudowy w latach 50. i 70. XX wieku nadały mu obecny kształt. W 1986 roku gdańska produkcja „Nabucco" otrzymała Nagrodę Niemieckich Krytyków jako najlepsze zagraniczne przedstawienie na scenach niemieckich.' }], markDefs: [] },
      { _type: 'block', _key: 'g4', style: 'h2', children: [{ _type: 'span', _key: 'g4s', text: 'Współczesność' }], markDefs: [] },
      { _type: 'block', _key: 'g5', style: 'normal', children: [{ _type: 'span', _key: 'g5s', text: 'W 2010 roku BBC uznało Operę Bałtycką za jeden z dziesięciu najlepszych teatrów operowych w Europie — obok Royal Opera House Covent Garden, Liceu w Barcelonie i La Monnaie w Brukseli. Rocznie Opera prezentuje ok. 120 przedstawień. W lipcu 2025 roku podjęto decyzję o lokalizacji nowej siedziby przy Placu Zebrań Ludowych — otwarcie nowego gmachu planowane jest na 2032 rok.' }], markDefs: [] },
    ],
  },
  'teatr-lodz': {
    adres: 'pl. Dąbrowskiego 1, 90-249 Łódź',
    rokZalozenia: 1967,
    liczbaMiejsc: 1074,
    stronaWww: 'https://operalodz.com',
    linkBilety: 'https://operalodz.com/repertuar',
    opis: [
      { _type: 'block', _key: 'l1', style: 'h2', children: [{ _type: 'span', _key: 'l1s', text: 'Historia' }], markDefs: [] },
      { _type: 'block', _key: 'l2', style: 'normal', children: [{ _type: 'span', _key: 'l2s', text: 'Teatr Wielki w Łodzi to druga pod względem wielkości scena operowa w Polsce i jedna z największych w Europie. Jest kontynuatorem Opery Łódzkiej (1954–1966), powołanej dzięki zaangażowaniu Stowarzyszenia Przyjaciół Opery. Premiera „Strasznego dworu" Moniuszki 18 października 1954 roku zainaugurowała działalność instytucji.' }], markDefs: [] },
      { _type: 'block', _key: 'l3', style: 'normal', children: [{ _type: 'span', _key: 'l3s', text: 'Monumentalny gmach zaprojektowali Józef i Witold Korscy oraz Roman Szymborski. Budowę rozpoczęto w 1949 roku, ale trwała 17 lat z powodu usytuowania na terenie bagiennym. Inauguracja odbyła się 19 stycznia 1967 roku — cztery premiery w cztery kolejne dni: „Halka", „Kniaź Igor", „Straszny dwór" i „Carmen".' }], markDefs: [] },
      { _type: 'block', _key: 'l4', style: 'h2', children: [{ _type: 'span', _key: 'l4s', text: 'Budynek i scena' }], markDefs: [] },
      { _type: 'block', _key: 'l5', style: 'normal', children: [{ _type: 'span', _key: 'l5s', text: 'Fasada z podcieniami, masywne filary i loggia ze smukłymi kolumnami czynią z Teatru sztandarową realizację polskiego socrealizmu. Widownia mieści 1074 osoby. Od 1967 roku Teatr wystawił ponad 300 premier, w tym prapremiery światowe oper Twardowskiego. Na scenie występowali m.in. Andrea Bocelli, Angela Gheorghiu i Plácido Domingo. Teatr organizuje Łódzkie Spotkania Baletowe — międzynarodowy festiwal tańca.' }], markDefs: [] },
    ],
  },
  'teatr-poznan': {
    adres: 'ul. Fredry 9, 61-701 Poznań',
    rokZalozenia: 1910,
    liczbaMiejsc: 936,
    stronaWww: 'https://opera.poznan.pl',
    linkBilety: 'https://opera.poznan.pl/repertuar',
    opis: [
      { _type: 'block', _key: 'p1', style: 'h2', children: [{ _type: 'span', _key: 'p1s', text: 'Historia' }], markDefs: [] },
      { _type: 'block', _key: 'p2', style: 'normal', children: [{ _type: 'span', _key: 'p2s', text: 'Teatr Wielki im. Stanisława Moniuszki to neoklasycystyczny gmach operowy w poznańskiej Dzielnicy Cesarskiej, zaprojektowany przez monachijskiego architekta Maxa Littmanna. Budowę ukończono w 18 miesięcy — otwarcie odbyło się w 1910 roku premierą „Czarodziejskiego fletu" Mozarta, jako Deutsches Stadttheater.' }], markDefs: [] },
      { _type: 'block', _key: 'p3', style: 'normal', children: [{ _type: 'span', _key: 'p3s', text: 'W 1919 roku teatr przeszedł w polskie ręce — inaugurację stanowiła „Halka" Moniuszki pod dyrekcją Adama Dołżyckiego. W okresie międzywojennym na scenie odbyły się prapremiery światowe, m.in. „Legenda Bałtyku" Nowowiejskiego i polska prapremiera baletu „Harnasie" Szymanowskiego. W 1979 roku Opera jako pierwszy teatr muzyczny na świecie otrzymała włoską nagrodę za popularyzację muzyki Verdiego.' }], markDefs: [] },
      { _type: 'block', _key: 'p4', style: 'h2', children: [{ _type: 'span', _key: 'p4s', text: 'Architektura' }], markDefs: [] },
      { _type: 'block', _key: 'p5', style: 'normal', children: [{ _type: 'span', _key: 'p5s', text: 'Fasada z sześcioma jońskimi kolumnami, tympanon zwieńczony rzeźbą Pegaza oraz fontanna przed wejściem tworzą jedno z najpiękniejszych założeń architektonicznych Poznania. Widownia mieści 936 osób. W latach 2021–2023 przeprowadzono renowację sceny i kanału orkiestrowego. Od 2019 roku Opera prezentuje koncertowe wykonania oper Moniuszki w Filharmonii Berlińskiej.' }], markDefs: [] },
    ],
  },
  'teatr-wroclaw': {
    adres: 'ul. Świdnicka 35, 50-066 Wrocław',
    rokZalozenia: 1841,
    liczbaMiejsc: 743,
    stronaWww: 'https://www.opera.wroclaw.pl',
    linkBilety: 'https://www.opera.wroclaw.pl/repertuar',
    opis: [
      { _type: 'block', _key: 'wr1', style: 'h2', children: [{ _type: 'span', _key: 'wr1s', text: 'Historia' }], markDefs: [] },
      { _type: 'block', _key: 'wr2', style: 'normal', children: [{ _type: 'span', _key: 'wr2s', text: 'Gmach Opery Wrocławskiej wzniesiono w latach 1839–1841 według projektu Carla Ferdinanda Langhansa przy ulicy Świdnickiej. Uroczyste otwarcie nastąpiło 13 listopada 1841 roku przedstawieniem „Egmonta" z muzyką Beethovena. Była to wówczas jedna z najnowocześniejszych scen operowych w Europie.' }], markDefs: [] },
      { _type: 'block', _key: 'wr3', style: 'normal', children: [{ _type: 'span', _key: 'wr3s', text: 'Po włączeniu Wrocławia do Polski w 1945 roku, Opera Dolnośląska zainaugurowała działalność 8 września 1945 roku premierą „Halki" Moniuszki. Od 2005 roku instytucja działa pod nazwą Opera Wrocławska. W latach 1997–2006 przeprowadzono generalny remont gmachu. Od 1 stycznia 2025 roku dyrektorem jest Agnieszka Frankow-Żelazny.' }], markDefs: [] },
      { _type: 'block', _key: 'wr4', style: 'h2', children: [{ _type: 'span', _key: 'wr4s', text: 'Budynek' }], markDefs: [] },
      { _type: 'block', _key: 'wr5', style: 'normal', children: [{ _type: 'span', _key: 'wr5s', text: 'Opera Wrocławska zyskała międzynarodowe uznanie dzięki monumentalnym inscenizacjom plenerowym, w tym pełnemu cyklowi „Pierścienia Nibelunga" Wagnera w Hali Stulecia. Sala główna po renowacji mieści 743 widzów. Budynek zachował XIX-wieczne zdobienia — plafon, żyrandol i lożę cesarską.' }], markDefs: [] },
    ],
  },
  'teatr-szczecin': {
    adres: 'ul. Korsarzy 34, 70-540 Szczecin',
    rokZalozenia: 1956,
    liczbaMiejsc: 540,
    stronaWww: 'https://opera.szczecin.pl',
    linkBilety: 'https://rezerwacja.opera.szczecin.pl',
    opis: [
      { _type: 'block', _key: 'sz1', style: 'h2', children: [{ _type: 'span', _key: 'sz1s', text: 'Historia' }], markDefs: [] },
      { _type: 'block', _key: 'sz2', style: 'normal', children: [{ _type: 'span', _key: 'sz2s', text: 'Opera na Zamku w Szczecinie to jedyna instytucja operowa na Pomorzu Zachodnim. Działa od 1956 roku w historycznych wnętrzach Zamku Książąt Pomorskich — renesansowej rezydencji z XIV wieku, odbudowanej po zniszczeniach II wojny światowej. Pierwszym przedstawieniem była „Halka" Moniuszki.' }], markDefs: [] },
      { _type: 'block', _key: 'sz3', style: 'normal', children: [{ _type: 'span', _key: 'sz3s', text: 'Zamek Książąt Pomorskich, siedziba opery, to jeden z najcenniejszych zabytków Szczecina. Wzniesiony w XIV wieku, wielokrotnie przebudowywany w stylu renesansowym i barokowym, został niemal całkowicie zniszczony w 1944 roku. Odbudowa trwała do lat 80. XX wieku.' }], markDefs: [] },
      { _type: 'block', _key: 'sz4', style: 'h2', children: [{ _type: 'span', _key: 'sz4s', text: 'Budynek i działalność' }], markDefs: [] },
      { _type: 'block', _key: 'sz5', style: 'normal', children: [{ _type: 'span', _key: 'sz5s', text: 'Opera dysponuje Salą Operową na 540 miejsc oraz kameralną Salą Rycerską. W repertuarze znajdują się opery, balety, operetki i koncerty symfoniczne. Instytucja współpracuje z teatrami z Niemiec i Skandynawii, co wynika z transgranicznego położenia Szczecina. Od 2022 roku dyrektorem naczelnym jest Jacek Jekiel.' }], markDefs: [] },
    ],
  },
}

// Opera Nova - new theater
const OPERA_NOVA = {
  _id: 'teatr-bydgoszcz',
  _type: 'teatr',
  nazwa: 'Opera Nova',
  slug: { _type: 'slug', current: 'opera-nova-bydgoszcz' },
  miasto: 'Bydgoszcz',
  adres: 'ul. Marszałka Focha 5, 85-070 Bydgoszcz',
  rokZalozenia: 1956,
  liczbaMiejsc: 803,
  stronaWww: 'https://www.opera.bydgoszcz.pl',
  linkBilety: 'https://www.opera.bydgoszcz.pl/repertuar',
  opis: [
    { _type: 'block', _key: 'on1', style: 'h2', children: [{ _type: 'span', _key: 'on1s', text: 'Historia' }], markDefs: [] },
    { _type: 'block', _key: 'on2', style: 'normal', children: [{ _type: 'span', _key: 'on2s', text: 'Opera Nova w Bydgoszczy to największa instytucja artystyczna regionu kujawsko-pomorskiego i jeden z najpiękniej położonych teatrów operowych w Polsce. Tradycja muzyczno-teatralna Bydgoszczy sięga 1623 roku, gdy przedstawienia wystawiali studenci Kolegium Jezuickiego. Współczesna instytucja powstała 21 września 1956 roku jako Studio Operowe.' }], markDefs: [] },
    { _type: 'block', _key: 'on3', style: 'normal', children: [{ _type: 'span', _key: 'on3s', text: 'Budowa gmachu operowego trwała niemal 50 lat. Rozpoczęto ją w 1960 roku według nagrodzonego projektu architekta Józefa Chmiela, który zaproponował budynek-rzeźbę złożoną z czterech okręgów. Prace wielokrotnie przerywano z powodów politycznych i budżetowych. Impuls do dokończenia dał Bydgoski Festiwal Operowy, organizowany od 1994 roku.' }], markDefs: [] },
    { _type: 'block', _key: 'on4', style: 'h2', children: [{ _type: 'span', _key: 'on4s', text: 'Budynek i działalność' }], markDefs: [] },
    { _type: 'block', _key: 'on5', style: 'normal', children: [{ _type: 'span', _key: 'on5s', text: '21 października 2006 roku uroczyście otwarto ukończony gmach nad malowniczym zakrętem Brdy, w sąsiedztwie Wyspy Młyńskiej — stał się rozpoznawalnym symbolem Bydgoszczy. Sala teatralna mieści 803 widzów. W repertuarze znajduje się blisko 40 oper, baletów, operetek i musicali. Od 1989 roku zespół gościł m.in. w Niemczech, Belgii, Holandii, na Malcie i we Włoszech.' }], markDefs: [] },
  ],
}

// Opera na Zamku w Szczecinie - new theater
const OPERA_SZCZECIN = {
  _id: 'teatr-szczecin',
  _type: 'teatr',
  nazwa: 'Opera na Zamku',
  slug: { _type: 'slug', current: 'opera-na-zamku-szczecin' },
  miasto: 'Szczecin',
  adres: 'ul. Korsarzy 34, 70-540 Szczecin',
  rokZalozenia: 1956,
  liczbaMiejsc: 540,
  stronaWww: 'https://opera.szczecin.pl',
  linkBilety: 'https://rezerwacja.opera.szczecin.pl',
  opis: [
    { _type: 'block', _key: 'sz1', style: 'h2', children: [{ _type: 'span', _key: 'sz1s', text: 'Historia' }], markDefs: [] },
    { _type: 'block', _key: 'sz2', style: 'normal', children: [{ _type: 'span', _key: 'sz2s', text: 'Opera na Zamku w Szczecinie to jedyna instytucja operowa na Pomorzu Zachodnim. Działa od 1956 roku w historycznych wnętrzach Zamku Książąt Pomorskich — renesansowej rezydencji z XIV wieku, odbudowanej po zniszczeniach II wojny światowej. Pierwszym przedstawieniem była „Halka" Moniuszki.' }], markDefs: [] },
    { _type: 'block', _key: 'sz3', style: 'normal', children: [{ _type: 'span', _key: 'sz3s', text: 'Zamek Książąt Pomorskich, siedziba opery, to jeden z najcenniejszych zabytków Szczecina. Wzniesiony w XIV wieku, wielokrotnie przebudowywany w stylu renesansowym i barokowym, został niemal całkowicie zniszczony w 1944 roku. Odbudowa trwała do lat 80. XX wieku.' }], markDefs: [] },
    { _type: 'block', _key: 'sz4', style: 'h2', children: [{ _type: 'span', _key: 'sz4s', text: 'Budynek i działalność' }], markDefs: [] },
    { _type: 'block', _key: 'sz5', style: 'normal', children: [{ _type: 'span', _key: 'sz5s', text: 'Opera dysponuje Salą Operową na 540 miejsc oraz kameralną Salą Rycerską. W repertuarze znajdują się opery, balety, operetki i koncerty symfoniczne. Instytucja współpracuje z teatrami z Niemiec i Skandynawii, co wynika z transgranicznego położenia Szczecina. Od 2022 roku dyrektorem naczelnym jest Jacek Jekiel.' }], markDefs: [] },
  ],
}

async function downloadAndUpload(url, filename) {
  console.log(`  Downloading ${filename}...`)
  const response = await fetch(url, {
    headers: { 'User-Agent': 'SwiatBaletuBot/1.0 (https://swiatbaletu.vercel.app; contact: admin@swiatbaletu.pl) educational-project' }
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  console.log(`  Uploading to Sanity (${(buffer.length / 1024).toFixed(0)} KB)...`)
  const asset = await client.assets.upload('image', buffer, { filename })
  return asset._id
}

async function main() {
  console.log('=== Aktualizacja teatrów w Sanity ===\n')

  // 1. Create Opera Nova
  console.log('1. Tworzenie nowych teatrów...')
  for (const theater of [OPERA_NOVA, OPERA_SZCZECIN]) {
    try {
      await client.createIfNotExists(theater)
      // Update data without overwriting zdjecie
      const { _id, _type, ...data } = theater
      await client.patch(_id).set(data).commit()
      console.log(`   ✓ ${theater.nazwa} utworzona/zaktualizowana`)
    } catch (e) {
      console.error(`   ✗ ${theater.nazwa}: ${e.message}`)
    }
  }

  // 2. Update existing theaters
  console.log('\n2. Aktualizacja danych teatrów...')
  for (const [id, data] of Object.entries(THEATER_DATA)) {
    try {
      await client.patch(id).set(data).commit()
      console.log(`   ✓ ${id}`)
    } catch (e) {
      console.error(`   ✗ ${id}: ${e.message}`)
    }
  }

  // 3. Upload real photos (with delay to avoid Wikimedia rate limiting)
  console.log('\n3. Ładowanie prawdziwych zdjęć z Wikimedia Commons...')
  const delay = (ms) => new Promise(r => setTimeout(r, ms))
  for (const [id, imageUrl] of Object.entries(THEATER_PHOTOS)) {
    try {
      await delay(8000) // 8s delay between downloads to avoid Wikimedia 429
      const assetId = await downloadAndUpload(imageUrl, `${id}.jpg`)
      const nazwa = id === 'teatr-bydgoszcz' ? 'Opera Nova' :
        THEATER_DATA[id] ? id : id
      await client.patch(id).set({
        zdjecie: {
          _type: 'image',
          asset: { _type: 'reference', _ref: assetId },
          alt: `Budynek — ${id}`,
        },
      }).commit()
      console.log(`   ✓ ${id}`)
    } catch (e) {
      console.error(`   ✗ ${id}: ${e.message}`)
    }
  }

  console.log('\n=== Gotowe! ===')
}

main().catch(console.error)
