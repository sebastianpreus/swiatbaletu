/**
 * create-artykul-lato-cisza.mjs
 * Artykuł "Dlaczego latem teatry milkną?" w Sanity.
 * - długie myślniki (—, –) zamienione na krótkie "-"
 * - zdjęcie główne: images/lato-teatry-cisza.jpg (Unsplash, Vadim Kuznetsov)
 * Idempotentny: po slug — patchuje istniejący.
 */
import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const SLUG = 'dlaczego-latem-teatry-milkna'
const IMAGE_FILE = 'lato-teatry-cisza.jpg'

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

const key = () => Math.random().toString(36).slice(2, 10)
const block = (text, style = 'normal') => ({
  _type: 'block', _key: key(), style,
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
  markDefs: [],
})
const h2 = (t) => block(t, 'h2')

const ZAJAWKA =
  'Lipcowy upał daje się we znaki. Asfalt paruje, miasta pustoszeją, a my instynktownie szukamy cienia. ' +
  'W takie dni odpowiedź na pytanie "dlaczego latem nie ma spektakli?" wydaje się oczywista - przecież nikt ' +
  'nie chce siedzieć w dusznej sali, gdy za oknem trzydzieści stopni. Ale historia letniej przerwy w teatrach ' +
  'jest znacznie ciekawsza, niż mogłoby się wydawać. I wcale nie kończy się na temperaturze.'

const tresc = [
  h2('Kiedy teatr był piecem'),
  block('Tradycja zamykania teatrów na lato narodziła się w epoce, w której o klimatyzacji nikomu się nie śniło. Przez większą część historii teatru - od barokowych dworów po XIX-wieczne gmachy operowe - sale widowiskowe były miejscami, w których latem panował dosłownie nieznośny żar.'),
  block('Wyobraźmy sobie taką salę w lipcowy wieczór sprzed stu pięćdziesięciu lat. Kilkaset osób stłoczonych na widowni, każda emanująca ciepłem. Setki świec lub lamp gazowych oświetlających scenę i widownię, z których każda podnosi temperaturę i zużywa tlen. Brak jakiejkolwiek wentylacji poza uchylonymi oknami. W takich warunkach temperatura w sali potrafiła przekraczać trzydzieści kilka stopni - a powietrze stawało się gęste i duszne.'),
  block('Dla publiczności był to dyskomfort. Dla tancerzy - realne zagrożenie. Baletnice występowały w wielowarstwowych kostiumach, gorsetach i ciężkich tkaninach, pod rozgrzanymi reflektorami, wykonując jednocześnie jeden z najbardziej wyczerpujących fizycznie rodzajów wysiłku, jakie zna sztuka sceniczna. Taniec klasyczny w trzydziestostopniowym upale, w pełnym kostiumie, groził omdleniami, odwodnieniem i przegrzaniem organizmu. Nic dziwnego, że teatry po prostu zawieszały działalność na najgorętsze miesiące.'),

  h2('Klimatyzacja przyszła - a cisza została'),
  block('Pojawienie się klimatyzacji w XX wieku rozwiązało problem upału raz na zawsze. Dziś każdy duży teatr operowy dysponuje systemami utrzymującymi stałą, komfortową temperaturę niezależnie od pogody na zewnątrz. Sala Teatru Wielkiego w upalny lipcowy wieczór mogłaby być równie chłodna i przyjemna jak w grudniu.'),
  block('A jednak teatry nadal milkną latem. Dlaczego?'),
  block('Okazuje się, że temperatura była tylko jednym z powodów - i bynajmniej nie najważniejszym. Letnia przerwa przetrwała wynalezienie klimatyzacji, ponieważ wyrasta z głębszych, bardziej fundamentalnych potrzeb samego baletu.'),

  h2('Powód pierwszy: ciało potrzebuje odpoczynku'),
  block('Sezon baletowy to dziewięć miesięcy nieustannej pracy. Tancerze trenują codziennie - zaczynając od porannej lekcji, przez wielogodzinne próby, aż po wieczorne spektakle. To rytm, który eksploatuje ciało do granic ludzkich możliwości. Stawy, ścięgna, mięśnie i kości tancerza są poddawane obciążeniom, których przeciętny człowiek nie doświadcza nigdy w życiu.'),
  block('Bez przerwy taki reżim prowadziłby do katastrofy. Kontuzje przeciążeniowe, mikrourazy, chroniczne zapalenia - wszystko to kumuluje się przez sezon. Lato jest jedynym momentem w roku, gdy ciało może się zregenerować. Goją się drobne urazy, odpoczywają przeciążone stawy, organizm odbudowuje rezerwy. To nie luksus - to biologiczna konieczność, bez której kariera tancerza skończyłaby się przedwcześnie.'),
  block('Co ciekawe, dla wielu tancerzy ta przerwa jest paradoksalnie trudna. Po kilku tygodniach bez codziennego treningu ciało zaczyna tracić formę budowaną miesiącami - dlatego większość zawodowych tancerzy nawet podczas wakacji utrzymuje lekką aktywność, by nie zaczynać kolejnego sezonu od zera.'),

  h2('Powód drugi: publiczności nie ma w mieście'),
  block('Teatr żyje z widzów. A latem widzowie wyjeżdżają - na urlopy, nad morze, w góry, za granicę. Miasta pustoszeją, a wraz z nimi pustoszałyby sale teatralne. Wystawianie pełnowymiarowych produkcji operowych i baletowych przy na wpół pustej widowni byłoby ekonomicznie nieracjonalne. Koszt utrzymania orkiestry, zespołu baletowego, techniki i całej maszynerii teatralnej jest ogromny - i wymaga pełnych sal, by się bilansować.'),

  h2('Powód trzeci: czas na przygotowania'),
  block('Letnia cisza na widowni nie oznacza, że teatr zamiera. Wręcz przeciwnie - za kulisami trwa intensywna praca. To właśnie latem buduje się dekoracje do jesiennych premier, szyje kostiumy, planuje repertuar kolejnego sezonu. Choreografowie pracują nad nowymi spektaklami, dyrekcja układa kalendarz, technicy konserwują sprzęt i scenę.'),
  block('Przerwa w występach jest więc w istocie czasem przygotowań - fundamentem, na którym zbuduje się cały następny sezon. Gdyby teatry grały bez przerwy przez cały rok, nie miałyby kiedy tworzyć nowych produkcji.'),

  h2('Cisza, która jest potrzebna'),
  block('Tak więc choć klimatyzacja dawno rozwiązała problem letniego upału, lato wciąż pozostaje czasem ciszy w teatrach - i prawdopodobnie pozostanie nim na zawsze. Ta cisza nie jest pustką ani lenistwem. To czas regeneracji ciał, przygotowań i nabierania sił.'),
  block('Bo żeby jesienią znów podnieść kurtynę - z nową premierą, wypoczętym zespołem i pełną widownią - najpierw trzeba pozwolić sobie na chwilę milczenia.'),
  block('Do zobaczenia w nowym sezonie. 🎭'),
]

