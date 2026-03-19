import { createClient } from 'next-sanity'
import { config } from 'dotenv'
config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Helper: upload image from URL to Sanity
async function uploadImage(url, filename) {
  try {
    const resp = await fetch(url, { headers: { 'User-Agent': 'SwiatBaletu/1.0' } })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const buf = Buffer.from(await resp.arrayBuffer())
    console.log(`    📷 ${filename} (${(buf.length / 1024).toFixed(0)} KB)`)
    const asset = await client.assets.upload('image', buf, { filename })
    return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  } catch (err) {
    console.error(`    ✗ Błąd uploadu ${filename}: ${err.message}`)
    return null
  }
}

// Helper: convert text to Portable Text blocks
function textToBlocks(text) {
  const blocks = []
  const paragraphs = text.split('\n\n').filter(p => p.trim())

  for (const para of paragraphs) {
    const trimmed = para.trim()

    // Headers
    if (trimmed.startsWith('#### ')) {
      blocks.push({
        _type: 'block', _key: rk(),
        style: 'h3',
        children: [{ _type: 'span', _key: rk(), text: trimmed.replace('#### ', ''), marks: [] }],
        markDefs: [],
      })
    } else if (trimmed.startsWith('### ')) {
      blocks.push({
        _type: 'block', _key: rk(),
        style: 'h2',
        children: [{ _type: 'span', _key: rk(), text: trimmed.replace('### ', ''), marks: [] }],
        markDefs: [],
      })
    } else {
      // Regular paragraph — handle **bold** markers
      const children = []
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/)
      for (const part of parts) {
        if (part.startsWith('**') && part.endsWith('**')) {
          children.push({ _type: 'span', _key: rk(), text: part.slice(2, -2), marks: ['strong'] })
        } else if (part) {
          children.push({ _type: 'span', _key: rk(), text: part, marks: [] })
        }
      }
      if (children.length > 0) {
        blocks.push({
          _type: 'block', _key: rk(),
          style: 'normal',
          children,
          markDefs: [],
        })
      }
    }
  }
  return blocks
}

// Random key generator for Portable Text
let keyCounter = 0
function rk() { return `k${Date.now().toString(36)}${(keyCounter++).toString(36)}` }

// Insert an image block between text blocks (after ~3rd paragraph)
function insertImageBlock(blocks, imageAsset, caption) {
  if (!imageAsset) return blocks
  const insertIdx = Math.min(3, Math.floor(blocks.length / 2))
  const imgBlock = {
    _type: 'image', _key: rk(),
    asset: imageAsset.asset,
    alt: caption,
  }
  blocks.splice(insertIdx, 0, imgBlock)
  return blocks
}

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════

