import Link from 'next/link'
import { client } from '../../../../sanity/lib/client'
import { ALL_ARTICLES_QUERY } from '../../../../sanity/lib/queries'
import { urlFor } from '../../../../sanity/lib/image'
import type { Artykul } from '../../../../types'

export const metadata = {
  title: 'Artykuły — Świat Baletu',
  description: 'Artykuły, recenzje i felietony ze świata baletu i opery.',
}

export default async function ArticlesPage() {
  let articles: Artykul[] = []

  try {
    articles = await client.fetch(ALL_ARTICLES_QUERY)
  } catch {
    // Sanity not configured
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <h1 className="font-serif text-[36px] font-normal text-text-1 mb-2">Artykuły i recenzje</h1>
      <p className="text-[13px] text-text-2 mb-8">Felietony, recenzje spektakli, historia i technika baletowa.</p>

      {articles.length === 0 ? (
        <p className="text-[14px] text-text-2 italic">Brak artykułów do wyświetlenia.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article._id}
              href={`/artykuly/${article.slug.current}`}
              className="group"
            >
              <div className="w-full aspect-[3/2] rounded-lg mb-3 flex items-center justify-center border-[0.5px] border-border overflow-hidden transition-all group-hover:border-gold-dim group-hover:shadow-[var(--shadow-card)]">
                {article.zdjecie ? (
                  <img
                    src={urlFor(article.zdjecie).width(400).url()}
                    alt={article.zdjecie.alt || article.tytul}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-[30px] italic text-gold opacity-20">
                    {article.kategoria?.[0] || 'A'}
                  </span>
                )}
              </div>
              <div className="text-[10px] tracking-[0.1em] uppercase text-gold mb-1 font-medium">
                {article.kategoria}
              </div>
              <div className="font-serif text-[18px] leading-[1.25] text-text-1 mb-1 group-hover:text-gold transition-colors">
                {article.tytul}
              </div>
              <div className="text-[12px] text-text-2 leading-[1.6] mb-2 line-clamp-2">
                {article.zajawka}
              </div>
              <div className="text-[11px] text-text-2">
                {article.autor} · {article.czasCzytania} min czytania
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
