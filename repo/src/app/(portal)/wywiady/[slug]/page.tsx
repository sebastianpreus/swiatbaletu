import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { client } from '../../../../../sanity/lib/client'
import { INTERVIEW_BY_SLUG_QUERY } from '../../../../../sanity/lib/queries'
import { urlFor } from '../../../../../sanity/lib/image'
import { portableTextComponents } from '../../../../../components/portable-text/PortableTextComponents'
import type { Wywiad } from '../../../../../types'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const interview: Wywiad | null = await client.fetch(INTERVIEW_BY_SLUG_QUERY, { slug })
  if (!interview) return { title: 'Wywiad nie znaleziony' }
  return {
    title: `${interview.tytul} — Świat Baletu`,
    description: interview.zajawka,
  }
}

export default async function InterviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const interview: Wywiad | null = await client.fetch(INTERVIEW_BY_SLUG_QUERY, { slug })

  if (!interview) notFound()

  const date = interview.dataPublikacji
    ? new Date(interview.dataPublikacji).toLocaleDateString('pl-PL', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <Link href="/wywiady" className="text-[11px] tracking-[0.07em] uppercase text-gold-dim hover:text-gold transition-colors mb-6 inline-block">
        &larr; Wszystkie wywiady
      </Link>

      <div className="text-[10px] tracking-[0.1em] uppercase text-gold mb-3 font-medium">
        Wywiad
      </div>

      <h1 className="font-serif text-[32px] md:text-[40px] leading-[1.1] font-normal text-text-1 mb-4">
        {interview.tytul}
      </h1>

      {interview.rozmowca && (
        <div className="text-[13px] text-text-2 mb-2">
          Rozmówca:{' '}
          {interview.rozmowca.slug ? (
            <Link href={`/sylwetki/${interview.rozmowca.slug.current}`} className="text-gold hover:underline">
              {interview.rozmowca.imieNazwisko}
            </Link>
          ) : (
            <span className="text-text-1">{interview.rozmowca.imieNazwisko}</span>
          )}
          {' '}— {interview.funkcjaRozmowcy || interview.rozmowca.rola}
        </div>
      )}

      {date && (
        <div className="text-[12px] text-text-2 mb-6 pb-6 border-b-[0.5px] border-border">
          {date}
        </div>
      )}

      {interview.zdjecie && (
        <div className="w-full aspect-video rounded-lg overflow-hidden mb-8 border-[0.5px] border-border">
          <img
            src={urlFor(interview.zdjecie).width(800).url()}
            alt={interview.tytul}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {interview.zajawka && (
        <p className="text-[15px] text-text-1 leading-[1.7] mb-6 font-medium italic">
          {interview.zajawka}
        </p>
      )}

      {interview.tresc && (
        <div className="prose-swiat">
          <PortableText value={interview.tresc} components={portableTextComponents} />
        </div>
      )}
    </div>
  )
}
