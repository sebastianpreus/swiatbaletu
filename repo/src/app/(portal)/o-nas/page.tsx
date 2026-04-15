import { client } from '../../../../sanity/lib/client'
import { STRONA_BY_SLUG_QUERY } from '../../../../sanity/lib/queries'
import { urlFor } from '../../../../sanity/lib/image'
import { PortableText } from '@portabletext/react'
import { portableTextComponents } from '../../../../components/portable-text/PortableTextComponents'

export const metadata = {
  title: 'O nas — Świat Baletu',
  description: 'Poznaj twórców portalu Świat Baletu — Izabelę Sokołowską-Boulton i Sebastiana Preusa.',
}

export const revalidate = 60

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OsobaBlock({ value }: { value: any }) {
  return (
    <div className="flex flex-col items-center text-center mb-10">
      {value.zdjecie && (
        <div className="w-[220px] h-[220px] rounded-full overflow-hidden border-[0.5px] border-border mb-5">
          <img
            src={urlFor(value.zdjecie).width(440).height(440).url()}
            alt={value.imie}
            className="w-full h-full object-cover object-[center_20%]"
          />
        </div>
      )}
      <h2 className="font-serif text-[22px] text-text-1 mb-1">{value.imie}</h2>
      <div className="text-[11px] tracking-[0.08em] uppercase text-gold mb-4 font-medium">
        {value.rola}
      </div>
      {value.bio && (
        <p className="text-[13px] text-text-2 leading-[1.8] max-w-[400px]">{value.bio}</p>
      )}
      {value.bio2 && (
        <p className="text-[13px] text-text-2 leading-[1.8] max-w-[400px] mt-3">{value.bio2}</p>
      )}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function KontaktBlock({ value }: { value: any }) {
  return (
    <div id="kontakt" className="border-t-[0.5px] border-border pt-8 scroll-mt-20">
      <h2 className="font-serif text-[24px] text-text-1 mb-4">{value.tytulSekcji || 'Kontakt'}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {value.kolumny?.map((col: { naglowek: string; tekst: string; email: string; _key: string }, i: number) => (
          <div key={col._key || i}>
            <div className="text-[11px] tracking-[0.08em] uppercase text-gold mb-2 font-medium">{col.naglowek}</div>
            <p className="text-[13px] text-text-2 leading-[1.8]">{col.tekst}</p>
            {col.email && (
              <a href={`mailto:${col.email}`} className="text-[13px] text-gold hover:text-gold-dim transition-colors mt-2 inline-block">
                {col.email}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function ONasPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let page: any = null

  try {
    page = await client.fetch(STRONA_BY_SLUG_QUERY, { slug: 'o-nas' })
  } catch {
    // Sanity not configured
  }

  if (!page) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <h1 className="font-serif text-[36px] font-normal text-text-1 mb-3">O nas</h1>
        <p className="text-[14px] text-text-2 italic">Strona w przygotowaniu.</p>
      </div>
    )
  }

  // Split content into text blocks, osoba blocks, and kontakt blocks
  const textBlocks = page.tresc?.filter((b: { _type: string }) => b._type === 'block' || b._type === 'image') || []
  const osoby = page.tresc?.filter((b: { _type: string }) => b._type === 'osoba') || []
  const kontakt = page.tresc?.find((b: { _type: string }) => b._type === 'kontakt')

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <h1 className="font-serif text-[36px] font-normal text-text-1 mb-3">{page.tytul}</h1>

      {textBlocks.length > 0 && (
        <div className="mb-10 max-w-[720px]">
          <PortableText value={textBlocks} components={portableTextComponents} />
        </div>
      )}

      {osoby.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {osoby.map((osoba: { _key: string }) => (
            <OsobaBlock key={osoba._key} value={osoba} />
          ))}
        </div>
      )}

      {kontakt && <KontaktBlock value={kontakt} />}
    </div>
  )
}
