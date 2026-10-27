/**
 * create-artykul-dyrekcje-teatrow.mjs
 * "Kto prowadzi polski balet" - zestawienie dyrektorów dziesięciu teatrów
 * operowych i szefów ich zespołów baletowych.
 *
 * ARTYKUŁ JEST POMYŚLANY JAKO ŻYWY. Kiedy coś się zmieni:
 *   1. popraw wpis w sekcji danego teatru,
 *   2. dopisz linijkę w sekcji "Aktualizacje" na końcu,
 *   3. zmień DATA_STANU u góry (wchodzi do zajawki i do nagłówka sekcji),
 *   4. przebuduj okładkę, jeśli zmieniasz datę na grafice (patrz niżej),
 *   5. uruchom skrypt ponownie - jest idempotentny po slugu i nie rusza
 *      daty pierwszej publikacji,
 *   6. uruchom też scripts/update-teatry-dyrekcje-2026-10.mjs, żeby to samo
 *      trafiło do kart teatrów na /teatry.
 *
 * ŹRÓDŁA - wszystko czytane wprost ze stron teatrów i ich BIP-ów 27.10.2026:
 *   Warszawa  teatrwielki.nowybip.pl/dane-teleadresowe
 *             teatrwielki.pl/teatr/polski-balet-narodowy/dyrekcja-i-kadra-pbn
 *   Poznań    opera.poznan.pl/pl/zespol (sekcje DYREKCJA i BALET)
 *   Łódź      operalodz.4bip.pl (Dyrekcja, Balet) + operalodz.com/Kontakt,34
 *   Gdańsk    operabaltycka.pl/zespol
 *   Wrocław   opera.wroclaw.pl/teatr/zespol-v2
 *   Kraków    opera.krakow.pl/zespol
 *   Bydgoszcz opera.bydgoszcz.pl/kontakt/kadra-kierownicza-1
 *   Szczecin  opera.szczecin.pl/teatr/nasz-zespol/dyrekcja oraz .../balet-opery-na-zamku
 *   Bytom     opera-slaska.pl/zespol
 *   Lublin    operalubelska.pl/o-nas/artysci (Zespół baletu) i /o-nas/dyrekcja
 *
 * UWAGA NA WYSZUKIWARKI. Przy tym materiale podrzucały nazwiska sprzed lat:
 * dla Bydgoszczy Ilonę Jaświn-Madejską (odeszła w 2020), dla Krakowa Elenę
 * Korpusenko. Daty objęcia funkcji podajemy tylko tam, gdzie potwierdza je
 * teatr albo konkretny komunikat prasowy - przy Tyskim, Sokołowskiej-Boulton
 * i Wiśniewskiej świadomie ich nie ma, bo nigdzie nie udało się ich ustalić.
 *
 * OKŁADKA: images/dyrekcje-teatrow-okladka.jpg, zrobiona z
 *   scripts/karta-tytulowa.py <katalog> <zdjęcie 16:9> <wynik> \
 *     "Stan na 27 października 2026" "Kto prowadzi balet" \
 *     "Dyrektorzy i szefowie baletu w dziesięciu teatrach" 0.56 0 1.0 0.45
 * Zdjęcie bazowe: Unsplash, Neon Wang (pusta widownia, goła scena).
 * Kadr jest ciemny po lewej, więc poświata zbędna (0), wystarczyły płytki.
 */
import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const SLUG = 'kto-prowadzi-polski-balet'
const DATA_STANU = '27 października 2026'

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

/** Linijka "Etykieta: Nazwisko, reszta zdania" z nazwiskiem półgrubym. */
const osoba = (etykieta, nazwisko, reszta) => ({
  _type: 'block', _key: key(), style: 'normal', markDefs: [],
  children: [span(etykieta), span(nazwisko, ['strong']), span(reszta)],
})

const blockZLinkiem = (przed, tekstLinku, href, po) => {
  const k = key()
  return {
    _type: 'block', _key: key(), style: 'normal',
    markDefs: [{ _key: k, _type: 'link', href }],
    children: [span(przed), span(tekstLinku, [k]), span(po)],
  }
}

const TYTUL = 'Kto prowadzi polski balet. Dyrektorzy teatrów i szefowie zespołów baletowych'

const ZAJAWKA =
  'Dziesięć teatrów operowych, których repertuar prowadzimy na portalu, utrzymuje stały zespół baletowy. W każdym z nich ' +
  'o tym, co zobaczymy na scenie, decydują dwie osoby: dyrektor instytucji i szef baletu. Zebraliśmy wszystkie dwadzieścia ' +
  `nazwisk w jednym miejscu. Stan na ${DATA_STANU}; zestawienie będziemy aktualizować.`

