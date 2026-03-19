import Link from 'next/link'
import { client } from '../../sanity/lib/client'
import { BANNER_ARTICLE_QUERY } from '../../sanity/lib/queries'

export default async function PromoBanner() {
  let banner: { _id: string; tytul: string; slug: { current: string }; zajawka?: string; kategoria?: string } | null = null

  try {
    banner = await client.fetch(BANNER_ARTICLE_QUERY)
  } catch {
    return null
  }

  if (!banner) return null

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <Link
        href={`/artykuly/${banner.slug.current}`}
        className="bg-bg-section border-[0.5px] border-border rounded-lg px-[22px] py-[18px] flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer my-7 transition-all relative overflow-hidden hover:bg-bg-hover hover:border-border-mid group"
      >
        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold" />
        <div>
          {banner.kategoria && (
            <div className="text-[10px] text-gold tracking-[0.1em] uppercase font-medium mb-[5px]">
              {banner.kategoria}
            </div>
          )}
          <div className="font-serif text-[21px] font-normal text-text-1">
            {banner.tytul}
          </div>
          {banner.zajawka && (
            <div className="text-[12px] text-text-2 mt-1 line-clamp-1">
              {banner.zajawka}
            </div>
          )}
        </div>
        <span className="inline-flex items-center gap-[6px] text-[11px] tracking-[0.07em] uppercase text-gold-dim border-[0.5px] border-gold-dim rounded-[2px] px-4 py-2 hover:text-gold hover:border-gold transition-all mt-3 sm:mt-0 shrink-0">
          Czytaj więcej &rarr;
        </span>
      </Link>
    </div>
  )
}
