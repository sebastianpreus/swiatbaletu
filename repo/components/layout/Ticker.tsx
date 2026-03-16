import { client } from '../../sanity/lib/client'
import { TICKER_QUERY } from '../../sanity/lib/queries'
import type { TickerItem } from '../../types'

export default async function Ticker() {
  let items: TickerItem[] = []

  try {
    items = await client.fetch(TICKER_QUERY)
  } catch {
    // Sanity not configured yet
  }

  if (!items || items.length === 0) {
    return null
  }

  const doubled = [...items, ...items]

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <div className="bg-bg-section border-t-[0.5px] border-b-[0.5px] border-border py-[9px] flex items-center overflow-hidden rounded-[2px]">
        <div className="text-[10px] tracking-[0.11em] uppercase text-gold font-medium px-[18px] border-r-[0.5px] border-border-mid mr-4 whitespace-nowrap shrink-0">
          Na żywo
        </div>
        <div className="overflow-hidden flex-1">
          <div
            className="flex gap-10 whitespace-nowrap"
            style={{ animation: 'tick 35s linear infinite' }}
          >
            {doubled.map((item, idx) => (
              <span key={`${item._id}-${idx}`} className="text-[11px] text-text-2 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gold shrink-0 inline-block" />
                {item.link ? (
                  <a href={item.link} className="hover:text-gold transition-colors">
                    {item.tresc}
                  </a>
                ) : (
                  item.tresc
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
