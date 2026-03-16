import Link from 'next/link'
import { client } from '../../../../sanity/lib/client'
import { ALL_TEATRY_SANITY_QUERY } from '../../../../sanity/lib/queries'
import { urlFor } from '../../../../sanity/lib/image'

export const metadata = {
  title: 'Teatry — Świat Baletu',
  description: 'Polskie teatry operowe i baletowe — informacje, repertuar, bilety.',
}

interface TeatrSanity {
  _id: string
  nazwa: string
  slug: { current: string }
  miasto: string
  adres?: string
  rokZalozenia?: number
  dyrektorArtystyczny?: string
  liczbaMiejsc?: number
  stronaWww?: string
  linkBilety?: string
  logo?: { asset: { _ref: string } }
  zdjecie?: { asset: { _ref: string }; alt?: string }
}

export default async function TeatryPage() {
  let teatry: TeatrSanity[] = []

  try {
    teatry = await client.fetch(ALL_TEATRY_SANITY_QUERY)
  } catch {
    // Sanity not configured
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <h1 className="font-serif text-[36px] font-normal text-text-1 mb-2">Teatry</h1>
      <p className="text-[13px] text-text-2 mb-8">Polskie sceny baletowe i operowe.</p>

      {teatry.length === 0 ? (
        <p className="text-[14px] text-text-2 italic">Brak teatrów do wyświetlenia.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {teatry.map((teatr) => (
            <Link
              key={teatr._id}
              href={`/teatry/${teatr.slug.current}`}
              className="bg-bg-card border-[0.5px] border-border rounded-lg overflow-hidden group transition-all hover:border-gold-dim hover:shadow-[var(--shadow-card)]"
            >
              <div className="w-full aspect-[2/1] flex items-center justify-center bg-bg-section overflow-hidden">
                {teatr.zdjecie ? (
                  <img
                    src={urlFor(teatr.zdjecie).width(400).url()}
                    alt={teatr.zdjecie.alt || teatr.nazwa}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-[24px] italic text-gold opacity-15">
                    {teatr.nazwa[0]}
                  </span>
                )}
              </div>
              <div className="px-4 py-4">
                <div className="text-[10px] tracking-[0.1em] uppercase text-gold mb-1 font-medium">
                  {teatr.miasto}
                </div>
                <div className="font-serif text-[18px] text-text-1 leading-[1.3] group-hover:text-gold transition-colors">
                  {teatr.nazwa}
                </div>
                {teatr.dyrektorArtystyczny && (
                  <div className="text-[11px] text-text-2 mt-1">
                    Dyr. art.: {teatr.dyrektorArtystyczny}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
