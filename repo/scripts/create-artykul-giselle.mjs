/**
 * create-artykul-giselle.mjs
 * "Trzy „Giselle" jednego sezonu" - bogatszy artykuł z okładką i zdjęciami w treści.
 * Źródło: Google Drive, "1noN3I4r..." (24.09.2026)
 *
 * Zdjęcia - wszystkie oficjalne, ze stron teatrów, z autorem przy każdym,
 * zgodnie z praktyką opisaną w "Plakaty festiwali - wrzesień 2026":
 *   okładka i Warszawa .... fot. Ewa Krasucka / Teatr Wielki - Opera Narodowa
 *   Okładka to karta tytułowa: na zdjęciu Krasuckiej naniesiony tekst
 *   (Cormorant Garamond + Plus Jakarta Sans, czyli kroje portalu),
 *   generowana skryptem scripts/karta-tytulowa.py
 *   Gdańsk ................ fot. Krzysztof Mystkowski / KFP / Opera Bałtycka
 *   Łódź .................. fot. Joanna Miklaszewska / Teatr Wielki w Łodzi
 *
 * KOREKTY WOBEC WERSJI Z DRIVE'A:
 *  - "Albrechtem był Lucien Petipa" -> "Albertem"; tekst wszędzie indziej
 *    używa formy Albert, a TW-ON nazywa tę partię "Książę Albert Śląski"
 *  - "Julesa Perrota" -> "Jules'a Perrota", zgodnie z zapisem w naszych
 *    wcześniejszych tekstach
 *  - warszawskie obsady rozpisane z myślnikami, jak w poprzednich artykułach
 *  - "w 1841 i dziś" -> "w 1841 roku i dziś"
 *  - tytuły spektaklu w cudzysłowie także w tytule artykułu
 *  - bez noty o powiązaniu redakcyjnym (decyzja redakcji z 24.09)
 *  - "a Rosja go przechował" -> "przechowała" (zgoda rodzaju, zgłoszone
 *    przez redakcję po publikacji)
 *  - usunięte ceny biletów przy Łodzi - jedyne miejsce w tekście, gdzie
 *    się pojawiały, a w artykule o balecie są zbędne
 *  - dodane streszczenie libretta na wejściu, jako blockquote
 *  - odniesienia względne zamienione na daty: "Dziś wieczorem" i "Dziś
 *    Giselle tańczy" -> "24 września (czwartek)", "W niedzielę" ->
 *    "w niedzielę 27 września", "Do czerwca" -> "W listopadzie i w kwietniu".
 *    Pozostałe "dziś" w tekście znaczą "w dzisiejszych czasach" i zostają.
 *
 * Idempotentny: po slug - patchuje istniejący.
 */
import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const SLUG = 'trzy-giselle-jednego-sezonu'

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
const obraz = (assetId, podpis) => ({
  _type: 'image', _key: key(),
  asset: { _type: 'reference', _ref: assetId },
  alt: dash(podpis),
})

const TYTUL = 'Trzy „Giselle" jednego sezonu. Historia baletu, który przetrwał, choć Paryż o nim zapomniał'

const ZAJAWKA =
  'W czwartek 24 września w Teatrze Wielkim - Operze Narodowej ruszyła pierwsza w tym sezonie polska „Giselle". ' +
  'W listopadzie i w kwietniu zobaczymy ją jeszcze w Gdańsku i w Łodzi - w trzech inscenizacjach tak różnych, że trudno ' +
  'uwierzyć, iż chodzi o ten sam tytuł. To dobry moment, żeby przypomnieć, skąd wzięła się historia ' +
  'o dziewczynie, która umiera z miłości i wraca po śmierci, by tę miłość ocalić. A także jak to się stało, ' +
  'że balet, który Paryż skreślił z afisza na pół wieku, jest dziś jednym z najczęściej granych na świecie.'

