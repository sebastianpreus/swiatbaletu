import Link from 'next/link'
import { client } from '../../../../sanity/lib/client'
import { ALL_INTERVIEWS_QUERY } from '../../../../sanity/lib/queries'
import { urlFor } from '../../../../sanity/lib/image'
import type { Wywiad } from '../../../../types'

export const metadata = {
  title: 'Wywiady — Świat Baletu',
  description: 'Rozmowy z artystami, choreografami i dyrygentami ze świata baletu.',
}

export default async function InterviewsPage() {
  let interviews: Wywiad[] = []

  try {
    interviews = await client.fetch(ALL_INTERVIEWS_QUERY)
  } catch {
    // Sanity not configured
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <h1 className="font-serif text-[36px] font-normal text-text-1 mb-2">Wywiady</h1>
      <p className="text-[13px] text-text-2 mb-8">Rozmowy z artystami, choreografami i osobowościami sceny baletowej.</p>

      {interviews.length === 0 ? (
        <p className="text-[14px] text-text-2 italic">Brak wywiadów do wyświetlenia.</p>
      ) : (
        <div className="space-y-6">
          {interviews.map((interview) => (
            <Link
              key={interview._id}
              href={`/wywiady/${interview.slug.current}`}
              className="flex flex-col sm:flex-row gap-5 group py-5 border-b-[0.5px] border-border"
            >
              <div className="w-full sm:w-[240px] shrink-0 aspect-[3/2] rounded-lg overflow-hidden border-[0.5px] border-border flex items-center justify-center transition-all group-hover:border-gold-dim">
                {interview.zdjecie ? (
                  <img
                    src={urlFor(interview.zdjecie).width(480).url()}
                    alt={interview.tytul}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-[30px] italic text-gold opacity-20">W</span>
                )}
              </div>
              <div className="flex-1">
                {interview.wywiadTygodnia && (
                  <div className="text-[10px] tracking-[0.1em] uppercase text-gold mb-2 font-medium">
                    Wywiad tygodnia
                  </div>
                )}
                <div className="font-serif text-[22px] leading-[1.2] text-text-1 mb-2 group-hover:text-gold transition-colors">
                  {interview.tytul}
                </div>
                {interview.rozmowca && (
                  <div className="text-[12px] text-text-2 mb-2">
                    {interview.rozmowca.imieNazwisko} — {interview.rozmowca.rola} · {interview.rozmowca.teatrGlowny}
                  </div>
                )}
                {interview.zajawka && (
                  <p className="text-[13px] text-text-2 leading-[1.7] line-clamp-2">
                    {interview.zajawka}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
