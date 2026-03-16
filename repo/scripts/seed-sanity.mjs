import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'nri4izo1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// ── Teatry ──────────────────────────────
const teatry = [
  {
    _id: 'teatr-warszawa',
    _type: 'teatr',
    nazwa: 'Teatr Wielki — Opera Narodowa',
    slug: { _type: 'slug', current: 'teatr-wielki-warszawa' },
    miasto: 'Warszawa',
    adres: 'Plac Teatralny 1',
    rokZalozenia: 1765,
    dyrektorArtystyczny: 'Waldemar Dąbrowski',
    liczbaMiejsc: 1800,
    stronaWww: 'https://teatrwielki.pl',
  },
  {
    _id: 'teatr-krakow',
    _type: 'teatr',
    nazwa: 'Opera Krakowska',
    slug: { _type: 'slug', current: 'opera-krakowska' },
    miasto: 'Kraków',
    adres: 'ul. Lubicz 48',
    rokZalozenia: 1954,
    dyrektorArtystyczny: 'Bogdan Tosza',
    liczbaMiejsc: 750,
    stronaWww: 'https://opera.krakow.pl',
  },
  {
    _id: 'teatr-wroclaw',
    _type: 'teatr',
    nazwa: 'Opera Wrocławska',
    slug: { _type: 'slug', current: 'opera-wroclawska' },
    miasto: 'Wrocław',
    adres: 'ul. Świdnicka 35',
    rokZalozenia: 1945,
    dyrektorArtystyczny: 'Tomasz Szreder',
    liczbaMiejsc: 680,
    stronaWww: 'https://opera.wroclaw.pl',
  },
  {
    _id: 'teatr-gdansk',
    _type: 'teatr',
    nazwa: 'Opera Bałtycka',
    slug: { _type: 'slug', current: 'opera-baltycka' },
    miasto: 'Gdańsk',
    adres: 'al. Zwycięstwa 15',
    rokZalozenia: 1950,
    dyrektorArtystyczny: 'Romuald Wicza-Pokojski',
    liczbaMiejsc: 714,
    stronaWww: 'https://operabaltycka.pl',
  },
  {
    _id: 'teatr-poznan',
    _type: 'teatr',
    nazwa: 'Teatr Wielki w Poznaniu',
    slug: { _type: 'slug', current: 'teatr-wielki-poznan' },
    miasto: 'Poznań',
    adres: 'ul. Fredry 9',
    rokZalozenia: 1919,
    dyrektorArtystyczny: 'Renata Borowska-Juszczyńska',
    liczbaMiejsc: 936,
    stronaWww: 'https://opera.poznan.pl',
  },
  {
    _id: 'teatr-lodz',
    _type: 'teatr',
    nazwa: 'Teatr Wielki w Łodzi',
    slug: { _type: 'slug', current: 'teatr-wielki-lodz' },
    miasto: 'Łódź',
    adres: 'pl. Dąbrowskiego 1',
    rokZalozenia: 1954,
    dyrektorArtystyczny: 'Romuald Kaczmarek',
    liczbaMiejsc: 1050,
    stronaWww: 'https://operalodz.com',
  },
]

