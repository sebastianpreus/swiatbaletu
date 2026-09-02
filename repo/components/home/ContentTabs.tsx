'use client'

import { useState } from 'react'
import Link from 'next/link'
import { urlFor } from '../../sanity/lib/image'
import type { KafelekTresci } from './homepageArticles'

const ZAKLADKI = [
  { id: 'wszystkie', etykieta: 'Wszystkie', link: '/artykuly', linkTekst: 'Wszystkie artykuły →' },
  { id: 'artykul', etykieta: 'Artykuły', link: '/artykuly', linkTekst: 'Wszystkie artykuły →' },
  { id: 'sylwetka', etykieta: 'Sylwetki', link: '/sylwetki', linkTekst: 'Wszystkie sylwetki →' },
] as const

type Zakladka = (typeof ZAKLADKI)[number]['id']

const NA_ZAKLADKE = 6
// W zakładce "Wszystkie" sylwetki mają dopełniać artykuły, a nie je wypierać.
// Same daty tego nie załatwiają: sylwetki noszą datę utworzenia dokumentu,
// która bywa nowsza niż data publikacji starszych tekstów, więc bez tego limitu
// mieszana lista potrafi się złożyć niemal wyłącznie z sylwetek.
const SYLWETEK_W_MIESZANCE = 2

const wgDaty = (a: KafelekTresci, b: KafelekTresci) => (b.data || '').localeCompare(a.data || '')

export default function ContentTabs({ kafelki }: { kafelki: KafelekTresci[] }) {
  const [aktywna, setAktywna] = useState<Zakladka>('wszystkie')

  let widoczne: KafelekTresci[]
  if (aktywna === 'wszystkie') {
    const sylwetki = kafelki.filter((k) => k.typ === 'sylwetka').sort(wgDaty).slice(0, SYLWETEK_W_MIESZANCE)
    const artykuly = kafelki
      .filter((k) => k.typ === 'artykul')
      .sort(wgDaty)
      .slice(0, NA_ZAKLADKE - sylwetki.length)
    widoczne = [...artykuly, ...sylwetki].sort(wgDaty)
  } else {
    widoczne = kafelki.filter((k) => k.typ === aktywna).slice().sort(wgDaty).slice(0, NA_ZAKLADKE)
  }

  const biezaca = ZAKLADKI.find((z) => z.id === aktywna) ?? ZAKLADKI[0]

  return (
    <section className="py-7 border-b-[0.5px] border-border">
      <div className="flex justify-between items-baseline mb-[18px] gap-4">
        <div className="flex items-baseline gap-4 flex-wrap">
          <h2 className="font-serif text-[23px] font-normal text-text-1">Warto przeczytać</h2>
          <div className="flex gap-3">
            {ZAKLADKI.map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => setAktywna(z.id)}
                aria-pressed={aktywna === z.id}
                className={`text-[11px] tracking-[0.07em] uppercase pb-[2px] border-b transition-colors ${
                  aktywna === z.id
                    ? 'text-gold border-gold'
                    : 'text-text-2 border-transparent hover:text-gold-dim'
                }`}
              >
                {z.etykieta}
              </button>
            ))}
          </div>
        </div>
        <Link
          href={biezaca.link}
          className="text-[11px] text-gold-dim tracking-[0.05em] hover:text-gold transition-colors shrink-0"
        >
          {biezaca.linkTekst}
        </Link>
      </div>

      {widoczne.length === 0 ? (
        <p className="text-[13px] text-text-2 italic">Brak treści do wyświetlenia.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-[12px] sm:gap-[18px]">
          {widoczne.map((k) => (
            <Link key={k._id} href={k.href} className="cursor-pointer group">
              <div className="w-full aspect-video rounded-lg mb-[11px] flex items-center justify-center border-[0.5px] border-border transition-all group-hover:border-gold-dim group-hover:shadow-[var(--shadow-card)] overflow-hidden">
                {k.zdjecie ? (
                  <img
                    src={urlFor(k.zdjecie).width(400).height(225).url()}
                    alt={k.zdjecie.alt || k.tytul}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-[30px] italic text-gold opacity-20">
                    {k.tytul[0]}
                  </span>
                )}
              </div>
              <div className="text-[10px] tracking-[0.1em] uppercase text-text-2 mb-[5px] font-medium">
                {k.nadtytul || (k.typ === 'sylwetka' ? 'Sylwetka' : 'Artykuł')}
              </div>
              <div className="font-serif text-[14px] sm:text-[17px] leading-[1.25] font-normal text-text-1 mb-[5px] group-hover:text-gold transition-colors line-clamp-3">
                {k.tytul}
              </div>
              {k.stopka && <div className="text-[11px] text-text-2">{k.stopka}</div>}
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
