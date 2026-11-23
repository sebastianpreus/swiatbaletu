/**
 * create-artykul-konwinski.mjs
 * Jubileusz Henryka Konwińskiego - 90. urodziny i 70-lecie pracy artystycznej.
 * Źródło: Google Drive, "2026-11-23 - Jubileusz Henryka Konwińskiego (artykuł + post IG)".
 * Materiały (program koncertu i spektaklu) przekazała Izabela Sokołowska-Boulton.
 *
 * CO SPRAWDZONE U ŹRÓDEŁ 23.11.2026:
 *  - Data urodzenia 19 listopada 1936, Poznań. To nie jest szczegół: na tej
 *    dacie stoi cała konstrukcja "trzy dni". Brief miał ją z naszej notatki
 *    z 18.10 za bytom.pl, bo taniecPOLSKA i Opera Śląska podają sam rok.
 *    Potwierdzona niezależnie - Dziennik Zachodni i Polskie Radio Dwójka
 *    pisały o dziewięćdziesiątych urodzinach 19 listopada.
 *  - Terminy w Bytomiu zgodne z naszym repertuarem: "Don Kichot" w piątek
 *    20.11 o 18:00, koncert w sobotę 21.11 o 18:00.
 *  - Program koncertu, wykonawcy, dyrygent, prowadzenie, czas 2 h 20 min
 *    z przerwą, "Ad Zenithum" Wiktora Perdka do muzyki Kilara, Sibeliusa
 *    i Barbera - opera-slaska.pl, karta wydarzenia.
 *  - Conrad Drzewiecki urodzony 14 października 1926, więc rok 2026 jest
 *    rokiem jego stulecia - sprawdzone przy okazji artykułu o Światowym Dniu
 *    Baletu. Zbieg okoliczności z briefu się broni.
 *  - Liczba realizacji: taniecPOLSKA "ponad trzysta", Opera Śląska "około
 *    300". W tekście obie wersje, zgodnie z briefem - nie upraszczamy.
 *  - Nazwa wydarzenia: karta Opery Śląskiej ma w nagłówku "Premiera:
 *    21 listopada", a w treści "koncert". Piszemy wyłącznie "koncert".
 *  - Liliana Kowalska: program spektaklu rozstrzyga spór, który wisiał od
 *    18 października. Inscenizacja i choreografia "Don Kichota" - Konwiński;
 *    Kowalska odpowiada za opracowanie choreografii "Driad" i przekaz
 *    pas de deux według Petipy. To nie jest współautorstwo całości.
 *
 * DOPISANE WOBEC BRIEFU:
 *  - Link do naszego kwietniowego tekstu z Orędziem na Międzynarodowy Dzień
 *    Tańca, które Konwiński napisał w tym roku. Brief o tym nie wiedział,
 *    a to najlepszy dowód tezy z ostatniej sekcji: człowiek jest w czasie
 *    teraźniejszym, nie w archiwum.
 *  - Godzina "Don Kichota" (18:00), za naszym repertuarem.
 *
 * SPRAWDZONE I BEZ SKUTKU:
 *  - Brief prosił, żeby poprawić ewentualne nasze wcześniejsze teksty, gdyby
 *    przypisywały Lilianie Kowalskiej współautorstwo choreografii "Don
 *    Kichota". Przejrzałem wszystkie wzmianki o Kowalskiej i Konwińskim
 *    w Sanity - nigdzie takiego zdania nie ma. Nic do poprawienia.
 *
 * CZEGO W TEKŚCIE NIE MA I DLACZEGO:
 *  - Relacji z samego wieczoru. Nie mieliśmy nikogo na sali, a program mówi,
 *    co grano, nie jak to wypadło. Tekst jest napisany po fakcie i w czasie
 *    przeszłym, ale nie udaje recenzji.
 *  - Związku między tytułem "Ad montes" ("w góry") a tym, że Konwiński jest
 *    Honorowym Obywatelem Lądka-Zdroju. Brief sam oznaczył to jako kuszące,
 *    lecz niepotwierdzone. Gdyby teatr potwierdził, warto dopisać.
 *
 * ZDJĘCIE: ŚWIADOMIE BEZ PORTRETU. Nie istnieje zdjęcie Konwińskiego na
 * wolnej licencji - sprawdzone 23.11.2026: Wikimedia Commons (siedem trafień
 * na "Konwiński", wszystkie dotyczą Zbigniewa Konwińskiego, polityka), polska
 * Wikipedia (hasło jest, zdjęcia nie ma - co samo w sobie przesądza sprawę),
 * NAC i Polona (nic), bytom.pl (serwis odrzuca zapytania, HTTP 403).
 * Jedyny portret, na taniecPOLSKA.pl, jest podpisany "fot. Karol Fatyga"
 * i nie ma podanej licencji; zakładka "Regulaminy publikacji" w tym serwisie
 * to pusta strona "w budowie". Brak zakazu to nie jest zgoda.
 * Zdjęcia z jego spektakli należą do Opery Śląskiej, która w stopce ma wprost
 * zakaz kopiowania zdjęć bez zgody autora - ta droga jest zamknięta tak samo.
 *
 * Dlatego okładka nie przedstawia ani jego, ani jego spektaklu: to kurtyna
 * teatralna z Unsplash (fot. Rob Laughter, darmowa licencja - sprawdzone,
 * że nie jest to płatny Unsplash+). Kadr niczego nie udaje, a nazwisko niesie
 * tekst na grafice.
 *
 * DO ZROBIENIA: Izabela Sokołowska-Boulton pyta Operę Śląską o zdjęcia
 * z koncertu. Gdy przyjdą, podmienić okładkę i dopisać akapit o tym, jak
 * wieczór wypadł - tego w tekście nie ma, bo nie mieliśmy nikogo na sali.
 *
 * OKŁADKA: images/konwinski-okladka.jpg, zrobiona z
 *   scripts/karta-tytulowa.py <katalog> <kurtyna 16:9> <wynik> \
 *     "" "Henryk Konwiński" "90 lat życia, 70 lat na scenie" 0.58 0 1.0 0.45
 * Kadr przycięty od dołu, bo tam jest ciemny proscenium; płytki pod tekstem
 * zamiast przyciemniania całości, bo czerwień kurtyny jest bardzo jasna.
 */