// ── Sylwetki artystów ───────────────────
const sylwetki = [
  {
    _id: 'sylwetka-nureyev',
    _type: 'sylwetka',
    imieNazwisko: 'Rudolf Nureyev',
    slug: { _type: 'slug', current: 'rudolf-nureyev' },
    rola: 'Legenda',
    teatrGlowny: "Ballet de l'Opéra de Paris",
    narodowosc: 'Rosja / Austria',
    dataUrodzenia: '1938-03-17',
    dataSmierci: '1993-01-06',
    aktywny: false,
    polskiArtysta: false,
    wyroznienie: true,
    najwazniejszeRole: ['Książę Zygfryd (Jezioro Łabędzie)', 'Albrecht (Giselle)', 'Romeo (Romeo i Julia)', 'Solor (La Bayadère)'],
  },
  {
    _id: 'sylwetka-copeland',
    _type: 'sylwetka',
    imieNazwisko: 'Misty Copeland',
    slug: { _type: 'slug', current: 'misty-copeland' },
    rola: 'Primabalerina',
    teatrGlowny: 'American Ballet Theatre',
    narodowosc: 'USA',
    dataUrodzenia: '1982-09-10',
    aktywny: true,
    polskiArtysta: false,
    wyroznienie: true,
    najwazniejszeRole: ['Odette/Odile (Jezioro Łabędzie)', 'Juliet (Romeo i Julia)', 'Kitri (Don Kichot)'],
  },
  {
    _id: 'sylwetka-acosta',
    _type: 'sylwetka',
    imieNazwisko: 'Carlos Acosta',
    slug: { _type: 'slug', current: 'carlos-acosta' },
    rola: 'Choreograf',
    teatrGlowny: 'Birmingham Royal Ballet',
    narodowosc: 'Kuba',
    dataUrodzenia: '1973-06-02',
    aktywny: true,
    polskiArtysta: false,
    wyroznienie: true,
    najwazniejszeRole: ['Spartakus', 'Romeo', 'Don Kichot', 'Basilio'],
  },
  {
    _id: 'sylwetka-cojocaru',
    _type: 'sylwetka',
    imieNazwisko: 'Alina Cojocaru',
    slug: { _type: 'slug', current: 'alina-cojocaru' },
    rola: 'Primabalerina',
    teatrGlowny: 'English National Ballet',
    narodowosc: 'Rumunia',
    dataUrodzenia: '1981-05-27',
    aktywny: true,
    polskiArtysta: false,
    wyroznienie: true,
    najwazniejszeRole: ['Giselle', 'Aurora (Śpiąca Królewna)', 'Juliet', 'Manon'],
  },
  {
    _id: 'sylwetka-guillem',
    _type: 'sylwetka',
    imieNazwisko: 'Sylvie Guillem',
    slug: { _type: 'slug', current: 'sylvie-guillem' },
    rola: 'Legenda',
    teatrGlowny: 'Royal Ballet London',
    narodowosc: 'Francja',
    dataUrodzenia: '1965-02-25',
    aktywny: false,
    polskiArtysta: false,
    wyroznienie: true,
    najwazniejszeRole: ['Giselle', 'Bolero', 'In the Middle', 'Marguerite and Armand'],
  },
  {
    _id: 'sylwetka-nunez',
    _type: 'sylwetka',
    imieNazwisko: 'Marianela Nuñez',
    slug: { _type: 'slug', current: 'marianela-nunez' },
    rola: 'Primabalerina',
    teatrGlowny: 'Royal Opera House',
    narodowosc: 'Argentyna',
    dataUrodzenia: '1982-01-28',
    aktywny: true,
    polskiArtysta: false,
    wyroznienie: true,
    najwazniejszeRole: ['Aurora (Śpiąca Królewna)', 'Odette/Odile', 'Giselle', 'Nikiya (La Bayadère)'],
  },
  {
    _id: 'sylwetka-kowalska',
    _type: 'sylwetka',
    imieNazwisko: 'Alina Kowalska',
    slug: { _type: 'slug', current: 'alina-kowalska' },
    rola: 'Primabalerina',
    teatrGlowny: 'Teatr Wielki Warszawa',
    narodowosc: 'Polska',
    dataUrodzenia: '1990-04-15',
    aktywny: true,
    polskiArtysta: true,
    wyroznienie: true,
    najwazniejszeRole: ['Odette/Odile (Jezioro Łabędzie)', 'Giselle', 'Kitri (Don Kichot)', 'Aurora (Śpiąca Królewna)'],
  },
]