const sylwetki = [
  {
    id: 'sylwetka-pavlova',
    imieNazwisko: 'Anna Pawłowa',
    slug: 'anna-pavlova',
    rola: 'Primabalerina',
    teatrGlowny: 'Balet Cesarski / Własna kompania',
    narodowosc: 'Rosja',
    dataUrodzenia: '1881-02-12',
    dataSmierci: '1931-01-23',
    aktywny: false,
    polskiArtysta: false,
    wyroznienie: true,
    najwazniejszeRole: ['Umierający łabędź', 'Giselle', 'Nikija (Bajadera)', 'Aurora (Śpiąca królewna)', 'Sylfidy'],
    zdjecie: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Anna_Pavlova%2C_portrait_and_signature.jpg',
    zdjecieInline: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Anna_Pavlova_as_the_Dying_Swan.jpg',
    zdjecieInlineCaption: 'Anna Pawłowa jako Umierający łabędź — jej najsłynniejsza rola',
    bio: `### Anna Pawłowa (1881–1931) — Nieśmiertelny Łabędź

#### Dzieciństwo i powołanie

Anna Pawłowna Pawłowa przyszła na świat 12 lutego 1881 roku w Petersburgu, jako wcześniak — urodziła się dwa miesiące przed terminem. Jej matka, Lubow Fiodorowna, pracowała jako praczka i samotnie wychowywała córkę. Dzieciństwo upływało w skromnych warunkach, daleko od blasku cesarskich teatrów.

Punkt zwrotny nadszedł, gdy ośmioletnia Anna po raz pierwszy przekroczyła próg Teatru Maryjskiego. Matka zabrała ją na przedstawienie Śpiącej królewny Czajkowskiego. Widok bajkowej scenerii i tancerek unoszących się nad sceną wywołał w dziewczynce wstrząs, który zadecydował o całym jej życiu. Trzy lata później została przyjęta do Cesarskiej Szkoły Baletowej.

#### Nauka i pierwsze wyzwania

Dziesięcioletnia Anna nie pasowała do ówczesnego ideału baletowego — miała zbyt szczupłą sylwetkę, niezwykle wysklepione stopy i cienkie kostki. Pedagodzy szybko jednak dostrzegli w niej coś wyjątkowego: nadzwyczajną muzykalność, eteryczną lekkość i naturalną ekspresję. W 1899 roku ukończyła szkołę z wyróżnieniem i od razu otrzymała rangę koryfeuszki.

#### Droga na szczyt

W 1902 roku zadebiutowała jako Nikija w Bajaderce — rola wymagająca zarówno wirtuozerii technicznej, jak i głębokiego aktorstwa. Przełom nastąpił w 1905 roku, gdy choreograf Michaił Fokin stworzył specjalnie dla niej miniaturę Umierający łabędź do muzyki Saint-Saënsa. Ten zaledwie czterominutowy solo stał się jej artystycznym manifestem. W ciągu kariery wykonała go około czterech tysięcy razy. W 1906 roku otrzymała tytuł primabaleriny Baletu Cesarskiego.

#### Własna droga — światowe tournée

W 1909 roku wzięła udział w paryskich sezonach Ballets Russes Diagilewa, ale jej niezależny charakter nie pozwolił na dłuższą współpracę z despotycznym impresariem. W 1911 roku założyła własny zespół baletowy — krok niemal bez precedensu. Między 1910 a 1925 rokiem przemierzyli ponad 480 tysięcy kilometrów, dając blisko cztery tysiące przedstawień na pięciu kontynentach.

W 1912 roku nabyła posiadłość Ivy House w Londynie, gdzie w ogrodzie urządziła staw z łabędziami. Pawłowa zawoziła balet tam, gdzie wcześniej nikt go nie widział: do Indii, Meksyku, Egiptu, Japonii i Australii. W Indiach spotkała młodego Udaya Shankara i zachęciła go do rozwoju klasycznego tańca indyjskiego.

#### Ostatni akt

W styczniu 1931 roku, podczas tournée po Holandii, Pawłowa przeziębiła się w nieogrzewanym pociągu. Zmarła 23 stycznia w hotelu Des Indes w Hadze. Jej ostatnie słowa brzmiały: „Przygotujcie mój kostium Łabędzia." Tego wieczoru na pustej scenie krążył samotny reflektor. Nawet deser pavlova nosi jej imię — lekki i piękny, jak taniec kobiety, która go zainspirowała.`,
  },
  {
    id: 'sylwetka-nijinsky',
    imieNazwisko: 'Wacław Niżyński',
    slug: 'vaslav-nijinsky',
    rola: 'Tancerz/ka',
    teatrGlowny: 'Ballets Russes / Teatr Maryjski',
    narodowosc: 'Rosja (polskiego pochodzenia)',
    dataUrodzenia: '1889-03-12',
    dataSmierci: '1950-04-08',
    aktywny: false,
    polskiArtysta: false,
    wyroznienie: true,
    najwazniejszeRole: ['Pietruszka', 'Widmo Róży', 'Faun (Popołudnie fauna)', 'Złoty Niewolnik (Szeherezada)'],
    zdjecie: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Talisman_-Vayou_-Vaslav_Nijinsky_-1909.JPG',
    zdjecieInline: 'https://upload.wikimedia.org/wikipedia/commons/0/05/The_Art_of_Nijinsky_-_P%C3%A9trouchka.jpg',
    zdjecieInlineCaption: 'Niżyński jako Pietruszka — jedna z jego najsłynniejszych kreacji',
    bio: `### Wacław Niżyński (1889–1950) — Boski szaleniec baletu

#### Dzieciństwo za kulisami

Wacław Fomicz Niżyński przyszedł na świat 12 marca 1889 roku w Kijowie, w rodzinie wędrownych tancerzy polskiego pochodzenia. Jego ojciec Tomasz i matka Eleonora byli solistami baletu. Mały Wacław dosłownie wychował się za kulisami — zanim nauczył się czytać, potrafił już naśladować ruchy tancerzy. W wieku dziesięciu lat został przyjęty do Cesarskiej Szkoły Teatralnej w Petersburgu.

#### Gwiazda Ballets Russes

W 1907 roku został solistą Teatru Maryjskiego. Dwa lata później Diagilew uczynił go gwiazdą Ballets Russes. Jego skok w finale Pawilonu Armidy wydawał się przeczyć prawom fizyki. Jako Pietruszka w balecie Strawińskiego jego ciało zdawało się pozbawione kości. Jako Widmo Róży wykonywał na końcu skok przez okno, który widzowie wspominali po latach jako moment czystej magii.

#### Rewolucjonista choreografii

W 1912 roku przedstawił Popołudnie fauna — zamiast płynnych ruchów zastosował płaskość i kanciastość inspirowaną fryzami greckimi. Ostatnia scena wywołała skandal. Rok później, 29 maja 1913 roku, premiera Święta wiosny wywołała zamieszki na widowni. Publiczność gwizdała i rzucała przedmiotami. Balet zdjęto po ośmiu przedstawieniach. Dziś jest uznawany za przełomowe dzieło XX wieku.

#### Tragiczny koniec

W 1913 roku poślubił Romolę de Pulszky, a Diagilew natychmiast go zwolnił. Ostatni publiczny występ miał miejsce 30 września 1917 roku w Montevideo — miał dwadzieścia osiem lat. Wkrótce zdiagnozowano u niego schizofrenię. Przez następne trzydzieści jeden lat przebywał w szpitalach psychiatrycznych. Zmarł 8 kwietnia 1950 roku w Londynie. Na jego grobie na Montmartre umieszczono figurkę Pietruszki.

Pozostawił zaledwie cztery choreografie i niecałe dziesięć lat kariery. A mimo to zmienił balet na zawsze.`,
  },
  {
    id: 'sylwetka-nureyev',
    imieNazwisko: 'Rudolf Nurejew',
    slug: 'rudolf-nureyev',
    rola: 'Tancerz/ka',
    teatrGlowny: 'Royal Ballet / Opera Paryska',
    narodowosc: 'ZSRR / Austria',
    dataUrodzenia: '1938-03-17',
    dataSmierci: '1993-01-06',
    aktywny: false,
    polskiArtysta: false,
    wyroznienie: true,
    najwazniejszeRole: ['Albrecht (Giselle)', 'Książę Zygfryd (Jezioro Łabędzie)', 'Armand (Marguerite and Armand)', 'Romeo'],
    zdjecie: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Rudolf_Nurejev_%281968%29.jpg',
    zdjecieInline: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Aankomst_Margot_Fonteyn_en_Rudolf_Nurejev_op_Schiphol_Margot_Fonteyn_en_Rudolf_N%2C_Bestanddeelnr_921-5008.jpg',
    zdjecieInlineCaption: 'Rudolf Nurejew i Margot Fonteyn — najsłynniejszy duet w historii baletu',
    bio: `### Rudolf Nurejew (1938–1993) — Skok ku wolności

#### Dzieciństwo na Syberii

Rudolf Chametowicz Nurejew urodził się 17 marca 1938 roku w pociągu transsyberyjskim, gdzieś między Irkuckiem a Bajkałem. Był czwartym dzieckiem tatarskiej rodziny z Ufy. Rodzina żyła w skrajnej nędzy — pięcioro ludzi w jednym pokoju. Taniec stał się dla małego Rudolfa pierwszą ucieczką od rzeczywistości. Gdy miał siedem lat, matka przemyciła go na balet — kupiwszy jeden bilet na czworo dzieci. Wiedział już wtedy, że scena jest jedynym miejscem, gdzie chce być.

#### Leningrad — późna, ale genialna nauka

Dopiero w wieku siedemnastu lat dostał się do Leningradzkiej Szkoły Baletowej. Trafił pod opiekę Aleksandra Puszkina, który wydobył z niego to, co najlepsze. Po ukończeniu szkoły w 1958 roku natychmiast został solistą Baletu Kirowa.

#### Ucieczka na Zachód

16 czerwca 1961 roku na lotnisku Le Bourget rozegrał się dramat. Nurejew miał wracać do Moskwy — wiedział, że to koniec kariery. Otoczony przez agentów KGB, rzucił się w stronę francuskich policjantów krzycząc: „Chrońcie mnie!" Był to pierwszy przypadek ucieczki radzieckiego artysty. W kieszeni miał równowartość dziesięciu dolarów.

#### Fonteyn i Nurejew

21 lutego 1962 roku po raz pierwszy wystąpił z Margot Fonteyn w Giselle. Ona miała czterdzieści dwa lata, on dwadzieścia trzy. Na scenie tworzyli magię. Ashton stworzył dla nich balet Marguerite and Armand, tak osobisty, że przez lata nikt inny nie odważył się go tańczyć.

#### Dyrektor Opery Paryskiej

W 1983 roku został dyrektorem artystycznym Baletu Opery Paryskiej. Odkrył i wypromował Sylvie Guillem, Manuela Legrisa i Elisabeth Platel. Jego ostatnim dziełem była La Bayadère z 1992 roku — zbyt słaby by wstać, przyjął oklaski z fotela.

Rudolf Nurejew zmarł 6 stycznia 1993 roku. Jego grób zdobi mozaikowa replika orientalnego kilimu — ostatni ukłon artysty, który tęsknił za Wschodem, żyjąc na Zachodzie.`,
  },
  {
    id: 'sylwetka-fonteyn',
    imieNazwisko: 'Margot Fonteyn',
    slug: 'margot-fonteyn',
    rola: 'Primabalerina',
    teatrGlowny: 'Royal Ballet',
    narodowosc: 'Wielka Brytania',
    dataUrodzenia: '1919-05-18',
    dataSmierci: '1991-02-21',
    aktywny: false,
    polskiArtysta: false,
    wyroznienie: true,
    najwazniejszeRole: ['Aurora (Śpiąca królewna)', 'Giselle', 'Odetta/Odylia', 'Ondine', 'Marguerite (Marguerite and Armand)'],
    zdjecie: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Margot_Fonteyn_%281968%29.jpg',
    bio: `### Margot Fonteyn (1919–1991) — Królowa brytyjskiego baletu

Margot Fonteyn — kobieta, która przez cztery dekady uosabiała elegancję i artystyczną doskonałość na scenie Royal Ballet. Urodzona 18 maja 1919 roku w Reigate jako Margaret Evelyn Hookham, zaczęła lekcje tańca w wieku czterech lat. Gdy ojciec został przeniesiony do Chin, pobierała nauki w Szanghaju u rosyjskiego emigranta Georgija Gonczarowa.

#### Meteroryczny awans

Po powrocie do Londynu w 1933 roku, czternastoletnia Margaret została przyjęta do Vic-Wells Ballet School przez Ninette de Valois. Już w 1935 roku, mając szesnaście lat, zastąpiła słynną Alicję Markową na pozycji primabaleriny. Przez kolejne dekady budowała repertuar pod okiem choreografa Fredericka Ashtona, który tworzył balety specjalnie dla jej talentu — Ondine, Symphonic Variations, Daphnis i Chloe.

#### Partnerstwo z Nurejewem

Przełomem była współpraca z Rudolfem Nurejewem od 1962 roku. Ich pierwszy wspólny Giselle stał się legendą — publiczność szalała z zachwytu. Różniło ich niemal wszystko — ona uosabiała brytyjską elegancję, on był ognisty i impulsywny. A jednak na scenie tworzyli magię. Fonteyn tańczyła do sześćdziesiątego roku życia, częściowo z powodu kosztów opieki medycznej męża, panamskiego dyplomaty sparalizowanego po zamachu w 1965 roku.

Otrzymała tytuł Damy Komandor Orderu Imperium Brytyjskiego i honorowy tytuł prima ballerina assoluta. Zmarła 21 lutego 1991 roku w Panamie — dokładnie w rocznicę swojego pierwszego występu z Nurejewem.`,
  },
  {
    id: 'sylwetka-balanchine',
    imieNazwisko: 'George Balanchine',
    slug: 'george-balanchine',
    rola: 'Choreograf',
    teatrGlowny: 'New York City Ballet',
    narodowosc: 'Gruzja / USA',
    dataUrodzenia: '1904-01-22',
    dataSmierci: '1983-04-30',
    aktywny: false,
    polskiArtysta: false,
    wyroznienie: true,
    najwazniejszeRole: ['Serenade', 'Apollo', 'Agon', 'Jewels', 'Dziadek do Orzechów', 'Syn Marnotrawny'],
    zdjecie: 'https://upload.wikimedia.org/wikipedia/commons/0/00/G._Balanchine_%28young%29.jpg',
    bio: `### George Balanchine (1904–1983) — Ojciec baletu neoklasycznego

Giorgi Balanchiwadze urodził się 22 stycznia 1904 roku w Sankt Petersburgu, jako syn gruzińskiego kompozytora. W wieku dziewięciu lat został przyjęty do Cesarskiej Szkoły Baletowej. Równocześnie studiował fortepian i kompozycję w Konserwatorium — ta podwójna formacja stała się fundamentem jego rewolucyjnego podejścia do choreografii.

#### Od Ballets Russes do Ameryki

W 1924 roku wyjechał z ZSRR i już nigdy nie wrócił. Diagilew zaangażował go do Ballets Russes i uprościł jego nazwisko. Apollo z 1928 roku uważany jest za narodziny neoklasycyzmu w balecie. W 1933 roku na zaproszenie Lincolna Kirsteina wyjechał do USA, gdzie rok później współzałożył School of American Ballet.

#### New York City Ballet

W 1948 roku powstał New York City Ballet, który Balanchine prowadził przez ponad trzydzieści pięć lat, tworząc ponad 465 choreografii. Serenade, Agon, Jewels, Dziadek do Orzechów — każde z tych dzieł na nowo definiowało granice baletu. Jego filozofia była rewolucyjna: balet to sztuka ruchu, nie opowiadania historii.

Szczególna współpraca z Igorem Strawińskim stanowi osobny rozdział w historii sztuki dwudziestego wieku. Obaj artyści, urodzeni w Rosji, osiedleni w Ameryce, łączyli geniusz muzyczny i choreograficzny w sposób bezprecedensowy.

Balanchine zmarł 30 kwietnia 1983 roku w Nowym Jorku. Jego spuścizna żyje — NYCB nadal tańczy jego balety, a School of American Ballet kształci kolejne pokolenia tancerzy.`,
  },
  {
    id: 'sylwetka-diaghilev',
    imieNazwisko: 'Siergiej Diagilew',
    slug: 'serge-diaghilev',
    rola: 'Dyrektor artystyczny',
    teatrGlowny: 'Ballets Russes',
    narodowosc: 'Rosja',
    dataUrodzenia: '1872-03-31',
    dataSmierci: '1929-08-19',
    aktywny: false,
    polskiArtysta: false,
    wyroznienie: true,
    najwazniejszeRole: ['Ognisty ptak (produkcja)', 'Pietruszka (produkcja)', 'Święto wiosny (produkcja)', 'Parada (produkcja)', 'Apollo (produkcja)'],
    zdjecie: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Serge_Diaghilev.jpg',
    bio: `### Siergiej Diagilew (1872–1929) — Człowiek, który nigdy nie tańczył

Siergiej Pawłowicz Diagilew — człowiek, który sam nigdy nie tańczył, nie komponował ani nie malował, a mimo to zmienił oblicze wszystkich trzech sztuk jednocześnie. Urodzony 31 marca 1872 roku, był synem oficera z zamożnej rodziny szlacheckiej. Jego matka zmarła krótko po porodzie, ale macocha Jelena zaszczepił w nim miłość do muzyki i sztuki.

#### Od Świata Sztuki do Ballets Russes

Studiował prawo i muzykę w Petersburgu — sam Rimski-Korsakow odradził mu karierę kompozytorską. Zamiast tworzyć sztukę sam, postanowił ją organizować. W 1898 roku założył czasopismo Mir Iskusstwa (Świat Sztuki). W 1906 roku zorganizował w Grand Palais w Paryżu monumentalną wystawę rosyjskiego malarstwa. W 1909 roku założył Ballets Russes — zespół, który przez dwadzieścia lat stanowił epicentrum artystycznej rewolucji.

#### Katalizator geniuszy

Diagilew traktował balet jako dzieło totalne. Zamówił u Strawińskiego Ognistego ptaka, Pietruszkę i Święto wiosny. Współpracował z Picassem, Matisse'em, Coco Chanel. Jego choreografowie — Fokin, Niżyński, Massine, Balanchine — każdy wnosił coś nowego. Premiera Święta wiosny w 1913 roku wywołała zamieszki na widowni — Diagilew wydawał się zadowolony, wiedząc że prawdziwa sztuka musi prowokować.

Zmarł 19 sierpnia 1929 roku w Wenecji. Na jego grobie na wyspie San Michele nigdy nie brakuje baletowych pointów, zostawianych przez tancerzy z całego świata. Jego byli współpracownicy rozjechali się po świecie i wszędzie zaszczepili baletowe nasiona — Balanchine stworzył balet amerykański, de Valois brytyjski, Lifar francuski.`,
  },
  {
    id: 'sylwetka-karsavina',
    imieNazwisko: 'Tamara Karsawina',
    slug: 'tamara-karsavina',
    rola: 'Primabalerina',
    teatrGlowny: 'Ballets Russes / Teatr Maryjski',
    narodowosc: 'Rosja',
    dataUrodzenia: '1885-03-09',
    dataSmierci: '1978-05-26',
    aktywny: false,
    polskiArtysta: false,
    wyroznienie: true,
    najwazniejszeRole: ['Ognisty Ptak', 'Balerina (Pietruszka)', 'Widmo Róży', 'Thamar', 'Giselle'],
    zdjecie: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Tamara_Karsavina_as_Armide_in_Pavillon_d_Armide_1911.jpg',
    bio: `### Tamara Karsawina (1885–1978) — Ognisty Ptak rosyjskiego baletu

Tamara Płatonowna Karsawina przyszła na świat 9 marca 1885 roku w Petersburgu, w rodzinie głęboko zanurzonej w świecie baletu. Jej ojciec Platon Karsawin był uznanym tancerzem i pedagogiem Cesarskiej Szkoły Baletowej. Paradoksalnie, właśnie dlatego sprzeciwiał się karierze córki. Dopiero interwencja matki otworzyła jej drogę do szkoły baletowej.

#### Gwiazda Ballets Russes

W 1902 roku ukończyła szkołę i rozpoczęła karierę w Teatrze Maryjskim. Prawdziwy przełom nastąpił w 1909 roku, gdy Diagilew uczynił ją pierwszą tancerką Ballets Russes. Rozkwitło jej partnerstwo z Niżyńskim — on jako Widmo Róży, ona jako marzyca; on jako Pietruszka, ona jako kapryśna Balerina.

#### Ognisty Ptak

Najsłynniejszym osiągnięciem Karsawiny pozostaje tytułowa rola w Ognistym Ptaku Strawińskiego (1910). Rola była pierwotnie przeznaczona dla Pawłowej, która odrzuciła muzykę jako „niemożliwą do tańczenia." Karsawina podjęła wyzwanie i stworzyła kreację, która przeszła do historii. Nazajutrz paryskie gazety pisały o niej jako LA KARSAVINA.

#### Filary brytyjskiego baletu

W 1917 roku poślubiła brytyjskiego dyplomatę i osiadła w Londynie. Współzałożyła Królewską Akademię Tańca (1920) i Towarzystwo Camargo. Przez lata pomagała młodej Margot Fonteyn, a w wieku ponad osiemdziesięciu lat asystowała Fonteyn i Nurejewowi przy wznowieniu Le Spectre de la Rose. Jej autobiografia Theatre Street należy do najlepszych wspomnień baletowych w literaturze. Zmarła w 1978 roku w Anglii, mając dziewięćdziesiąt trzy lata.`,
  },
  {
    id: 'sylwetka-petipa',
    imieNazwisko: 'Marius Petipa',
    slug: 'marius-petipa',
    rola: 'Choreograf',
    teatrGlowny: 'Balet Cesarski (Teatr Maryjski)',
    narodowosc: 'Francja / Rosja',
    dataUrodzenia: '1818-03-11',
    dataSmierci: '1910-07-14',
    aktywny: false,
    polskiArtysta: false,
    wyroznienie: true,
    najwazniejszeRole: ['Śpiąca królewna', 'Jezioro Łabędzie (1895)', 'Bajadera', 'Don Kichot', 'Raymonda', 'Paquita'],
    zdjecie: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Marius_Petipa_-1870.JPG',
    zdjecieInline: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Marius_Ivanovich_Petipa_-Feb._14_1898.JPG',
    zdjecieInlineCaption: 'Marius Petipa w 1898 roku — u szczytu kariery',
    bio: `### Marius Petipa (1818–1910) — Ojciec klasycznego baletu

Victor Marius Alphonse Petipa urodził się 11 marca 1818 roku w Marsylii, w rodzinie, dla której taniec był zarówno powołaniem, jak i chlebem powszednim. Jego ojciec Jean-Antoine należał do najważniejszych baletmistrzów Europy, a starszy brat Lucien został uznanym tancerzem paryskiej Opery. Mały Marius rozpoczął naukę tańca w wieku siedmiu lat.

#### Wędrowiec Europy

Wczesna kariera Petipy była pełna wędrówek. W 1839 roku towarzyszył ojcu w tournée po Stanach Zjednoczonych — był to pierwszy pełny spektakl baletowy, jaki zobaczyła nowojorska publiczność. Następne lata spędził w Hiszpanii, gdzie poznał tradycje tańca hiszpańskiego — doświadczenie, które zaowocowało niezliczonymi divertissementami w jego późniejszych baletach.

#### Petersburski triumf

W 1847 roku przyjechał do Petersburga i już nigdy go nie opuścił. W 1869 roku został głównym choreografem Baletu Cesarskiego — stanowisko, które zajmował przez niemal czterdzieści lat, tworząc ponad sześćdziesiąt pełnych baletów.

#### Współpraca z Czajkowskim

Śpiąca królewna (1890) jest powszechnie uznawana za szczytowe osiągnięcie baletu klasycznego. Historia Jeziora Łabędziego jest fascynująca — oryginalna wersja z 1877 roku nie odniosła sukcesu. Dopiero wznowienie z 1895 roku, z choreografią Petipy (akty I i III) i Iwanowa (akty II i IV), stało się podstawą wszystkich współczesnych inscenizacji.

Petipa miał niezwykły instynkt teatralny. Gdy włoska balerina Legnani zademonstrwała trzydzieści dwa fouettés, natychmiast włączył je do Jeziora Łabędziego. Od tamtej pory stały się ikonicznym sprawdzianem każdej baleriny.

Zmarł 14 lipca 1910 roku na Krymie. Dwa wieki po jego narodzinach, Śpiąca królewna, Jezioro Łabędzie i Don Kichot pozostają filarami repertuaru każdego liczącego się zespołu baletowego na świecie.`,
  },
]

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  Ładowanie sylwetek do Sanity')
  console.log('═══════════════════════════════════════════════════════════\n')

  for (const s of sylwetki) {
    console.log(`▸ ${s.imieNazwisko}...`)

    // Upload main photo
    const mainPhoto = await uploadImage(s.zdjecie, `${s.slug}-portret.jpg`)

    // Upload inline photo if available
    let inlinePhoto = null
    if (s.zdjecieInline) {
      inlinePhoto = await uploadImage(s.zdjecieInline, `${s.slug}-inline.jpg`)
    }

    // Convert bio to Portable Text blocks
    let bioBlocks = textToBlocks(s.bio)

    // Insert inline image if we have one
    if (inlinePhoto) {
      bioBlocks = insertImageBlock(bioBlocks, inlinePhoto, s.zdjecieInlineCaption || s.imieNazwisko)
    }

    // Create/update sylwetka document
    const doc = {
      _id: s.id,
      _type: 'sylwetka',
      imieNazwisko: s.imieNazwisko,
      slug: { _type: 'slug', current: s.slug },
      rola: s.rola,
      teatrGlowny: s.teatrGlowny,
      narodowosc: s.narodowosc,
      dataUrodzenia: s.dataUrodzenia,
      dataSmierci: s.dataSmierci || undefined,
      aktywny: s.aktywny,
      polskiArtysta: s.polskiArtysta,
      wyroznienie: s.wyroznienie,
      najwazniejszeRole: s.najwazniejszeRole,
      bio: bioBlocks,
    }

    if (mainPhoto) doc.zdjecie = mainPhoto

    await client.createOrReplace(doc)
    console.log(`  ✓ ${s.imieNazwisko} — zapisano\n`)
  }

  console.log('═══════════════════════════════════════════════════════════')
  console.log(`  Gotowe! Załadowano ${sylwetki.length} sylwetek.`)
  console.log('═══════════════════════════════════════════════════════════')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