const tresc = [
  block('W każdym teatrze, który utrzymuje stały zespół baletowy, są dwa stanowiska, od których zależy, co ten zespół tańczy. Dyrektor instytucji odpowiada za całość: plan repertuarowy, pieniądze, obsadę stanowisk kierowniczych. Szef baletu odpowiada za tancerzy: codzienną klasę, przydział ról, zapraszanych choreografów, kondycję zespołu. Pierwszy decyduje, czy w sezonie będzie premiera baletowa. Drugi decyduje, jaka.'),
  block('Poniżej obie funkcje w dziesięciu teatrach operowych z własnym zespołem baletowym, czyli w tych, których repertuar prowadzimy na portalu. Najpierw trzy Teatry Wielkie, potem reszta alfabetycznie według miast. Wszystkie nazwiska pochodzą ze stron samych teatrów i ich Biuletynów Informacji Publicznej.'),

  h2('Dwa razy dyrektor, osiem razy kierownik'),
  block('Nazwa stanowiska nie jest tu kosmetyką. W ośmiu teatrach zespołem baletowym kieruje „kierownik baletu" - stanowisko w jednym szeregu z kierownikiem chóru i kierownikiem orkiestry, podległe dyrektorowi. W dwóch jest „dyrektor baletu". To są dokładnie te dwa miejsca, w których balet nie jest jednym z zespołów teatru, tylko ma własną pozycję.'),
  block('Warszawa ma tak od 2009 roku, od kiedy istnieje Polski Balet Narodowy, a jego dyrektor jest zarazem zastępcą dyrektora teatru. Poznań dołączył 15 października tego roku. Obejmując zespół, Anna Hop dostała tytuł dyrektorki baletu, którego jej poprzednik nie miał, a teatr nazwał to wprost podniesieniem rangi stanowiska i uzasadnił miejscem tańca w swojej działalności.'),

  h2('Teatr Wielki - Opera Narodowa, Warszawa'),
  osoba('Dyrektor: ', 'Boris Kudlička', '. Scenograf, powołany przez ministrę kultury Hannę Wróblewską po jednogłośnej rekomendacji komisji konkursowej. Kieruje teatrem od 1 września 2025 roku, na pięcioletnią kadencję, z programem na lata 2025-2030. Zastąpił Waldemara Dąbrowskiego, który pozostał w teatrze jako pełnomocnik do spraw kontaktów z organizacjami pozarządowymi i środowiskami twórczymi. Pełnomocnikiem do spraw artystycznych jest Mariusz Treliński, a dyrektorem muzycznym, od tego sezonu, Yoel Gamzou.'),
  osoba('Balet: ', 'Krzysztof Pastor', ', dyrektor Polskiego Baletu Narodowego od marca 2009 roku, czyli od powstania zespołu w obecnym kształcie. W strukturze teatru figuruje jako zastępca dyrektora do spraw Polskiego Baletu Narodowego. To najdłuższy staż na stanowisku baletowym w całym zestawieniu: siedemnaście lat.'),

  h2('Teatr Wielki im. Stanisława Moniuszki, Poznań'),
  osoba('Dyrektor: ', 'Adam Banaszak', ', dyrygent. Objął stanowisko 1 września 2026 roku, kadencja potrwa do 31 sierpnia 2031. Droga była długa: pierwszy konkurs, ogłoszony w czerwcu 2025, nie wyłonił zwycięzcy, a obowiązki pełniła dalej Renata Borowska-Juszczyńska, która kierowała teatrem od 2012 roku. Banaszak wygrał dopiero drugi konkurs, w marcu 2026, i został powołany uchwałą zarządu województwa wielkopolskiego w czerwcu.'),
  osoba('Balet: ', 'Anna Hop', ', dyrektorka baletu od 15 października 2026 roku. Choreografka, reżyserka i pedagożka, od 2009 roku związana z Polskim Baletem Narodowym, współpracująca z Operą Paryską. Zastąpiła Roberta Bondarę, który prowadził poznański zespół osiem sezonów i odszedł, żeby skupić się na pracy choreograficznej. To najświeższa zmiana w całym zestawieniu.'),

  h2('Teatr Wielki, Łódź'),
  osoba('Dyrektor: ', 'Rafał Kłoczko', ', dyrygent i kompozytor, poprzednio szef Filharmonii Zielonogórskiej. Wygrał konkurs ogłoszony w październiku 2025, spośród jedenastu kandydatów; komisja wskazała go 9 stycznia 2026 na kadencję od 1 września 2026 do 31 sierpnia 2029. Zarząd województwa łódzkiego powierzył mu pełnienie obowiązków już 6 maja 2026, po tym jak z końcem kwietnia odszedł Marcin Nałęcz-Niesiołowski. W BIP-ie teatru wciąż figuruje jako pełniący obowiązki, mimo że konkursowa kadencja miała się zacząć we wrześniu. Zastępcą do spraw artystycznych jest Rafał Janiak.'),
  osoba('Balet: ', 'Gintautas Potockas', ', pełniący obowiązki kierownika baletu. Z łódzkim teatrem związany od 1998 roku, wcześniej tancerz Litewskiego Teatru Narodowego Opery i Baletu, prodziekan kierunku taniec w łódzkiej Akademii Humanistyczno-Ekonomicznej. Łódź jest jedynym teatrem w zestawieniu, w którym obie funkcje sprawowane są tymczasowo.'),

  h2('Opera Nova, Bydgoszcz'),
  osoba('Dyrektor: ', 'Maciej Figas', ', dyrygent, na czele teatru od 1992 roku. Trzydzieści cztery lata to najdłuższa dyrekcja w tym zestawieniu, i to z dużym zapasem. We wrześniu 2025 odebrał nominację na kolejną pięcioletnią kadencję, po konkursie, którego Ministerstwo Kultury zażądało zamiast zapowiadanego wcześniej przedłużenia bez konkursu. Komisja zarekomendowała go jednogłośnie; wcześniej za jego pozostaniem podpisało się ponad osiemdziesiąt procent pracowników opery.'),
  osoba('Balet: ', 'Małgorzata Chojnacka', ', kierowniczka baletu i pedagożka, od sezonu 2020/2021. Tancerka i baletmistrzyni, solistka w Łodzi i w warszawskim Teatrze Wielkim, w latach 2009-2014 baletmistrzyni Teatru Wielkiego w Poznaniu, a przez kolejne sześć lat w Ostrawie. Zastąpiła Ilonę Jaświn-Madejską, która prowadziła bydgoski zespół dziesięć lat.'),

  h2('Opera Śląska, Bytom'),
  osoba('Dyrektor: ', 'Łukasz Goik', ', dyrektor od 2016 roku, po wieloletniej dyrekcji Tadeusza Serafina. W Operze Śląskiej pracuje od 2004 roku, zaczynał w obsłudze widowni i koordynacji pracy artystycznej, od 2012 był zastępcą dyrektora do spraw technicznych i remontowych.'),
  osoba('Balet: ', 'Grzegorz Pajdzik', ', kierownik baletu od 2017 roku. Jako choreograf współpracujący teatr wymienia obok niego Henryka Konwińskiego.'),

  h2('Opera Bałtycka, Gdańsk'),
  osoba('Dyrektor: ', 'Romuald Wicza-Pokojski', ', reżyser i dramaturg, dyrektor od 2018 roku. Wcześniej, w latach 2011-2019, prowadził gdański Teatr Miniatura; w 1991 założył Teatr Wiczy. Zastępcą do spraw muzycznych jest Yaroslav Shemet, najmłodszy dyrektor muzyczny w historii tej instytucji.'),
  osoba('Balet: ', 'Izabela Sokołowska-Boulton', ', kierowniczka baletu i choreografka, w Operze Bałtyckiej od września 2016 roku - najpierw jako baletmistrzyni i zastępczyni kierownika baletu, później na czele zespołu, po Wojciechu Warszawskim. Absolwentka gdańskiej szkoły baletowej, w latach 2002-2007 solistka Duńskiego Baletu Królewskiego, zdobywczyni jedynego w historii Polski złotego medalu Międzynarodowego Konkursu Baletowego w Warnie. Jej zastępcą jest Filip Michalak.'),

  h2('Opera Krakowska'),
  osoba('Dyrektor: ', 'Piotr Sułkowski', ', dyrygent, dyrektor od 2022 roku, powołany przez zarząd województwa małopolskiego na pięcioletnią kadencję. Wcześniej, od 2011 roku, kierował Filharmonią Warmińsko-Mazurską w Olsztynie.'),
  osoba('Balet: ', 'Jacek Tyski', ', kierownik zespołu baletu. Choreograf, wcześniej związany z Teatrem Wielkim - Operą Narodową w Warszawie. Krakowski zespół pracuje pod jego kierownictwem artystycznym co najmniej od sezonu 2023/2024; teatr nie podaje daty objęcia funkcji.'),

  h2('Opera Lubelska'),
  osoba('Dyrektor: ', 'Kamila Lendzion', ', dyrektorka od września 2018 roku.'),
  osoba('Balet: ', 'Dorota Wiśniewska', ', kierowniczka zespołu baletu. Regulamin organizacyjny opery wymienia kierownika baletu wśród stanowisk podległych bezpośrednio dyrektorowi, obok kierownika muzycznego i kierownika chóru.'),

  h2('Opera na Zamku, Szczecin'),
  osoba('Dyrektor: ', 'Jacek Jekiel', ', na czele teatru od 2013 roku. W styczniu 2025 rozpoczął trzecią, pięcioletnią kadencję, po konkursie, w którym stanął wobec jednej kontrkandydatki. Przedstawił plan na lata 2025-2030. Za pierwszej dyrekcji przeprowadził generalną przebudowę zamkowej sceny, zakończoną w 2015 roku. Zastępczynią do spraw artystycznych jest dyrygentka Agnieszka Nagórka.'),
  osoba('Balet: ', 'Grzegorz Brożek', ', kierownik baletu od 2022 roku, tancerz i choreograf. Przed nim zespołem kierowali kolejno Dominik Muśko, Zbigniew Czapski-Kłoda i Lucyna Zwolińska - szczeciński balet ma za sobą najwięcej zmian na tym stanowisku w ostatnich latach.'),

  h2('Opera Wrocławska'),
  osoba('Dyrektor: ', 'Agnieszka Franków-Żelazny', ', chórmistrzyni i profesorka wrocławskiej Akademii Muzycznej, dyrektorka naczelna od 1 stycznia 2025 roku. O stanowisko ubiegało się dwanaścioro kandydatów. Wcześniej, od września 2022, kierowała Filharmonią Sudecką w Wałbrzychu. Zastąpiła Tomasza Janczaka.'),
  osoba('Balet: ', 'Małgorzata Dzierżon', ', kierowniczka baletu od sierpnia 2022 roku. Teatr opisuje repertuar baletowy ostatnich sezonów jako budowany pod jej kierownictwem artystycznym.'),

  h2('Cztery nowe nazwiska w niespełna dwa lata'),
  block('Jeśli spojrzeć na te dziesięć teatrów jak na jedną tabelę, widać ruch, jakiego dawno nie było. Od stycznia 2025 roku zmienił się dyrektor w czterech instytucjach: we Wrocławiu, w Warszawie, w Łodzi i w Poznaniu. W dwóch kolejnych, w Szczecinie i w Bydgoszczy, dotychczasowi dyrektorzy przeszli przez konkurs i zostali - w Bydgoszczy dlatego, że Ministerstwo Kultury zażądało konkursu zamiast zapowiadanego przedłużenia umowy. Razem sześć z dziesięciu stanowisk rozstrzygało się w ciągu dwudziestu dwóch miesięcy.'),
  block('Po stronie baletowej ruchu jest mniej. Jedyna zmiana w tym okresie to Poznań w październiku tego roku. Pozostałe dziewięć zespołów prowadzą te same osoby co dwa lata temu, a pięć z nich pracuje na tym stanowisku od co najmniej czterech sezonów.'),
  block('Zwraca uwagę jeszcze jedno. Wśród dziesięciorga dyrektorów teatrów są dwie kobiety, wśród dziesięciorga szefów baletu - pięć. Praktycznie wszyscy szefowie zespołów to byli tancerze albo czynni choreografowie; wśród dyrektorów instytucji przeważają dyrygenci.'),

  h2('Co jest nierozstrzygnięte'),
  block('Jedno stanowisko w tym zestawieniu nie jest zamknięte. W Łodzi Rafał Kłoczko wygrał konkurs na kadencję liczoną od 1 września 2026, ale Biuletyn Informacji Publicznej teatru nadal opisuje go jako pełniącego obowiązki. Tak samo opisany jest Gintautas Potockas po stronie baletu. Dopóki teatr tego nie zmieni, podajemy to tak, jak podaje sam teatr.'),
  blockZLinkiem('Dane kontaktowe, adresy i repertuary wszystkich dziesięciu scen zbieramy na stronie ', 'swiatbaletu.pl/teatry', 'https://swiatbaletu.pl/teatry', '.'),

  h2('Aktualizacje'),
  block(`${DATA_STANU} - pierwsza wersja zestawienia. Wszystkie dwadzieścia stanowisk sprawdzone u źródeł tego dnia.`),
  block('Jeśli wiesz o zmianie, której tu nie ma, napisz do nas. Zestawienie poprawimy i odnotujemy datę poprawki w tym miejscu.'),
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
  const okladka = await wgraj('dyrekcje-teatrow-okladka.jpg')

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
      alt: 'Pusta widownia teatru operowego i goła scena za podniesioną kurtyną',
      zrodlo: 'fot. Neon Wang / Unsplash',
    },
    trescGlowna: tresc,
    autor: 'Redakcja Świat Baletu',
    dataPublikacji: new Date().toISOString(),
    featured: true,
    czasCzytania,
    tagi: [
      'dyrektorzy teatrów', 'kierownicy baletu', 'Polski Balet Narodowy', 'Krzysztof Pastor',
      'Anna Hop', 'Boris Kudlička', 'Adam Banaszak', 'teatry operowe w Polsce', 'zestawienie',
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