// ── Wywiady ─────────────────────────────
const wywiady = [
  {
    _id: 'wywiad-kowalska',
    _type: 'wywiad',
    tytul: '„Balet to nie ruch — to myśl wyrażona ciałem"',
    slug: { _type: 'slug', current: 'balet-to-nie-ruch' },
    rozmowca: { _type: 'reference', _ref: 'sylwetka-kowalska' },
    funkcjaRozmowcy: 'Pierwsza solistka, Teatr Wielki Warszawa',
    zajawka: 'Rozmawiamy z jedną z najważniejszych polskich balerin o kulisach nowego sezonu, kontuzjach, które zmieniają perspektywę, i o tym, dlaczego rola Odette jest wciąż najtrudniejsza. Po 18 latach na scenie Teatru Wielkiego ma coraz więcej do powiedzenia — i coraz mniej czasu na milczenie.',
    tresc: [
      { _type: 'block', _key: 'w1', style: 'normal', children: [{ _type: 'span', _key: 'w1s', text: 'Spotykamy się w garderobie Teatru Wielkiego, tuż po porannym treningu. Alina Kowalska, pierwsza solistka baletu, wygląda na zmęczoną — ale jej oczy błyszczą, kiedy zaczyna mówić o nadchodzącym sezonie.' }] },
      { _type: 'block', _key: 'w2', style: 'h3', children: [{ _type: 'span', _key: 'w2s', text: 'O roli Odette' }] },
      { _type: 'block', _key: 'w3', style: 'normal', children: [{ _type: 'span', _key: 'w3s', text: '„Odette to nie jest rola, którą się tańczy. To rola, w którą się wchodzi i z której trudno wyjść. Po każdym przedstawieniu potrzebuję godziny, żeby wrócić do siebie. Czasem dłużej."' }] },
      { _type: 'block', _key: 'w4', style: 'h3', children: [{ _type: 'span', _key: 'w4s', text: 'O kontuzjach' }] },
      { _type: 'block', _key: 'w5', style: 'normal', children: [{ _type: 'span', _key: 'w5s', text: '„Kontuzja kolana w 2023 roku zmieniła moją perspektywę. Nauczyłam się, że ciało ma swoje granice i trzeba je szanować. Ale paradoksalnie — po powrocie tańczę lepiej, bo tańczę mądrzej."' }] },
      { _type: 'block', _key: 'w6', style: 'h3', children: [{ _type: 'span', _key: 'w6s', text: 'O nowym sezonie' }] },
      { _type: 'block', _key: 'w7', style: 'normal', children: [{ _type: 'span', _key: 'w7s', text: '„Sezon 2025/26 to dla mnie powrót do korzeni. Jezioro Łabędzie, Giselle — klasyka, która nigdy się nie starzeje. Ale mamy też kilka niespodzianek, o których jeszcze nie mogę mówić."' }] },
    ],
    dataPublikacji: '2026-03-14T10:00:00Z',
    wywiadTygodnia: true,
  },
  {
    _id: 'wywiad-semionova',
    _type: 'wywiad',
    tytul: 'Polina Semionova: „Polska publiczność jest wyjątkowa"',
    slug: { _type: 'slug', current: 'semionova-polska-publicznosc' },
    funkcjaRozmowcy: 'Primabalerina, Staatsballett Berlin',
    zajawka: 'Polina Semionova, jedna z największych balerin współczesności, przed wizytą w Polsce opowiada o magii polskiej publiczności, pracy z młodymi tancerzami i planach na przyszłość.',
    tresc: [
      { _type: 'block', _key: 'ps1', style: 'normal', children: [{ _type: 'span', _key: 'ps1s', text: '„Zawsze czuję się wyjątkowo, kiedy tańczę w Polsce. Publiczność jest tu wymagająca, ale daje ogromną energię. Czuję każde westchnienie na widowni."' }] },
      { _type: 'block', _key: 'ps2', style: 'normal', children: [{ _type: 'span', _key: 'ps2s', text: '„Przyjadę z trzema różnymi programami — w Gdańsku Giselle, we Wrocławiu Don Kichot, a w Warszawie wieczór galowy. Każde miasto, każda sala ma swój charakter."' }] },
    ],
    dataPublikacji: '2026-03-10T09:00:00Z',
    wywiadTygodnia: false,
  },
  {
    _id: 'wywiad-nowak-spartakus',
    _type: 'wywiad',
    tytul: 'Jan Nowak: „Spartakus to spektakl o wolności, nie o wojnie"',
    slug: { _type: 'slug', current: 'nowak-spartakus-wolnosc' },
    funkcjaRozmowcy: 'Choreograf, Opera Krakowska',
    zajawka: 'Choreograf Jan Nowak o nowej inscenizacji Spartakusa w Operze Krakowskiej — dlaczego po 12 latach wraca ten spektakl i co zmieni nowa wizja.',
    tresc: [
      { _type: 'block', _key: 'jn1', style: 'normal', children: [{ _type: 'span', _key: 'jn1s', text: '„Spartakus to dla mnie opowieść o wolności artystycznej. Kiedy dostałem propozycję nowej choreografii, wiedziałem, że nie chcę kopiować Grigorowicza. Chcę opowiedzieć tę historię na nowo."' }] },
    ],
    dataPublikacji: '2026-03-05T11:00:00Z',
    wywiadTygodnia: false,
  },
]

