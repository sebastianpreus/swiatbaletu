import { cache } from 'react'
import { client } from '../../sanity/lib/client'
import { HOMEPAGE_ARTICLES_QUERY } from '../../sanity/lib/queries'
import type { Artykul } from '../../types'

export type HomepageArticles = {
  banner: Artykul | null
  hero: Artykul | null
  side: Artykul[]
  grid: Artykul[]
}

const EMPTY: HomepageArticles = { banner: null, hero: null, side: [], grid: [] }

/**
 * Jedno źródło prawdy dla sekcji artykułowych strony głównej.
 *
 * Każdy artykuł trafia najwyżej do jednego slotu — sekcje rozdzielają między
 * siebie pulę artykułów zamiast pobierać ją niezależnie. Wcześniej HeroSection
 * i ArticlesGrid odpytywały to samo zapytanie i ten sam artykuł potrafił
 * pojawić się na stronie dwa albo trzy razy.
 *
 * Kolejność przydziału:
 *   1. banner — jawna, pojedyncza decyzja redakcyjna (`bannerGlowna`),
 *      dlatego nigdy nie jest przez nic wypierana,
 *   2. hero   — najnowszy artykuł z flagą `featured`,
 *   3. side   — 5 kolejnych najnowszych,
 *   4. grid   — 6 kolejnych, wyróżnione najpierw.
 *
 * cache() z Reacta sprawia, że mimo wywołania z trzech komponentów
 * zapytanie do Sanity leci raz na żądanie.
 */
export const getHomepageArticles = cache(async (): Promise<HomepageArticles> => {
  let articles: Artykul[] = []

  try {
    articles = await client.fetch(HOMEPAGE_ARTICLES_QUERY)
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
  const banner = take(articles.filter((a) => a.bannerGlowna), 1)[0] ?? null
  const hero = take(articles.filter((a) => a.featured), 1)[0] ?? take(articles, 1)[0] ?? null
  const side = take(articles, 5)
  const grid = take(
    [...articles].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false)),
    6,
  )

  return { banner, hero, side, grid }
})
