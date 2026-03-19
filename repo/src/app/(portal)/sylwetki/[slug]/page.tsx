import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { client } from '../../../../../sanity/lib/client'
import { PROFILE_BY_SLUG_QUERY } from '../../../../../sanity/lib/queries'
import { urlFor } from '../../../../../sanity/lib/image'
import { portableTextComponents } from '../../../../../components/portable-text/PortableTextComponents'
import type { Sylwetka } from '../../../../../types'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const profile: Sylwetka | null = await client.fetch(PROFILE_BY_SLUG_QUERY, { slug })
  if (!profile) return { title: 'Sylwetka nie znaleziona' }
  return {
    title: `${profile.imieNazwisko} — Świat Baletu`,
    description: `${profile.rola} · ${profile.teatrGlowny || ''}`,
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const profile: Sylwetka | null = await client.fetch(PROFILE_BY_SLUG_QUERY, { slug })

  if (!profile) notFound()

  const birthYear = profile.dataUrodzenia
    ? new Date(profile.dataUrodzenia).getFullYear()
    : null
  const deathYear = profile.dataSmierci
    ? new Date(profile.dataSmierci).getFullYear()
    : null

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <Link href="/sylwetki" className="text-[11px] tracking-[0.07em] uppercase text-gold-dim hover:text-gold transition-colors mb-6 inline-block">
        &larr; Wszystkie sylwetki
      </Link>

      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="w-[140px] h-[140px] rounded-full shrink-0 bg-bg-section border-[0.5px] border-border flex items-center justify-center overflow-hidden">
          {profile.zdjecie ? (
            <img
              src={urlFor(profile.zdjecie).width(280).height(280).url()}
              alt={profile.imieNazwisko}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-serif text-[48px] italic text-gold opacity-30">
              {profile.imieNazwisko[0]}
            </span>
          )}
        </div>
        <div>
          <h1 className="font-serif text-[32px] md:text-[40px] leading-[1.1] font-normal text-text-1 mb-2">
            {profile.imieNazwisko}
          </h1>
          <div className="text-[13px] text-gold mb-1">{profile.rola}</div>
          {profile.teatrGlowny && (
            <div className="text-[13px] text-text-2 mb-1">{profile.teatrGlowny}</div>
          )}
          <div className="text-[12px] text-text-2 flex flex-wrap gap-3 mt-2">
            {profile.narodowosc && <span>{profile.narodowosc}</span>}
            {birthYear && (
              <span>
                {birthYear}{deathYear ? `–${deathYear}` : ''}
              </span>
            )}
            {profile.aktywny !== undefined && (
              <span className={profile.aktywny ? 'text-green-600' : 'text-text-2'}>
                {profile.aktywny ? 'Aktywny/a' : 'Nieaktywny/a'}
              </span>
            )}
          </div>
        </div>
      </div>

      {profile.najwazniejszeRole && profile.najwazniejszeRole.length > 0 && (
        <div className="mb-8 pb-6 border-b-[0.5px] border-border">
          <h2 className="font-serif text-[18px] text-text-1 mb-3">Najważniejsze role</h2>
          <div className="flex flex-wrap gap-2">
            {profile.najwazniejszeRole.map((role) => (
              <span key={role} className="text-[11px] text-text-2 bg-bg-section px-3 py-1 rounded-[2px] border-[0.5px] border-border">
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.bio && (
        <div className="prose-swiat">
          <PortableText value={profile.bio} components={portableTextComponents} />
        </div>
      )}

      {profile.galeria && profile.galeria.length > 0 && (
        <div className="mt-10 pt-6 border-t-[0.5px] border-border">
          <h2 className="font-serif text-[18px] text-text-1 mb-4">Galeria</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {profile.galeria.map((img: { asset: unknown; alt?: string; caption?: string }, idx: number) => (
              <figure key={idx} className="overflow-hidden rounded-[6px] border-[0.5px] border-border">
                <img
                  src={urlFor(img).width(400).height(300).url()}
                  alt={img.alt || profile.imieNazwisko}
                  className="w-full h-[200px] object-cover"
                />
                {img.caption && (
                  <figcaption className="text-[10px] text-text-2 px-2 py-1.5 bg-bg-section">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