// ── Artykuły ────────────────────────────
const artykuly = [
  {
    _id: 'art-pointy',
    _type: 'artykul',
    tytul: 'Pointy — 200 lat bólu i piękna',
    slug: { _type: 'slug', current: 'pointy-200-lat' },
    kategoria: 'Technika',
    zajawka: 'Od Marie Taglioni po współczesne innowacje — jak buty pointowe zmieniły balet i jaką cenę za to płacą tancerki.',
    trescGlowna: [
      { _type: 'block', _key: 'p1', style: 'normal', children: [{ _type: 'span', _key: 'p1s', text: 'Kiedy Marie Taglioni w 1832 roku stanęła na palcach w „La Sylphide", zrewolucjonizowała balet. Ale to, co publiczność widziała jako eteryczne unoszenie się nad sceną, za kulisami oznaczało krwawiące palce i pęknięte paznokcie.' }] },
      { _type: 'block', _key: 'p2', style: 'h3', children: [{ _type: 'span', _key: 'p2s', text: 'Anatomia buta pointowego' }] },
      { _type: 'block', _key: 'p3', style: 'normal', children: [{ _type: 'span', _key: 'p3s', text: 'Współczesny but pointowy to arcydzieło rzemiosła — warstwy satyny, płótna, kartonu i kleju, formowane ręcznie. Każda tancerka zużywa średnio 100-120 par rocznie, a primabaleriny nawet jedną parę na spektakl.' }] },
      { _type: 'block', _key: 'p4', style: 'h3', children: [{ _type: 'span', _key: 'p4s', text: 'Nowoczesne materiały' }] },
      { _type: 'block', _key: 'p5', style: 'normal', children: [{ _type: 'span', _key: 'p5s', text: 'Firmy takie jak Gaynor Minden wprowadziły buty z polimerów, które są trwalsze i bardziej elastyczne. Ale wielu tradycjonalistów uważa, że tracą one „duszę" klasycznego pointa.' }] },
    ],
    autor: 'Marta Wiśniewska',
    dataPublikacji: '2026-03-12T08:00:00Z',
    featured: true,
    czasCzytania: 8,
    tagi: ['technika', 'pointy', 'historia baletu'],
  },
  {
    _id: 'art-don-kichot',
    _type: 'artykul',
    tytul: 'Don Kichot w Poznaniu — brawura i luz',
    slug: { _type: 'slug', current: 'don-kichot-poznan-recenzja' },
    kategoria: 'Recenzja',
    zajawka: 'Poznański Don Kichot zaskakuje świeżością i energią. Nowa obsada wnosi do klasyki element nieprzewidywalności.',
    trescGlowna: [
      { _type: 'block', _key: 'dk1', style: 'normal', children: [{ _type: 'span', _key: 'dk1s', text: 'Don Kichot Ludwiga Minkusa w choreografii Mariusa Petipy to jeden z najbardziej radosnych baletów w repertuarze klasycznym. Poznańska wersja, którą zobaczyliśmy w minioną sobotę, potwierdza, że ta radość jest zaraźliwa.' }] },
      { _type: 'block', _key: 'dk2', style: 'normal', children: [{ _type: 'span', _key: 'dk2s', text: 'Szczególnie wyróżniła się Kitri w wykonaniu młodej solistki Anny Nowickiej — jej technika jest brawurowa, ale to charyzma sceniczna sprawia, że nie można oderwać od niej oczu.' }] },
    ],
    autor: 'Paweł Krawczyk',
    dataPublikacji: '2026-03-10T14:00:00Z',
    featured: true,
    czasCzytania: 5,
    tagi: ['recenzja', 'don kichot', 'poznań'],
  },
  {
    _id: 'art-diaghilew',
    _type: 'artykul',
    tytul: 'Diaghilew i rewolucja Ballets Russes',
    slug: { _type: 'slug', current: 'diaghilew-ballets-russes' },
    kategoria: 'Historia',
    zajawka: 'Jak rosyjski impresario na początku XX wieku zmienił oblicze baletu na zawsze — od Stravińskiego po Picassa.',
    trescGlowna: [
      { _type: 'block', _key: 'dr1', style: 'normal', children: [{ _type: 'span', _key: 'dr1s', text: 'Siergiej Diaghilew nie był tancerzem ani choreografem. Był wizjonerem, który w 1909 roku założył w Paryżu zespół Ballets Russes i zmienił wszystko — od muzyki, przez choreografię, po scenografię.' }] },
      { _type: 'block', _key: 'dr2', style: 'normal', children: [{ _type: 'span', _key: 'dr2s', text: 'Współpracował z najwybitniejszymi artystami swoich czasów: Strawiński pisał muzykę, Picasso projektował dekoracje, a Niżyński i Balanchine tworzyli choreografie, które do dziś są wystawiane na najważniejszych scenach świata.' }] },
    ],
    autor: 'dr Katarzyna Lewandowska',
    dataPublikacji: '2026-03-08T10:00:00Z',
    featured: true,
    czasCzytania: 12,
    tagi: ['historia', 'diaghilew', 'ballets russes'],
  },
]

