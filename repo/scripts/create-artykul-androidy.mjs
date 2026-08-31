/**
 * create-artykul-androidy.mjs
 * Tworzy recenzję „Androidy" w Sanity z galerią zdjęć z folderu images/Andrroidy
 * Uruchomienie: node scripts/create-artykul-androidy.mjs
 */

import { createClient } from '@sanity/client'
import { readFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '..', '.env.local')
const env = {}
readFileSync(envPath, 'utf8').split('\n').forEach(l => {
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

const IMAGES_DIR = join(__dir, '..', '..', 'images', 'Andrroidy')

async function uploadLocalImage(filename, label) {
  console.log(`  ↑ Uploading: ${filename}`)
  const filepath = join(IMAGES_DIR, filename)
  const buffer = readFileSync(filepath)
  const ext = filename.split('.').pop().toLowerCase()
  const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
  const asset = await client.assets.upload('image', buffer, {
    filename,
    contentType: mimeMap[ext] || 'image/jpeg',
  })
  console.log(`  ✓ ${label} → ${asset._id}`)
  return asset
}

const key = () => Math.random().toString(36).slice(2, 10)

function block(text, style = 'normal') {
  return {
    _type: 'block', _key: key(), style,
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
    markDefs: [],
  }
}

function h2(text) { return block(text, 'h2') }

function imageBlock(asset, alt) {
  return {
    _type: 'image', _key: key(),
    asset: { _type: 'reference', _ref: asset._id },
    alt,
  }
}

async function main() {
  console.log('\n🎭 Tworzenie recenzji: „Androidy" – neo-noir w Operze Narodowej\n')

  // 1. Upload Hero jako zdjęcie główne artykułu
  console.log('📷 Upload zdjęcia Hero...')
  const heroAsset = await uploadLocalImage('Hero.jpg', 'Hero')

  // 2. Upload zdjęć galerii (wszystkie poza Hero.jpg)
  console.log('\n📷 Upload zdjęć galerii...')
  const galleryFiles = readdirSync(IMAGES_DIR)
    .filter(f => f !== 'Hero.jpg' && /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort()

  const galleryAssets = []
  for (const filename of galleryFiles) {
    const asset = await uploadLocalImage(filename, filename)
    galleryAssets.push(asset)
  }

  // 3. Buduj treść artykułu
  console.log('\n📝 Budowanie treści...')

  const tresc = [
    // --- O ŚWIECIE SPEKTAKLU ---
    h2('O świecie spektaklu'),
    block('Bondara sięga po dystopijny pejzaż wpisany w cyberpunkową tradycję: planeta wyniszczona ekologicznie, koncern technologiczny ÆtherTech (na czele z Elonem Reventlovem) produkujący androidy, podział na ludzi i roboty. Postacie centralne – Łowca, jego żona Nina, doktor Ræ – balansują między tymi dwoma światami.'),
    block('Najciekawsza jest jednak warstwa nazw. Po stronie androidów Bondara stawia ich liderów: R_0Y „Castora", POL_3 „Polluxa", SØF_1A „Sophię", ÆMECA_3 „Amecę" i AIDÆ „Aidę". Te nazwy prowadzą podwójną grę. Castor i Pollux to mityczni bliźniacy – jeden śmiertelny, drugi nie. Sophia i Ameca to z kolei prawdziwe humanoidy z laboratoriów, twarze, które każdy widział w sieci. Spektakl jednym gestem łączy mit i wiadomości z ostatniego tygodnia – i to jest dokładnie ten typ detalu, który odróżnia przemyślaną pracę od efektownej zapowiedzi.'),
    block('Literackie filary Bondary widać wyraźnie: proza Asimova i Dicka, ale też Golem, „Frankenstein" Mary Shelley, „Terminator". W warstwie wizualnej – „Łowca androidów" Ridleya Scotta i cała estetyka kina neo-noir. Spektakl nosi tytuł „Androidy" i to roboty humanoidalne oglądamy przez większość wieczoru. Ale choreograf w wywiadach mówi wprost, że to nie jest opowieść o maszynach, tylko o nas.'),

    // --- MUZYKA ---
    h2('Muzyka'),
    block('Muzyka grana na żywo od pierwszego taktu wprowadza w świat, który przytłacza i budzi obawy. Momentami zapada cisza – żeby po chwili wyrwać widza i rzucić go w wir wydarzeń. Kiedy indziej wybrzmiewa mieszanka smutku i spokoju: w scenach miłosnych, które są jak okruchy nadziei i człowieczeństwa w świecie tak wyobcowanym i opanowanym przez technologię. Prowadzi przez spektakl – buduje napięcie, daje poczucie ciężkości otaczającej rzeczywistości.'),
    block('Orkiestrę dopełnia partia wokalna solistki – to nie śpiew ze słowami, lecz wokaliza: przeciągłe, prowadzone na samogłoskach dźwięki, które wplatają się między instrumenty i harmonizują z nimi. Ten głos działa jak kolejna barwa orkiestry, a zarazem – w świecie tak zmechanizowanym – wnosi do muzyki wyraźnie ludzki akcent.'),
    block('Partyturę napisał na zamówienie Przemysław Zych, kompozytor i pedagog Uniwersytetu Muzycznego Fryderyka Chopina. Orkiestrą Teatru Wielkiego – Opery Narodowej dyryguje Marta Kluczyńska.'),

    // --- CHOREOGRAFIA ---
    h2('Choreografia'),
    block('Bondara mówi: „W XXI wieku balet jest zjawiskiem, przez które przenika wiele prądów. Jeżeli wykorzystuję taniec na pointach, staram się zrobić coś, czego jeszcze nie widziałem". W „Androidach" trzyma się klasycznej techniki, ale dokłada do niej słownik przekraczający granice stylów.'),
    block('Najmocniej działa kontrast dwóch rodzajów ruchu. Androidy tańczą jak roboty – precyzyjnie, szybko, bez tego, co w ruchu jest ludzkie. Łowca i jego żona poruszają się inaczej: ich taniec jest dynamiczny, ale płynny, pełen emocji. To rozróżnienie nie jest dekoracją – to ono niesie temat spektaklu. Granica człowieczeństwa zostaje narysowana ciałem, zanim padnie jakiekolwiek pytanie.'),

    // --- BONDARA ---
    h2('„Androidy" w drodze Bondary'),
    block('Robert Bondara zaczynał jako tancerz Polskiego Baletu Narodowego, potem przeszedł na stronę choreografii – najpierw miniatury kameralne („Kiedy ty, a kiedy ja…" do muzyki Pawła Szymańskiego, „Bramy ogrodu"). W 2011 r. w bydgoskiej Operze Nova stworzył pełnowymiarowy „Zniewolony umysł" wg Czesława Miłosza, do muzyki Philipa Glassa i Wojciecha Kilara. Potem była „Persona" dla PBN.'),
    block('W tej linii „Androidy" nie są wyłomem – są konsekwencją. Bondara od początku traktuje literaturę jako punkt wyjścia, a nie ozdobnik, i raz po raz wraca do wielkich, niewygodnych pytań, których nie zamyka jedną tezą. „Androidy" to po prostu kolejny rozdział tej samej rozmowy.'),

    // --- WIZUAL ---
    h2('Scenografia, projekcje, ruch sceny'),
    block('Najmocniejszy obraz spektaklu rodzi się na opuszczanych konstrukcjach scenografii Diany Marszałek. Surowe, proste – i właśnie dzięki tej surowości wiarygodne jako świat po katastrofie. Bondara i Kamil Polak, autor projekcji wideo, nie traktują ich jako tła: na konstrukcjach pojawiają się fragmenty kodu i elektroniczne obrazy, które nieustannie przypominają, w jakim świecie dzieje się akcja. Scenografia tu nie stoi – ona mówi.'),
    block('Drugim narzędziem jest obrotowa podłoga. Daje poczucie ciągłego ruchu, akcji jak w filmie: tancerze pozostają w ruchu, nie zmieniając miejsca na scenie. Kiedy indziej trwają w bezruchu, chowając się w mroku. Nad tym wszystkim pracują światła Macieja Igielskiego – podkreślają to, co najważniejsze, ale też same budują scenografię, wycinają przestrzeń tam, gdzie nie ma żadnej ściany.'),
    block('Kostiumy Martyny Kander domykają całość – utrzymane w ciemnym, dystopijnym rejestrze, który nie pozwala zapomnieć, gdzie jesteśmy.'),

    // --- PYTANIA ---
    h2('Co Bondara pyta – i czy odpowiada'),
    block('Bondara w wywiadzie dla „Kultury Liberalnej" powiedział wprost: „W tym spektaklu stawiamy dużo pytań, na które sam nie znajduję odpowiedzi. I chyba nawet nie chcę ich znaleźć". To wybór, który warto docenić. Wielu twórców skoczyłoby w gotową tezę – albo androidy są bestią, albo zbawieniem. „Androidy" zostają w pytaniu: czy sztuczny twór może być świadom swojego istnienia? Czy granica człowieczeństwa leży w empatii? Co zrobi z nią korporacja, której zależy na krótkoterminowych zyskach?'),
    block('W finałowych scenach Bondara odwraca pytanie – i kieruje je nie do androida, tylko do widza.'),

    // --- PODSUMOWANIE ---
    h2('Podsumowanie'),
    block('„Androidy" to dla Polskiego Baletu Narodowego rzecz osobna w kilku wymiarach. To prapremiera z nową, oryginalną muzyką polskiego kompozytora pisaną pod konkretną choreografię – co w polskim balecie jest raczej rzadkością niż regułą. To także najdalsze odejście od żelaznego repertuaru, jakie zespół zrobił od dawna – i pierwsza próba mówienia językiem tańca o sztucznej inteligencji wprost, nie poprzez metaforę.'),
    block('Czy to się udało? „Androidy" wytrzymują to, czego się od nich wymaga – i jeszcze coś dorzucają. Bondara nie udaje, że wie, dokąd zmierzamy; zamiast tego buduje spektakl, który zadaje właściwe pytania i ma odwagę zostawić je otwarte. To rzadsze, niż się wydaje – i trudniejsze. Spektakl można zobaczyć do 17 maja na Sali Moniuszki, a we wrześniu wraca w nowym sezonie.'),

    // --- GALERIA ---
    h2('Galeria'),
    ...galleryAssets.map(asset => imageBlock(asset, 'fot. social media Teatru Wielkiego – Opery Narodowej')),

    // --- ŹRÓDŁO ZDJĘĆ ---
    block('Zdjęcia: social media Teatru Wielkiego – Opery Narodowej'),
  ]

  // 4. Utwórz dokument
  console.log('\n📤 Tworzenie dokumentu w Sanity...')

  const doc = {
    _type: 'artykul',
    tytul: '„Androidy" – neo-noir w Operze Narodowej',
    slug: { _type: 'slug', current: 'androidy-neo-noir-w-operze-narodowej' },
    kategoria: 'Recenzja',
    zajawka: '10 maja 2026 r. Polski Balet Narodowy pokazał Warszawie „Androidy" – dwuaktowy balet w choreografii Roberta Bondary do oryginalnej muzyki Przemysława Zycha. Bondara nie udaje, że ma odpowiedzi. Stawia pytania – i to one, a nie fabuła, są właściwym tematem spektaklu.',
    zdjecie: {
      _type: 'image',
      asset: { _type: 'reference', _ref: heroAsset._id },
      alt: '„Androidy" – Polski Balet Narodowy, Teatr Wielki Opera Narodowa',
    },
    autor: 'Redakcja Świat Baletu',
    dataPublikacji: '2026-05-12T10:00:00.000Z',
    featured: false,
    czasCzytania: 5,
    tagi: ['Androidy', 'Robert Bondara', 'Polski Balet Narodowy', 'Teatr Wielki', 'prapremiera', 'recenzja'],
    trescGlowna: tresc,
  }

  const result = await client.create(doc)
  console.log(`\n✅ Artykuł utworzony!`)
  console.log(`   ID:  ${result._id}`)
  console.log(`   URL: https://swiatbaletu.vercel.app/artykuly/${doc.slug.current}`)
  console.log(`   Studio: https://nri4izo1.sanity.studio/structure/artykul;${result._id}\n`)
}

main().catch(err => {
  console.error('\n❌ Błąd:', err.message)
  process.exit(1)
})
