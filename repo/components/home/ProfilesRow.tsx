import Link from 'next/link'
import { client } from '../../sanity/lib/client'
import { FEATURED_PROFILES_QUERY } from '../../sanity/lib/queries'
import { urlFor } from '../../sanity/lib/image'
import type { Sylwetka } from '../../types'
import SectionHeader from '../ui/SectionHeader'

export default async function ProfilesRow() {
  let profiles: Sylwetka[] = []

  try {
    profiles = await client.fetch(FEATURED_PROFILES_QUERY)
  } catch {
    // Sanity not configured yet
  }

  if (!profiles || profiles.length === 0) {
    return null
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <section className="py-7 border-b-[0.5px] border-border">
        <SectionHeader
          title="Sylwetki"
          linkText="Wszystkie profile →"
          linkHref="/sylwetki"
        />
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
          {profiles.map((profile) => (
            <Link
              key={profile._id}
              href={`/sylwetki/${profile.slug.current}`}
              className="shrink-0 w-[106px] cursor-pointer text-center group"
            >
              <div className="w-[72px] h-[72px] rounded-full mx-auto mb-[9px] bg-bg-section border-[0.5px] border-border flex items-center justify-center overflow-hidden transition-all group-hover:bg-bg-hover group-hover:border-gold-dim">
                {profile.zdjecie ? (
                  <img
                    src={urlFor(profile.zdjecie).width(144).height(144).url()}
                    alt={profile.imieNazwisko}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-[24px] italic text-gold-dim group-hover:text-gold transition-colors">
                    {profile.imieNazwisko[0]}
                  </span>
                )}
              </div>
              <div className="font-serif text-[13px] font-normal text-text-1 leading-[1.3]">
                {profile.imieNazwisko}
              </div>
              <div className="text-[10px] text-text-2 mt-[2px]">{profile.rola}</div>
            </Link>
          ))}
          <Link
            href="/sylwetki"
            className="shrink-0 w-[106px] cursor-pointer text-center group"
          >
            <div className="w-[72px] h-[72px] rounded-full mx-auto mb-[9px] bg-bg-section border-[0.5px] border-border flex items-center justify-center transition-all group-hover:bg-bg-hover group-hover:border-gold-dim">
              <span className="font-serif text-[13px] italic text-gold-dim group-hover:text-gold transition-colors">
                +
              </span>
            </div>
            <div className="font-serif text-[13px] font-normal text-text-1 leading-[1.3]">
              Wszyscy
            </div>
            <div className="text-[10px] text-text-2 mt-[2px]">Baza artystów</div>
          </Link>
        </div>
      </section>
    </div>
  )
}