// ── Ticker ──────────────────────────────
const tickery = [
  {
    _id: 'ticker-1',
    _type: 'ticker',
    tresc: 'Dziś wieczór: Łabędzie Jezioro — Teatr Wielki Warszawa · 98% zajętości',
    aktywny: true,
    kolejnosc: 1,
    typ: 'info',
  },
  {
    _id: 'ticker-2',
    _type: 'ticker',
    tresc: 'Premiera „Spartakus" — Opera Krakowska · 20 marca 2026',
    aktywny: true,
    kolejnosc: 2,
    typ: 'premiera',
  },
  {
    _id: 'ticker-3',
    _type: 'ticker',
    tresc: 'Polina Semionova gościnnie w Gdańsku · tylko 2 wieczory',
    aktywny: true,
    kolejnosc: 3,
    typ: 'info',
  },
  {
    _id: 'ticker-4',
    _type: 'ticker',
    tresc: 'Transmisja na żywo: Bolszoj — La Bayadère · 18 marca · 19:00',
    aktywny: true,
    kolejnosc: 4,
    typ: 'transmisja',
  },
  {
    _id: 'ticker-5',
    _type: 'ticker',
    tresc: 'Zniżka 40% dla studentów — Opera Wrocławska · kod: STUDENT26',
    aktywny: true,
    kolejnosc: 5,
    typ: 'promocja',
  },
]

// ── Promocje ────────────────────────────
const promocje = [
  {
    _id: 'promo-student',
    _type: 'promocja',
    tytul: 'Zniżka 40% dla studentów — Opera Wrocławska',
    etykieta: 'Tylko do niedzieli',
    opis: 'Giselle · 21–23 marca 2026',
    kod: 'STUDENT26',
    aktywna: true,
    naStrGlownej: true,
    dataOd: '2026-03-10T00:00:00Z',
    dataDo: '2026-03-23T23:59:00Z',
    teatr: { _type: 'reference', _ref: 'teatr-wroclaw' },
  },
  {
    _id: 'promo-rodzina',
    _type: 'promocja',
    tytul: 'Śpiąca Królewna dla rodzin — Teatr Wielki Warszawa',
    etykieta: 'Pakiet rodzinny 2+2',
    opis: '4–6 kwietnia · od 180 zł za 4 bilety',
    kod: 'RODZINA26',
    aktywna: true,
    naStrGlownej: true,
    dataOd: '2026-03-15T00:00:00Z',
    dataDo: '2026-04-06T23:59:00Z',
    teatr: { _type: 'reference', _ref: 'teatr-warszawa' },
  },
  {
    _id: 'promo-bolszoj',
    _type: 'promocja',
    tytul: 'La Bayadère z Bolszoj — za darmo online',
    etykieta: 'Transmisja bezpłatna',
    opis: '18 marca · godz. 19:00 · HD · wymagana rejestracja',
    aktywna: true,
    naStrGlownej: true,
    dataOd: '2026-03-10T00:00:00Z',
    dataDo: '2026-03-18T23:59:00Z',
  },
]

// ── Seed all ────────────────────────────
async function seed() {
  const allDocs = [...teatry, ...sylwetki, ...wywiady, ...artykuly, ...tickery, ...promocje]

  console.log(`Seeding ${allDocs.length} documents to Sanity...`)

  const tx = client.transaction()
  for (const doc of allDocs) {
    tx.createOrReplace(doc)
  }

  const result = await tx.commit()
  console.log(`Done! Transaction ID: ${result.transactionId}`)
  console.log(`  - ${teatry.length} teatrów`)
  console.log(`  - ${sylwetki.length} sylwetek`)
  console.log(`  - ${wywiady.length} wywiadów`)
  console.log(`  - ${artykuly.length} artykułów`)
  console.log(`  - ${tickery.length} tickerów`)
  console.log(`  - ${promocje.length} promocji`)
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
