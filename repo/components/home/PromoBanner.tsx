import { client } from '../../sanity/lib/client'
import { ACTIVE_PROMOS_QUERY } from '../../sanity/lib/queries'
import type { Promocja } from '../../types'

export default async function PromoBanner() {
  let promos: Promocja[] = []

  try {
    promos = await client.fetch(ACTIVE_PROMOS_QUERY)
  } catch {
    // Sanity not configured yet
  }

  const promo = promos?.[0] || null

  if (!promo) {
    return null
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <a
        href={promo.linkDoOferty}
        className="bg-bg-section border-[0.5px] border-border rounded-lg px-[22px] py-[18px] flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer my-7 transition-all relative overflow-hidden hover:bg-bg-hover hover:border-border-mid group"
      >
        <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold" />
        <div>
          {promo.etykieta && (
            <div className="text-[10px] text-gold tracking-[0.1em] uppercase font-medium mb-[5px]">
              {promo.etykieta}
            </div>
          )}
          <div className="font-serif text-[21px] font-normal text-text-1">
            {promo.tytul}
          </div>
          <div className="text-[12px] text-text-2 mt-1">
            {promo.opis}
            {promo.kod && (
              <> &middot; kod: <span className="text-gold font-medium">{promo.kod}</span></>
            )}
          </div>
        </div>
        <span className="inline-flex items-center gap-[6px] text-[11px] tracking-[0.07em] uppercase text-gold-dim border-[0.5px] border-gold-dim rounded-[2px] px-4 py-2 hover:text-gold hover:border-gold transition-all mt-3 sm:mt-0 shrink-0">
          Sprawdź ofertę &rarr;
        </span>
      </a>
    </div>
  )
}