import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const SLUG = 'henryk-konwinski-jubileusz-70-lat-na-scenie'

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
const blockZLinkiem = (przed, tekstLinku, href, po) => {
  const k = key()
  return {
    _type: 'block', _key: key(), style: 'normal',
    markDefs: [{ _key: k, _type: 'link', href }],
    children: [span(przed), span(tekstLinku, [k]), span(po)],
  }
}

const TYTUL = 'Siedemdziesiąt lat na scenie. Opera Śląska dała Henrykowi Konwińskiemu trzy dni'

const ZAJAWKA =
  'W miniony weekend Bytom obchodził podwójny jubileusz swojego choreografa: dziewięćdziesiąte urodziny ' +
  'i siedemdziesiąt lat pracy artystycznej. W czwartek przypadły urodziny, w piątek teatr zagrał jego ' +
  '„Don Kichota", w sobotę odbył się koncert, który skończył się choreografią o jego własnym życiu.'

const tresc = [
  h2('Trzy dni'),
  block('Henryk Konwiński urodził się 19 listopada 1936 roku w Poznaniu. W czwartek skończył dziewięćdziesiąt lat.'),
  block('Dzień później, w piątek o 18:00, Opera Śląska zagrała „Don Kichota" Ludwiga Minkusa - balet w trzech aktach i pięciu obrazach, libretto Mariusa Petipy według Cervantesa, w inscenizacji i choreografii Konwińskiego. Opracowanie choreografii „Driad" i przekaz pas de deux według Petipy przygotowała Liliana Kowalska.'),
  block('W sobotę 21 listopada o 18:00 odbył się koncert jubileuszowy. Nosił tytuł „Ad montes, ad vitam, ad saltandum" - w górę, ku życiu, do tańca.'),

  h2('Co zagrano'),
  block('Wieczór trwał dwie godziny dwadzieścia z przerwą i był przeglądem tego, czym Konwiński zajmował się przez siedemdziesiąt lat. Fragmenty baletów: „Don Kichot", „Dziadek do orzechów", „Romeo i Julia", a do tego „Faust" i „Halka". „Krzesany" Wojciecha Kilara. „Czardasz" Johanna Straussa syna. „Marsz triumfalny" z „Aidy" Verdiego.'),
  block('Śpiewali Anna Borucka, Marta Huptas, Anna Wiśniewska-Schoppa i Łukasz Załęski. Grali Chór, Balet i Orkiestra Opery Śląskiej pod dyrekcją Piotra Mazurka. Koncert prowadziła Katarzyna Sanocka.'),
  block('Punktem, dla którego warto było przyjechać, było jednak „Ad Zenithum" - choreograficzna opowieść o życiu jubilata, w choreografii Wiktora Perdka, do muzyki Kilara, Sibeliusa i Barbera. Choreograf, który przez siedemdziesiąt lat opowiadał cudze historie ruchem, dostał na koniec swoją własną, opowiedzianą przez kogoś innego.'),

  h2('Skąd się wziął'),
  block('Konwiński jest absolwentem warszawskiej szkoły baletowej. Na scenie zadebiutował w 1956 roku w Operze Poznańskiej. Jego mentorem był Conrad Drzewiecki - i to jest zbieg okoliczności, którego nie da się przeoczyć, bo w tym samym roku, 14 października, minęło sto lat od urodzin Drzewieckiego. Uczeń pracuje dalej w roku stulecia mistrza.'),
  block('Solistą został w 1963 roku, rolą Mercutia w „Romeo i Julii" w choreografii Witolda Borkowskiego. Tańczył obok Olgi Sawickiej, Barbary Karczmarewicz, Anny Deręgowskiej, Władysława Milona i Edmunda Kopruckiego. Pracował z Teresą Kujawą, Stanisławem Miszczykiem, Eugeniuszem Paplińskim i Feliksem Parnellem.'),
  block('Jako choreograf zadebiutował w 1965 roku, i to nie w operze, tylko w studenckim Teatrze Nurt w Poznaniu - razem z reżyserem Januszem Nyczakiem zrobił światową prapremierę „Operetki" Witolda Gombrowicza.'),
  block('W 1971 roku przyjechał do Bytomia na zaproszenie Napoleona Siessa, ówczesnego dyrektora Opery Śląskiej. Zrealizował tam „Stworzenie świata" według rysunków Jeana Effela, którego polska prapremiera odbyła się w 1974 roku - jego pierwszy pełnospektaklowy balet.'),
  block('Był stypendystą Ballet du XXe Siècle Maurice\'a Béjarta w Brukseli, Het Nationale Ballet w Amsterdamie i Nederlands Dans Theater pod kierunkiem Jiříego Kyliána w Hadze. Prowadził warsztaty w Addis Abebie i pracował w Hawanie.'),

  h2('Ile tego jest'),
  block('Portal taniecPOLSKA.pl, który uczynił go listopadową Postacią miesiąca, pisze o ponad trzystu realizacjach (Opera Śląska podaje „około 300"). Opera, balet klasyczny, taniec współczesny, musical, operetka, teatr dramatyczny, teatr lalek, telewizja i film - choreografię do „Strachów" Stanisława Lenartowicza z 1979 roku i do „Szkoda twoich łez" z 1983 roku zrobił on, ruch sceniczny w „Cudzie mniemanym" Olgi Lipińskiej z 2006 roku również.'),
  block('Jest jednym z czworga choreografów, którzy stworzyli międzypokoleniową choreografię do IX Symfonii Beethovena w Teatrze Wielkim w Poznaniu - obok Drzewieckiego, Teresy Kujawy i Emila Wesołowskiego.'),
  block('Odznaczenia i nagrody: Srebrny Medal „Zasłużony Kulturze Gloria Artis" (2011), Statuetka Terpsychory, nagroda specjalna Sekcji Tańca i Baletu ZASP (2014), nagroda Marszałka Województwa Śląskiego w dziedzinie choreografii i tańca (2016), nagroda Prezydenta Miasta Bytomia (2016), nagroda Prezydenta Miasta Katowice (2025), Teatralna Nagroda Muzyczna im. Jana Kiepury, Złoty Krzyż Zasługi, Krzyż Kawalerski i Krzyż Oficerski Orderu Odrodzenia Polski, Medal Miasta Bytomia. Jest Honorowym Obywatelem Bytomia i Lądka-Zdroju.'),
  block('Od 2005 roku sala baletowa Opery Śląskiej nosi jego imię. Jest też inicjatorem i patronem Międzypokoleniowego Przeglądu Choreograficznego „Horyzonty".'),

  h2('I dalej'),
  block('Najmocniejsze w tym jubileuszu nie są liczby, tylko czas teraźniejszy. Konwiński nie jest choreografem, którego teatr wspomina - jest choreografem, którego teatr gra. Jego „Don Kichota" Opera Śląska pokazała dzień przed koncertem, nie jako archiwalną ciekawostkę, tylko jako pozycję repertuarową.'),
  blockZLinkiem('Siedem miesięcy przed tym jubileuszem napisał polskie Orędzie na Międzynarodowy Dzień Tańca. Publikowaliśmy je w całości ', 'tutaj', 'https://swiatbaletu.pl/artykuly/dzien-tanca-2026', '.'),
  block('Siedemdziesiąt lat pracy, a tytuł wieczoru był w czasie przyszłym: w górę, ku życiu, do tańca.'),
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
  console.log('Wgrywam okładkę:')
  const okladka = await wgraj('konwinski-okladka.jpg')

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
      alt: 'Czerwona kurtyna teatralna na pustej scenie',
      zrodlo: 'fot. Rob Laughter / Unsplash',
    },
    trescGlowna: tresc,
    autor: 'Redakcja Świat Baletu',
    dataPublikacji: new Date().toISOString(),
    featured: true,
    czasCzytania,
    tagi: [
      'Henryk Konwiński', 'Opera Śląska', 'Bytom', 'jubileusz', 'choreografia',
      'Conrad Drzewiecki', 'Don Kichot', 'Wiktor Perdek',
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
