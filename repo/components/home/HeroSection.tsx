import Link from 'next/link'
import { client } from '../../sanity/lib/client'
import { WYWIAD_TYGODNIA_QUERY, FEATURED_ARTICLES_QUERY } from '../../sanity/lib/queries'
import { urlFor } from '../../sanity/lib/image'
import type { Wywiad, Artykul } from '../../types'

export default async function HeroSection() {
  let interview: Wywiad | null = null
  let sideArticles: Artykul[] = []

  try {
    interview = await client.fetch(WYWIAD_TYGODNIA_QUERY)
    sideArticles = await client.fetch(FEATURED_ARTICLES_QUERY)
  } catch {
    // Sanity not configured yet
  }

  const i = interview && interview.tytul ? interview : null

  if (!i && sideArticles.length === 0) {
    return null
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 border-b-[0.5px] border-border">
        {/* Main hero - Interview of the week */}
        {i ? (
          <div className="py-7 pr-0 md:pr-7 md:border-r-[0.5px] md:border-border">
            <div className="text-[10px] tracking-[0.11em] uppercase text-gold mb-[10px] flex items-center gap-2 font-medium">
              <span className="block w-[18px] h-[0.5px] bg-gold" />
              Wywiad tygodnia
            </div>
            <h1 className="font-serif text-[28px] md:text-[36px] leading-[1.1] font-normal text-text-1 mb-3">
              {i.tytul}
            </h1>
            {i.rozmowca && (
              <div className="text-[12px] text-text-2 mb-[14px] leading-relaxed">
                {i.rozmowca.imieNazwisko} — {i.rozmowca.rola} · {i.rozmowca.teatrGlowny}
              </div>
            )}
            {i.zajawka && (
              <p className="text-[13px] text-text-2 leading-[1.8] mb-[22px]">
                {i.zajawka}
              </p>
            )}
            <div className="w-full aspect-video rounded-lg mb-[22px] flex items-center justify-center border-[0.5px] border-border relative overflow-hidden bg-gradient-to-br from-[#f0ece0] via-[#e8dfc8] to-[#f0ece0] dark:from-[#0a0803] dark:via-[#1c1408] dark:to-[#0d0c06]">
              {i.zdjecie ? (
                <img
                  src={urlFor(i.zdjecie).width(800).url()}
                  alt={i.zdjecie.alt || i.tytul}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-serif text-[62px] italic text-gold opacity-[0.12] select-none">
                  Świat Baletu
                </span>
              )}
            </div>
            <Link
              href={`/wywiady/${i.slug.current}`}
              className="inline-flex items-center gap-[6px] text-[11px] tracking-[0.07em] uppercase text-gold-dim border-[0.5px] border-gold-dim rounded-[2px] px-4 py-2 hover:text-gold hover:border-gold transition-all"
            >
              Czytaj wywiad &rarr;
            </Link>
          </div>
        ) : (
          <div className="py-7 pr-0 md:pr-7 md:border-r-[0.5px] md:border-border flex items-center justify-center">
            <p className="text-[13px] text-text-2 italic">Brak wywiadu tygodnia</p>
          </div>
        )}

        {/* Side articles */}
        <div className="py-7 pl-0 md:pl-7 flex flex-col justify-between border-t-[0.5px] md:border-t-0 border-border">
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
                  <div className="w-[72px] h-[52px] rounded-[4px] overflow-hidden shrink-0 border-[0.5px] border-border">
                    <img
                      src={urlFor(article.zdjecie).width(144).height(104).url()}
                      alt={article.zdjecie.alt || article.tytul}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] tracking-[0.1em] uppercase text-gold mb-[4px] font-medium">
                    {article.kategoria}
                  </div>
                  <div className="font-serif text-[16px] leading-[1.25] font-normal text-text-1 group-hover:text-gold transition-colors">
                    {article.tytul}
                  </div>
                  {article.zajawka && (
                    <div className="text-[11px] text-text-2 leading-[1.5] mt-[3px] line-clamp-2">
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
