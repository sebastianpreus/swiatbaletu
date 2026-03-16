import { client } from '../../../../sanity/lib/client'
import { ALL_PROMOS_QUERY } from '../../../../sanity/lib/queries'
import type { Promocja } from '../../../../types'

export const metadata = {
  title: 'Promocje — Świat Baletu',
  description: 'Aktualne promocje i oferty specjalne na spektakle baletowe.',
}

export default async function PromocjePage() {
  let promos: Promocja[] = []

  try {
    promos = await client.fetch(ALL_PROMOS_QUERY)
  } catch {
    // Sanity not configured
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <h1 className="font-serif text-[36px] font-normal text-text-1 mb-2">Promocje i oferty</h1>
      <p className="text-[13px] text-text-2 mb-8">Aktualne zniżki i oferty specjalne na spektakle baletowe.</p>

      {promos.length === 0 ? (
        <p className="text-[14px] text-text-2 italic">Brak aktywnych promocji.</p>
      ) : (
        <div className="space-y-4">
          {promos.map((promo) => (
            <a
              key={promo._id}
              href={promo.linkDoOferty}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-bg-card border-[0.5px] border-border rounded-lg px-6 py-5 relative overflow-hidden transition-all hover:border-gold-dim hover:shadow-[var(--shadow-card)] group"
            >
              <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold" />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  {promo.etykieta && (
                    <div className="text-[10px] text-gold tracking-[0.1em] uppercase font-medium mb-1">
                      {promo.etykieta}
                    </div>
                  )}
                  <div className="font-serif text-[21px] font-normal text-text-1 group-hover:text-gold transition-colors">
                    {promo.tytul}
                  </div>
                  <div className="text-[12px] text-text-2 mt-1">
                    {promo.opis}
                    {promo.teatr && (
                      <> · {promo.teatr.nazwa}, {promo.teatr.miasto}</>
                    )}
                  </div>
                  {promo.kod && (
                    <div className="text-[12px] text-text-2 mt-1">
                      Kod rabatowy: <span className="text-gold font-medium">{promo.kod}</span>
                    </div>
                  )}
                </div>
                <span className="inline-flex items-center gap-[6px] text-[11px] tracking-[0.07em] uppercase text-gold-dim border-[0.5px] border-gold-dim rounded-[2px] px-4 py-2 hover:text-gold hover:border-gold transition-all shrink-0">
                  Sprawdź ofertę &rarr;
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
