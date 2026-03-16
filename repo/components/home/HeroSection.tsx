import Link from 'next/link'
import { client } from '../../sanity/lib/client'
import { WYWIAD_TYGODNIA_QUERY, FEATURED_ARTICLES_QUERY } from '../../sanity/lib/queries'
import { urlFor } from '../../sanity/lib/image'
import type { Wywiad, Artykul } from '../../types'

// Demo data for when Sanity is not yet populated
const demoInterview = {
  tytul: '„Balet to nie ruch — to myśl wyrażona ciałem"',
  slug: { current: 'balet-to-nie-ruch' },
  zajawka: 'Rozmawiamy z jedną z najważniejszych polskich balerin o kulisach nowego sezonu, kontuzjach, które zmieniają perspektywę, i o tym, dlaczego rola Odette jest wciąż najtrudniejsza.',
  rozmowca: {
    imieNazwisko: 'Alina Kowalska',
    rola: 'Pierwsza solistka',
    teatrGlowny: 'Teatr Wielki Warszawa',
  },
}

const demoSideArticles = [
  { tag: 'Premiera · 20.03', tagColor: 'text-gold', title: 'Spartakus wraca do Krakowa po 12 latach', desc: 'Opera Krakowska · reżyseria nowego pokolenia' },
  { tag: 'Gwiazda gościnnie', tagColor: 'text-tag-blue', title: 'Polina Semionova — 3 spektakle w Polsce', desc: 'Gdańsk, Wrocław, Warszawa · marzec–kwiecień 2026' },
  { tag: 'Transmisja online', tagColor: 'text-text-2', title: 'La Bayadère z Bolszoj — oglądaj za darmo', desc: 'Środa 18 marca · 19:00 · HD streaming' },
  { tag: 'Nowy dyrektor artystyczny', tagColor: 'text-tag-green', title: 'Opera Wrocławska ogłasza wielkie zmiany na sezon 2026/27', desc: 'Nowe kierownictwo, nowe otwarcie dla baletu klasycznego' },
]

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
  const title = i?.tytul ?? demoInterview.tytul
  const excerpt = i?.zajawka ?? demoInterview.zajawka
  const personName = i?.rozmowca?.imieNazwisko ?? demoInterview.rozmowca.imieNazwisko
  const personRole = i?.rozmowca?.rola ?? demoInterview.rozmowca.rola
  const personTheater = i?.rozmowca?.teatrGlowny ?? demoInterview.rozmowca.teatrGlowny
  const slug = i?.slug?.current ?? demoInterview.slug.current

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 border-b-[0.5px] border-border">
        {/* Main hero - Interview of the week */}
        <div className="py-7 pr-0 md:pr-7 md:border-r-[0.5px] md:border-border">
          <div className="text-[10px] tracking-[0.11em] uppercase text-gold mb-[10px] flex items-center gap-2 font-medium">
            <span className="block w-[18px] h-[0.5px] bg-gold" />
            Wywiad tygodnia
          </div>
          <h1 className="font-serif text-[36px] md:text-[36px] text-[28px] leading-[1.1] font-normal text-text-1 mb-3">
            {title}
          </h1>
          <div className="text-[12px] text-text-2 mb-[14px] leading-relaxed">
            {personName} — {personRole} · {personTheater}
          </div>
          <p className="text-[13px] text-text-2 leading-[1.8] mb-[22px]">
            {excerpt}
          </p>
          <div className="w-full aspect-video rounded-lg mb-[22px] flex items-center justify-center border-[0.5px] border-border relative overflow-hidden bg-gradient-to-br from-[#f0ece0] via-[#e8dfc8] to-[#f0ece0] dark:from-[#0a0803] dark:via-[#1c1408] dark:to-[#0d0c06]">
            {i?.zdjecie ? (
              <img
                src={urlFor(i.zdjecie).width(800).url()}
                alt={i.zdjecie.alt || title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-serif text-[62px] italic text-gold opacity-[0.12] select-none">
                Świat Baletu
              </span>
            )}
          </div>
          <Link
            href={`/wywiady/${slug}`}
            className="inline-flex items-center gap-[6px] text-[11px] tracking-[0.07em] uppercase text-gold-dim border-[0.5px] border-gold-dim rounded-[2px] px-4 py-2 hover:text-gold hover:border-gold transition-all"
          >
            Czytaj wywiad &rarr;
          </Link>
        </div>

        {/* Side articles */}
        <div className="py-7 pl-0 md:pl-7 flex flex-col border-t-[0.5px] md:border-t-0 border-border">
          {(sideArticles.length > 0 ? sideArticles : demoSideArticles).map((item, idx) => {
            const isDemo = !('_id' in item)
            return (
              <div
                key={isDemo ? idx : (item as Artykul)._id}
                className={`py-[18px] cursor-pointer group ${
                  idx < 3 ? 'border-b-[0.5px] border-border' : ''
                }`}
              >
                <div
                  className={`text-[10px] tracking-[0.1em] uppercase mb-[6px] font-medium ${
                    isDemo ? (item as typeof demoSideArticles[0]).tagColor : 'text-gold'
                  }`}
                >
                  {isDemo ? (item as typeof demoSideArticles[0]).tag : (item as Artykul).kategoria}
                </div>
                <div className="font-serif text-[18px] leading-[1.25] font-normal text-text-1 mb-[5px] group-hover:text-gold transition-colors">
                  {isDemo ? (item as typeof demoSideArticles[0]).title : (item as Artykul).tytul}
                </div>
                <div className="text-[11px] text-text-2 leading-[1.5]">
                  {isDemo ? (item as typeof demoSideArticles[0]).desc : (item as Artykul).zajawka?.slice(0, 80)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
