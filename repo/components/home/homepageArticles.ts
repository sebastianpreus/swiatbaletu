import { cache } from 'react'
import { client } from '../../sanity/lib/client'
import { HOMEPAGE_ARTICLES_QUERY, HOMEPAGE_PROFILES_QUERY } from '../../sanity/lib/queries'
import type { Artykul } from '../../types'

/**
 * Wspólny kształt kafelka w siatce "Warto przeczytać". Artykuł i sylwetka
 * wyglądają dla czytelnika tak samo - to po prostu coś do przeczytania -
 * więc obie rzeczy sprowadzamy do jednego typu, a różnica zostaje tylko
 * w polu `typ`, po którym filtrują zakładki.
 */
export type KafelekTresci = {
  _id: string
  typ: 'artykul' | 'sylwetka'
  tytul: string
  nadtytul?: string
  stopka?: string
  href: string
  zdjecie?: Artykul['zdjecie']
  data: string
}

export type HomepageArticles = {
  banner: Artykul | null
  hero: Artykul | null
  side: Artykul[]
  grid: Artykul[]
  kafelki: KafelekTresci[]
}

const EMPTY: HomepageArticles = { banner: null, hero: null, side: [], grid: [], kafelki: [] }

/**
 * Jedno źródło prawdy dla sekcji artykułowych strony głównej.
 *
 * Każdy artykuł trafia najwyżej do jednego slotu — sekcje rozdzielają między
 * siebie pulę artykułów zamiast pobierać ją niezależnie. Wcześniej HeroSection
 * i ArticlesGrid odpytywały to samo zapytanie i ten sam artykuł potrafił
 * pojawić się na stronie dwa albo trzy razy.
 *
 * Baner stoi POZA tym podziałem. `bannerGlowna` to osobny kanał redakcyjny,
 * więc artykuł oznaczony jednocześnie jako `featured` ma się pokazać w obu
 * miejscach naraz - na górze strony i na pasku pod artykułami. Wcześniej baner
 * zabierał artykuł z puli i tym samym wypychał go z hero, co było błędem.
 *
 * Kolejność przydziału (tylko sekcje automatyczne):
 *   1. hero — najnowszy artykuł z flagą `featured`,
 *   2. side — 5 kolejnych najnowszych,
 *   3. grid — 6 kolejnych, wyróżnione najpierw.
 *
 * Powtórzenie w tych trzech sekcjach nadal jest wykluczone - to był pierwotny
 * błąd, dla którego ten moduł powstał.
 *
 * cache() z Reacta sprawia, że mimo wywołania z trzech komponentów
 * zapytanie do Sanity leci raz na żądanie.
 */
export const getHomepageArticles = cache(async (): Promise<HomepageArticles> => {
  let articles: Artykul[] = []
  let sylwetki: {
    _id: string
    imieNazwisko: string
    slug: { current: string }
    rola?: string
    teatrGlowny?: string
    _createdAt: string
    zdjecie?: Artykul['zdjecie']
  }[] = []

  try {
    ;[articles, sylwetki] = await Promise.all([
      client.fetch(HOMEPAGE_ARTICLES_QUERY),
      client.fetch(HOMEPAGE_PROFILES_QUERY),
    ])
  } catch {
    return EMPTY
  }

  if (!articles || articles.length === 0) return EMPTY

  const used = new Set<string>()
  const take = (pool: Artykul[], limit: number): Artykul[] => {
    const picked: Artykul[] = []
    for (const article of pool) {
      if (picked.length >= limit) break
      if (used.has(article._id)) continue
      used.add(article._id)
      picked.push(article)
    }
    return picked
  }

  // Zapytanie zwraca artykuły od najnowszego, więc wystarczy filtrować.
  // Baner NIE przechodzi przez take(): nie zajmuje miejsca w puli, dzięki czemu
  // ten sam artykuł może być jednocześnie banerem i hero.
  const banner = articles.find((a) => a.bannerGlowna) ?? null
  const hero = take(articles.filter((a) => a.featured), 1)[0] ?? take(articles, 1)[0] ?? null
  const side = take(articles, 5)
  const grid = take(
    [...articles].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false)),
    6,
  )

  // Siatka "Warto przeczytać": artykuły, których nie pokazano wyżej, plus
  // sylwetki. Zakładki filtrują to po stronie przeglądarki, dlatego oddajemy
  // obie grupy naraz.
  const kafelki: KafelekTresci[] = [
    ...grid.map((a) => ({
      _id: a._id,
      typ: 'artykul' as const,
      tytul: a.tytul,
      nadtytul: a.kategoria,
      stopka: a.czasCzytania ? `${a.czasCzytania} min czytania` : undefined,
      href: `/artykuly/${a.slug.current}`,
      zdjecie: a.zdjecie,
      data: a.dataPublikacji,
    })),
    ...(sylwetki || []).map((p) => ({
      _id: p._id,
      typ: 'sylwetka' as const,
      tytul: p.imieNazwisko,
      nadtytul: p.rola,
      stopka: p.teatrGlowny,
      href: `/sylwetki/${p.slug.current}`,
      zdjecie: p.zdjecie,
      data: p._createdAt,
    })),
  ]

  return { banner, hero, side, grid, kafelki }
})
