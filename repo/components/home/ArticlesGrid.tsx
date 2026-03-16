import Link from 'next/link'
import { client } from '../../sanity/lib/client'
import { FEATURED_ARTICLES_QUERY } from '../../sanity/lib/queries'
import { urlFor } from '../../sanity/lib/image'
import type { Artykul } from '../../types'
import SectionHeader from '../ui/SectionHeader'

const demoArticles = [
  { id: '1', tag: 'Technika', title: 'Pointy — 200 lat bólu i piękna', time: '8 min czytania', imgText: 'en pointe', imgClass: 'bg-[#eef3fa] text-[#5a88c0]' },
  { id: '2', tag: 'Recenzja', title: 'Don Kichot w Poznaniu — brawura i luz', time: '5 min czytania', imgText: '★★★★', imgClass: 'bg-[#fdf0f0] text-[#b85050]' },
  { id: '3', tag: 'Historia', title: 'Diaghilew i rewolucja Ballets Russes', time: '12 min czytania', imgText: '1909', imgClass: 'bg-[#fdf6e8] text-[#9a7820]' },
]

export default async function ArticlesGrid() {
  let articles: Artykul[] = []

  try {
    articles = await client.fetch(FEATURED_ARTICLES_QUERY)
  } catch {
    // Sanity not configured yet
  }

  const hasArticles = articles && articles.length > 0

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <section className="py-7 border-b-[0.5px] border-border">
        <SectionHeader
          title="Artykuły i recenzje"
          linkText="Wszystkie artykuły →"
          linkHref="/artykuly"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {hasArticles
            ? articles.map((article) => (
                <Link
                  key={article._id}
                  href={`/artykuly/${article.slug.current}`}
                  className="cursor-pointer group"
                >
                  <div className="w-full aspect-[3/2] rounded-lg mb-[11px] flex items-center justify-center border-[0.5px] border-border transition-all group-hover:border-gold-dim group-hover:shadow-[var(--shadow-card)] overflow-hidden">
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
                  <div className="text-[10px] tracking-[0.1em] uppercase text-text-2 mb-[5px] font-medium">
                    {article.kategoria}
                  </div>
                  <div className="font-serif text-[17px] leading-[1.25] font-normal text-text-1 mb-[5px] group-hover:text-gold transition-colors">
                    {article.tytul}
                  </div>
                  <div className="text-[11px] text-text-2">
                    {article.czasCzytania} min czytania
                  </div>
                </Link>
              ))
            : demoArticles.map((article) => (
                <div key={article.id} className="cursor-pointer group">
                  <div
                    className={`w-full aspect-[3/2] rounded-lg mb-[11px] flex items-center justify-center border-[0.5px] border-border transition-all group-hover:border-gold-dim group-hover:shadow-[var(--shadow-card)] font-serif text-[30px] italic ${article.imgClass}`}
                  >
                    {article.imgText}
                  </div>
                  <div className="text-[10px] tracking-[0.1em] uppercase text-text-2 mb-[5px] font-medium">
                    {article.tag}
                  </div>
                  <div className="font-serif text-[17px] leading-[1.25] font-normal text-text-1 mb-[5px] group-hover:text-gold transition-colors">
                    {article.title}
                  </div>
                  <div className="text-[11px] text-text-2">{article.time}</div>
                </div>
              ))}
        </div>
      </section>
    </div>
  )
}