async function main() {
  const imgPath = join(__dir, '..', '..', 'images', IMAGE_FILE)
  if (!existsSync(imgPath)) { console.error('✗ Brak zdjęcia:', imgPath); process.exit(1) }
  console.log('Wgrywam zdjęcie:', imgPath)
  const asset = await client.assets.upload('image', readFileSync(imgPath), { filename: IMAGE_FILE })
  console.log('  ✓ Asset:', asset._id)

  const doc = {
    _type: 'artykul',
    tytul: 'Dlaczego latem teatry milkną? Historia letniej ciszy w świecie baletu',
    slug: { _type: 'slug', current: SLUG },
    kategoria: 'Historia',
    zajawka: ZAJAWKA,
    zdjecie: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: 'Puste fotele w teatralnej widowni',
    },
    trescGlowna: tresc,
    autor: 'Redakcja Świat Baletu',
    dataPublikacji: new Date().toISOString(),
    featured: false,
    czasCzytania: 6,
    tagi: ['balet', 'teatr', 'lato', 'ciekawostki', 'kulisy', 'sezon baletowy'],
    bannerGlowna: false,
  }

  const existing = await client.fetch('*[_type=="artykul" && slug.current==$slug][0]{_id}', { slug: SLUG })
  if (existing?._id) {
    await client.patch(existing._id).set(doc).commit()
    console.log('  ✓ Zaktualizowano:', existing._id)
  } else {
    const created = await client.create(doc)
    console.log('  ✓ Utworzono:', created._id)
  }
  console.log('\nGotowe! Adres: /artykuly/' + SLUG)
}

main().catch((e) => { console.error('Błąd:', e.message); process.exit(1) })
