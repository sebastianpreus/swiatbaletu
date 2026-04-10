import Link from 'next/link'
import { client } from '../../sanity/lib/client'
import { FEATURED_ARTICLES_QUERY } from '../../sanity/lib/queries'
import { urlFor } from '../../sanity/lib/image'
import type { Artykul } from '../../types'

export default async function HeroSection() {
  let allArticles: Artykul[] = []

  try {
    allArticles = await client.fetch(FEATURED_ARTICLES_QUERY)
  } catch {
    // Sanity not configured yet
  }

  if (allArticles.length === 0) return null

  // First featured article is the hero, rest go in sidebar
  const hero = allArticles[0]
  const sideArticles = allArticles.slice(1)

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 border-b-[0.5px] border-border">
        {/* Main hero - Featured article */}
        <div className="py-7 pr-0 lg:pr-7 lg:border-r-[0.5px] lg:border-border">
          <div className="text-[10px] tracking-[0.11em] uppercase text-gold mb-[10px] flex items-center gap-2 font-medium">
            <span className="block w-[18px] h-[0.5px] bg-gold" />
            Artykuł wyróżniony
          </div>
          <h1 className="font-serif text-[28px] lg:text-[36px] leading-[1.1] font-normal text-text-1 mb-3">
            {hero.tytul}
          </h1>
          {hero.autor && (
            <div className="text-[12px] text-text-2 mb-[14px] leading-relaxed">
              {hero.autor}{hero.kategoria ? ` · ${hero.kategoria}` : ''}
            </div>
          )}
          {hero.zajawka && (
            <p className="text-[13px] text-text-2 leading-[1.8] mb-[22px]">
              {hero.zajawka}
            </p>
          )}
          <Link
            href={`/artykuly/${hero.slug.current}`}
            className="block w-full rounded-lg border-[0.5px] border-border relative overflow-hidden bg-gradient-to-br from-[#f0ece0] via-[#e8dfc8] to-[#f0ece0] dark:from-[#0a0803] dark:via-[#1c1408] dark:to-[#0d0c06] group"
          >
            {hero.zdjecie ? (
              <img
                src={urlFor(hero.zdjecie).width(800).url()}
                alt={hero.zdjecie.alt || hero.tytul}
                className="w-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
              />
            ) : (
              <span className="font-serif text-[62px] italic text-gold opacity-[0.12] select-none py-20 block text-center">
                Świat Baletu
              </span>
            )}
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-[6px] text-[11px] tracking-[0.07em] uppercase text-white/90 bg-black/30 backdrop-blur-md rounded-[2px] px-4 py-2 group-hover:bg-gold/80 group-hover:text-white transition-all">
              Czytaj więcej &rarr;
            </span>
          </Link>
        </div>

        {/* Side articles */}
        <div className="py-7 pl-0 lg:pl-7 flex flex-col justify-between border-t-[0.5px] lg:border-t-0 border-border">
          {sideArticles.length > 0 ? (
            sideArticles.map((article, idx) => (
              <Link
                key={article._id}
                href={`/artykuly/${article.slug.current}`}
                className={`py-[14px] cursor-pointer group flex gap-4 ${
                  idx < sideArticles.length - 1 ? 'border-b-[0.5px] border-border' : ''
                }`}
              >
                {article.zdjecie && (
                  <div className="w-[82px] self-stretch rounded-[4px] overflow-hidden shrink-0 border-[0.5px] border-border">
                    <img
                      src={urlFor(article.zdjecie).width(164).height(164).url()}
                      alt={article.zdjecie.alt || article.tytul}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] tracking-[0.1em] uppercase text-gold mb-[4px] font-medium">
                    {article.kategoria}
                  </div>
                  <div className="font-serif text-[15px] leading-[1.3] font-normal text-text-1 group-hover:text-gold transition-colors line-clamp-2">
                    {article.tytul}
                  </div>
                  {article.zajawka && (
                    <div className="text-[11px] text-text-2 leading-[1.4] mt-[3px] line-clamp-2">
                      {article.zajawka}
                    </div>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[13px] text-text-2 italic">Brak artykułów</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