const tresc = (A) => [
  // Streszczenie libretta jako blockquote - renderer daje mu złotą kreskę
  // i kursywę, więc odcina się od reszty i można je przeczytać osobno.
  block('Rzecz dzieje się w nadreńskiej wiosce w czasie winobrania. Giselle, wiejska dziewczyna o słabym sercu, kocha taniec i zakochuje się w Loysie - w rzeczywistości księciu Albercie, który przebrał się za wieśniaka i przemilczał, że jest już zaręczony. Gdy gajowy Hilarion, sam zakochany w Giselle, demaskuje oszustwo, dziewczyna traci zmysły i umiera. Akt drugi rozgrywa się nocą przy jej grobie, gdzie rządzą wilisy pod wodzą Mirty - duchy dziewcząt zmarłych przed własnym ślubem, zatańcowujące na śmierć każdego napotkanego mężczyznę. Hilarion ginie. Alberta ratuje sama Giselle: tańczy z nim aż do świtu, bo o brzasku wilisy tracą moc.', 'blockquote'),

  h2('Wszystko zaczęło się od książki, którą poeta przeczytał wieczorem'),
  block('Théophile Gautier - poeta, krytyk i jeden z najbardziej wpływowych piór ówczesnego Paryża - czytał „De l\'Allemagne" Heinricha Heinego. Natrafił tam na opis wilis: duchów dziewcząt zmarłych przed dniem własnego ślubu, które nocami wychodzą z grobów i zmuszają napotkanych mężczyzn do tańca, aż ci padają z wyczerpania. Gautier od razu zobaczył w tym balet.'),
  block('Drugim źródłem był wiersz „Fantômes" ze zbioru „Les Orientales" Wiktora Hugo - o piętnastoletniej Hiszpance, która zatańczyła się na śmierć. Legenda, na którą powołują się do dziś programy teatralne, pochodzi z gór Harcu.'),
  block('Gautier nie był jednak człowiekiem teatru i do napisania scenariusza wziął zawodowca: Jules-Henriego Vernoy de Saint-Georges. Ten uporał się z zadaniem w trzy dni. Muzykę zamówiono u Adolphe\'a Adama, jednego z najpopularniejszych kompozytorów epoki, i on też nie zwlekał - partyturę napisał w jakieś dwa miesiące.'),
  block('Prapremiera odbyła się 28 czerwca 1841 roku w Salle Le Peletier w Paryżu, na scenie Akademii Królewskiej Muzyki. Choreografię podpisali Jean Coralli i Jules Perrot, rolę tytułową zatańczyła włoska balerina Carlotta Grisi, Albertem był Lucien Petipa - starszy brat Mariusa, który za kilkadziesiąt lat odmieni losy tego baletu.'),
  block('Sukces był natychmiastowy i policzalny. Między czerwcem a wrześniem 1841 roku „Giselle" przyniosła teatrowi 6500 franków - dwa razy więcej niż analogiczny okres dwa lata wcześniej. Jeden z recenzentów napisał o Grisi, że tańczy „jak zakochana gazela".'),

  h2('Człowiek, którego nie było na afiszu'),
  block('Za oficjalnego autora choreografii uchodził Jean Coralli, wówczas baletmistrz Opery. Ale partie samej Grisi - a więc wszystko, co w tym balecie najważniejsze - ułożył Jules Perrot. Był jej nauczycielem i partnerem życiowym, i to on pracował z nią nad rolą.'),
  block('Na afiszu i w programie jego nazwiska nie było.'),
  block('Dziś podaje się obu, zawsze razem: Coralli i Perrot. Sprawiedliwość historyczna przyszła jednak z dużym opóźnieniem, a przypadek Perrota jest jednym z częściej przywoływanych przykładów tego, jak w XIX-wiecznym teatrze rozdzielano zasługi.'),

  h2('Jak Paryż stracił swój balet, a Rosja go przechowała'),
  block('Dopóki tańczyła Grisi, „Giselle" trzymała się afisza. Grisi występowała w tej roli do 1849 roku - i to praktycznie ona jedna. Potem balet zdjęto. Wracał na krótko na początku lat pięćdziesiątych, jeszcze raz w latach sześćdziesiątych, i w 1868 roku zniknął z Opery Paryskiej na dobre.'),
  block('W tym samym czasie w Petersburgu działo się coś odwrotnego. Marius Petipa wracał do „Giselle" raz po raz, za każdym razem przygotowując ją dla kolejnej baleriny: w 1884 roku dla Marii Gorszenkowej, w 1887 dla Emmy Bessone, w 1899 dla Henrietty Grimaldi i wreszcie w 1903 dla Anny Pawłowej. To w tych wznowieniach balet dojrzał do kształtu, w jakim znamy go dziś - i to z nich, nie z paryskiego oryginału, wywodzi się większość choreografii oglądanej obecnie na świecie.'),
  block('Do Paryża „Giselle" wróciła dopiero w 1924 roku, na debiut Olgi Spiesiwcewej w roli tytułowej, uznawanej potem za najwybitniejszą Giselle dwudziestego wieku. Od tamtej pory już afisza nie opuściła.'),
  block('Jest w tym pewna ironia, o której warto pamiętać, oglądając ten balet w polskim teatrze: francuskie dzieło przetrwało, bo ktoś w Rosji uparł się, żeby je grać, i wróciło na zachód okrężną drogą, przez Petersburg.'),

  h2('Polski wątek zaczyna się w 1848 roku'),
  block('Do Warszawy „Giselle" dotarła siedem lat po paryskiej prapremierze, w 1848 roku. Wystawił ją Roman Turczynowicz - ten sam, którego imię nosi dziś warszawska Ogólnokształcąca Szkoła Baletowa.'),
  block('Później tytuł wracał na warszawską scenę wielokrotnie. Dwie realizacje z drugiej połowy dwudziestego wieku, z 1968 i 1976 roku, miały scenografię i kostiumy Andrzeja Kreutza Majewskiego. Potem, po spektaklu z 1997 roku, „Giselle" zniknęła z afisza Teatru Wielkiego na ćwierć wieku.'),
  block('Wróciła 25 listopada 2022 roku - i wróciła w sposób, który warto docenić: projekty Kreutza Majewskiego odtworzono i zaadaptowano na nowo. Dekoracje opracowała Małgorzata Szabłowska, kostiumy Katarzyna Rott. Oglądając dziś warszawską „Giselle", widzi się więc scenografię pomyślaną blisko sześćdziesiąt lat temu.'),

  h2('Trzy „Giselle" tego sezonu'),
  block('Sprawdziliśmy w naszym repertuarze wszystkie miesiące sezonu, teatr po teatrze. „Giselle" grają dokładnie trzy sceny, łącznie jedenaście razy - i każda opowiada ją inaczej.'),

  h3('Warszawa: wersja kanoniczna'),
  block('Teatr Wielki - Opera Narodowa, Polski Balet Narodowy. Terminy: 24.09 (czw.) 19:00, 27.09 (niedz.) 18:00, 1.10 (czw.) 19:00 oraz 3.10 (sob.) o 12:00 i 19:00.'),
  block('Choreografia Jeana Coralliego i Jules\'a Perrota, realizacja baletu Maina Gielgud. Gielgud oparła się na dwudziestowiecznej linii Petipy, sięgając do rekonstrukcji Nikołaja Siergiejewa i Antona Dolina - czyli do tej samej drogi, którą balet wrócił z Rosji na zachód.'),
  block('Libretto Gautier i Vernoy de Saint-Georges, muzyka Adolphe\'a Adama, dyryguje Alexei Baklan. Scenografia i kostiumy Andrzej Kreutz Majewski w adaptacji Szabłowskiej i Rott, reżyseria świateł Maciej Igielski. Dwie godziny pięć minut: pięćdziesiąt minut pierwszego aktu, dwadzieścia pięć przerwy, pięćdziesiąt drugiego.'),
  block('Warto wiedzieć, że obsady się nie powtarzają. 24 września (czwartek) Giselle tańczy Chinara Alizade, Alberta - Vladimir Yaroshenko, Mirtę - Yana Shtanhei, Hilariona - Kristóf Szabó. Natomiast w niedzielę 27 września wszystkie cztery partie obsadzone są inaczej: Jaeeun Jung, Ryota Kitai, Vanessa Vestita i Paweł Koncewoj.'),
  obraz(A.warszawa, 'Chinara Alizade i Vladimir Yaroshenko w warszawskiej „Giselle" - akt drugi. fot. Ewa Krasucka / Teatr Wielki - Opera Narodowa'),

  h3('Gdańsk: akt pierwszy nad morzem, akt drugi w 1841 roku'),
  block('Opera Bałtycka. Terminy: 26.11 (czw.) 19:00, 27.11 (pt.) 19:00, 28.11 (sob.) 18:00 oraz 29.11 (niedz.) 17:00.'),
  block('Najbardziej radykalna z trzech inscenizacji, w repertuarze od premiery 13 października 2018 roku. Akt pierwszy, przygotowany przez Emila Wesołowskiego, przenosi rzecz w realia współczesne: Giselle jest kelnerką w nadmorskiej miejscowości, Albert turystą zaręczonym z warszawską celebrytką, a bohaterka nie umiera z rozpaczy, tylko tonie w morzu.'),
  block('Akt drugi przygotowali Izabela Sokołowska-Boulton i Wojciech Warszawski, opierając się na oryginalnej choreografii Coralliego i Perrota. To rozwiązanie, które wygląda na niekonsekwencję, a jest tezą: wilisy są jedynym elementem tej opowieści, który nie potrzebuje uwspółcześnienia. Zdrada, wstyd i zemsta zza grobu działają tak samo w 1841 roku i dziś.'),
  block('Kierownictwo muzyczne Tomasz Tokarczyk, scenografia i reżyseria świateł Olga Skumiał, kostiumy Marta Fiedler. Około dwóch godzin z przerwą. W obsadach Maria Kielan i Gwenllian Davies jako Giselle, Gento Yoshimoto i Ruaidhri Maguire jako Albert, Filip Michalak i Michał Zelent jako Hilarion.'),
  obraz(A.gdansk, 'Gdańska „Giselle" - akt pierwszy przeniesiony nad morze. fot. Krzysztof Mystkowski / KFP / Opera Bałtycka'),

  h3('Łódź: autorskie opracowanie'),
  block('Teatr Wielki w Łodzi. Terminy: 24.04.2027 (sob.) 18:30 oraz 25.04.2027 (niedz.) 17:00.'),
  block('Najmłodsza z trzech produkcji - premiera odbyła się 12 października 2024 roku. Choreografię opracowała autorsko, według Coralliego i Perrota, Zofia Rudnicka. Kierownictwo muzyczne Andriy Yurkevych, scenografia i kostiumy Tatiana Kwiatkowska, reżyseria świateł - podobnie jak w Warszawie - Maciej Igielski. Baletmistrzyni pary solowej Renata Smukała, asystentki choreografa Beata Brożek-Grabarczyk i Agata Jankowska-Dobrowolska. Około dwóch godzin dziesięciu minut z przerwą.'),
  block('Dla Łodzi to trzecia w historii premiera tego tytułu. Wcześniejsze odbyły się w 1979 roku w choreografii Jarosława Piaseckiego i w 2003 w choreografii Roberta Streinera.'),
  obraz(A.lodz, 'Łódzka „Giselle" w opracowaniu Zofii Rudnickiej - akt pierwszy. fot. Joanna Miklaszewska / Teatr Wielki w Łodzi'),

  h2('Dlaczego tę rolę uważa się za egzamin'),
  block('„Giselle" bywa nazywana testem, przez który musi przejść każda balerina - i nie chodzi o technikę samą w sobie.'),
  block('Balet żąda dwóch zupełnie różnych rzeczy w ciągu jednego wieczoru. Akt pierwszy jest aktorski: wiejska dziewczyna, zauroczenie, odkrycie oszustwa i słynna scena szaleństwa, jedna z najtrudniejszych scen dramatycznych w całym klasycznym repertuarze. Akt drugi jest jego przeciwieństwem - to „biały akt", w którym wszystko sprowadza się do czystości stylu, lekkości i wrażenia bezcielesności. Ta sama tancerka musi w antrakcie przestać być człowiekiem.'),
  obraz(A.rola, 'Scena szaleństwa, jedna z najtrudniejszych scen dramatycznych klasycznego repertuaru. Mai Kageyama w warszawskiej „Giselle". fot. Ewa Krasucka / Teatr Wielki - Opera Narodowa'),
  block('Ciekawostka na koniec, z gatunku tych, które trudno potem zapomnieć: Adolphe Adam, kompozytor „Giselle", jest w świecie znany przede wszystkim z zupełnie innego utworu. Sześć lat po premierze tego baletu napisał kolędę „Cantique de Noël" - czyli „O Holy Night".'),
  block('Pełne repertuary wszystkich polskich teatrów operowych i baletowych znajdziecie jak zawsze na swiatbaletu.pl.'),
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
    okladka:  await wgraj('giselle-okladka-karta.jpg'),
    warszawa: await wgraj('giselle-warszawa.jpg'),
    gdansk:   await wgraj('giselle-gdansk.jpg'),
    lodz:     await wgraj('giselle-lodz.jpg'),
    rola:     await wgraj('giselle-rola.jpg'),
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
      alt: 'Wilisy w drugim akcie „Giselle" - Polski Balet Narodowy',
      zrodlo: 'fot. Ewa Krasucka / Teatr Wielki - Opera Narodowa',
    },
    trescGlowna: body,
    autor: 'Redakcja Świat Baletu',
    dataPublikacji: new Date().toISOString(),
    featured: true,
    czasCzytania,
    tagi: ['Giselle', 'balet romantyczny', 'historia baletu', 'Polski Balet Narodowy', 'Opera Bałtycka', 'Teatr Wielki w Łodzi', 'Adolphe Adam', 'Coralli', 'Perrot'],
    bannerGlowna: false,
  }

  const dlugie = JSON.stringify(doc).match(/[—–]/g)
  if (dlugie) { console.error('✗ Zostały długie myślniki:', dlugie.length); process.exit(1) }

  const existing = await client.fetch('*[_type=="artykul" && slug.current==$slug][0]{_id}', { slug: SLUG })
  if (existing?._id) {
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
