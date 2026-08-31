/**
 * create-artykul-nabory.mjs
 * Tworzy artykuł „Nabory do polskich szkół baletowych 2026/2027" w Sanity
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
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

const key = () => Math.random().toString(36).slice(2, 10)

function block(text, style = 'normal') {
  return {
    _type: 'block', _key: key(), style,
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
    markDefs: [],
  }
}

function blockMixed(parts) {
  return {
    _type: 'block', _key: key(), style: 'normal',
    children: parts.map(p => ({
      _type: 'span', _key: key(),
      text: p.text,
      marks: p.bold ? ['strong'] : [],
    })),
    markDefs: [],
  }
}

function h2(text) { return block(text, 'h2') }

const tresc = [
  block('Polska ma pięć państwowych ogólnokształcących szkół baletowych, kształcących tancerzy od poziomu szkoły podstawowej przez dziewięć lat. Rekrutacja do każdej z nich przebiega niezależnie, z własnymi terminami i wymaganiami. Jeśli myślisz o zapisaniu dziecka - lub sam/-a rozważasz ten krok - oto aktualny stan naborów.'),

  h2('Warszawa - rekrutacja uzupełniająca do klasy I'),
  blockMixed([
    { text: 'Ogólnokształcąca Szkoła Baletowa im. Romana Turczynowicza w Warszawie przeprowadziła główny egzamin do klasy I w kwietniu. Dla kandydatów, którzy nie zdążyli - trwa właśnie ' },
    { text: 'rekrutacja uzupełniająca do klasy I', bold: true },
    { text: '. Dokumenty do klas II-VIII szkoła przyjmuje ' },
    { text: 'do 18 maja', bold: true },
    { text: ', a egzaminy na te klasy startują ' },
    { text: 'od 2 czerwca', bold: true },
    { text: '.' },
  ]),
  block('Wymagane zaświadczenia: od lekarza pierwszego kontaktu oraz od ortopedy lub lekarza sportowego. Szczegóły: gov.pl/web/osbwarszawa'),

  h2('Poznań - jeszcze jeden termin egzaminu'),
  blockMixed([
    { text: 'Ogólnokształcąca Szkoła Baletowa im. Olgi Sławskiej-Lipczyńskiej w Poznaniu prowadzi nabór z kilkoma terminami egzaminów - to duże ułatwienie dla rodzin z całej Polski. Dokumenty przyjmowane są ' },
    { text: 'do 12 czerwca', bold: true },
    { text: '.' },
  ]),
  blockMixed([
    { text: 'Ostatni termin egzaminu do ' },
    { text: 'klasy I', bold: true },
    { text: ': ' },
    { text: '13 czerwca, godz. 9:00', bold: true },
    { text: '. Na ten sam dzień zaplanowano egzaminy do klas II-III (godz. 9:00) oraz IV-IX (godz. 11:00). Do klasy I wymagane jest ukończenie klasy III szkoły podstawowej.' },
  ]),
  block('Szczegóły: gov.pl/web/osbpoznan'),

  h2('Gdańsk - kontakt w celu potwierdzenia terminów'),
  block('Ogólnokształcąca Szkoła Baletowa im. Janiny Jarzynówny-Sobczak w Gdańsku miała zaplanowane egzaminy na 9 i 15 maja. Warto skontaktować się ze szkołą, by sprawdzić, czy przewidziany jest dodatkowy termin: tel. 58 341 49 13, e-mail: sekretariat@szkolabaletowa.pl'),
  blockMixed([
    { text: 'Szkoła ma za sobą intensywny sezon - w kwietniu zorganizowała ' },
    { text: 'XXIV Ogólnopolski Konkurs Tańca im. Wojciecha Wiesiołłowskiego', bold: true },
    { text: ', a jej uczniowie zdobyli nagrody na międzynarodowym festiwalu „Riga Springs 2026".' },
  ]),

  h2('Łódź - drzwi otwarte 26 maja'),
  blockMixed([
    { text: 'Ogólnokształcąca Szkoła Baletowa im. Feliksa Parnella w Łodzi ogłosiła nabór na rok 2026/2027, ale szczegółowe terminy egzaminów nie są opublikowane na stronie. Natomiast ' },
    { text: '26 maja (wtorek), godz. 14:00-17:00', bold: true },
    { text: ', szkoła zaprasza na ' },
    { text: 'Drzwi Otwarte i Koncert z okazji Dnia Matki', bold: true },
    { text: ' - dobra okazja, żeby obejrzeć szkołę od środka i zapytać o rekrutację bezpośrednio.' },
  ]),
  block('Kontakt: 42 613 10 20, gov.pl/web/osblodz'),

  h2('Bytom - kontakt z sekretariatem'),
  block('Ogólnokształcąca Szkoła Baletowa im. Ludomira Różyckiego w Bytomiu również prowadzi nabór, jednak terminy egzaminów nie są publicznie dostępne w formie tekstowej. Kontakt: 32 787 01 01, Facebook: @osb.bytom1'),

  h2('Kiedy zacząć myśleć o szkole baletowej?'),
  block('Do klasy I przyjmowane są dzieci po ukończeniu klasy III szkoły podstawowej - a więc mające zazwyczaj 9-10 lat. Egzaminy sprawdzają predyspozycje fizyczne (proporcje, gibkość, koordynacja, muzykalność), a nie wcześniejsze doświadczenie taneczne. Nie trzeba wcześniej uczyć się baletu, żeby zdać - szkoły szukają potencjału, nie gotowego tancerza.'),
  block('Ważne: zaświadczenia lekarskie od ortopedy lub lekarza sportowego są wymagane niemal wszędzie - warto je zorganizować z wyprzedzeniem.'),
  block('Informacje zebrane na podstawie oficjalnych stron szkół w maju 2026 r. Przed złożeniem dokumentów zalecamy bezpośredni kontakt ze szkołą w celu potwierdzenia aktualnych terminów.'),
]

const doc = {
  _type: 'artykul',
  tytul: 'Nabory do polskich szkół baletowych 2026/2027 - co warto wiedzieć',
  slug: { _type: 'slug', current: 'nabory-do-polskich-szkol-baletowych-2026-2027' },
  kategoria: 'Aktualności',
  zajawka: 'Rekrutacja do państwowych szkół baletowych trwa. Poznaj aktualne terminy egzaminów, dni otwartych i składania dokumentów we wszystkich pięciu szkołach - w Warszawie, Poznaniu, Gdańsku, Łodzi i Bytomiu.',
  autor: 'Redakcja Świat Baletu',
  dataPublikacji: '2026-05-17T10:00:00.000Z',
  featured: false,
  czasCzytania: 3,
  tagi: ['szkoła baletowa', 'rekrutacja', 'nabór', 'balet', 'edukacja'],
  trescGlowna: tresc,
}

console.log('📝 Tworzenie artykułu o naborach...')
const result = await client.create(doc)
console.log('✅ Artykuł utworzony!')
console.log('   ID:     ', result._id)
console.log('   URL:    https://swiatbaletu.vercel.app/artykuly/' + doc.slug.current)
console.log('   Studio: https://nri4izo1.sanity.studio/structure/artykul;' + result._id)
