import Link from 'next/link'
import { client } from '../../../../sanity/lib/client'
import { ALL_PROFILES_QUERY } from '../../../../sanity/lib/queries'
import { urlFor } from '../../../../sanity/lib/image'
import type { Sylwetka } from '../../../../types'

export const metadata = {
  title: 'Sylwetki artystów — Świat Baletu',
  description: 'Baza artystów baletu — tancerze, choreografowie, dyrygenci i legendy.',
}

export default async function ProfilesPage() {
  let profiles: Sylwetka[] = []

  try {
    profiles = await client.fetch(ALL_PROFILES_QUERY)
  } catch {
    // Sanity not configured
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <h1 className="font-serif text-[36px] font-normal text-text-1 mb-2">Sylwetki artystów</h1>
      <p className="text-[13px] text-text-2 mb-8">Tancerze, choreografowie, dyrygenci i legendy sceny baletowej.</p>

      {profiles.length === 0 ? (
        <p className="text-[14px] text-text-2 italic">Brak sylwetek do wyświetlenia.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {profiles.map((profile) => (
            <Link
              key={profile._id}
              href={`/sylwetki/${profile.slug.current}`}
              className="text-center group"
            >
              <div className="w-[100px] h-[100px] rounded-full mx-auto mb-3 bg-bg-section border-[0.5px] border-border flex items-center justify-center overflow-hidden transition-all group-hover:border-gold-dim group-hover:shadow-[var(--shadow-card)]">
                {profile.zdjecie ? (
                  <img
                    src={urlFor(profile.zdjecie).width(200).height(200).url()}
                    alt={profile.imieNazwisko}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-[32px] italic text-gold-dim group-hover:text-gold transition-colors">
                    {profile.imieNazwisko[0]}
                  </span>
                )}
              </div>
              <div className="font-serif text-[15px] text-text-1 leading-[1.3] group-hover:text-gold transition-colors">
                {profile.imieNazwisko}
              </div>
              <div className="text-[11px] text-text-2 mt-1">{profile.rola}</div>
              {profile.teatrGlowny && (
                <div className="text-[10px] text-text-2 mt-[2px]">{profile.teatrGlowny}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
