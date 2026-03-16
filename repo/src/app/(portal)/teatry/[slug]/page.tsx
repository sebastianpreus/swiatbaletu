import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import { client } from '../../../../../sanity/lib/client'
import { TEATR_BY_SLUG_QUERY } from '../../../../../sanity/lib/queries'
import { urlFor } from '../../../../../sanity/lib/image'
import { portableTextComponents } from '../../../../../components/portable-text/PortableTextComponents'

interface TeatrSanity {
  _id: string
  nazwa: string
  slug: { current: string }
  miasto: string
  adres?: string
  rokZalozenia?: number
  dyrektorArtystyczny?: string
  liczbaMiejsc?: number
  stronaWww?: string
  linkBilety?: string
  logo?: { asset: { url: string } }
  zdjecie?: { asset: { url: string }; alt?: string }
  opis?: PortableTextBlock[]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const teatr: TeatrSanity | null = await client.fetch(TEATR_BY_SLUG_QUERY, { slug })
  if (!teatr) return { title: 'Teatr nie znaleziony' }
  return {
    title: `${teatr.nazwa} — Świat Baletu`,
    description: `${teatr.nazwa} · ${teatr.miasto}`,
  }
}

export default async function TeatrPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const teatr: TeatrSanity | null = await client.fetch(TEATR_BY_SLUG_QUERY, { slug })

  if (!teatr) notFound()

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <Link href="/teatry" className="text-[11px] tracking-[0.07em] uppercase text-gold-dim hover:text-gold transition-colors mb-6 inline-block">
        &larr; Wszystkie teatry
      </Link>

      {teatr.zdjecie && (
        <div className="w-full aspect-[2.5/1] rounded-lg overflow-hidden mb-6 border-[0.5px] border-border">
          <img
            src={urlFor(teatr.zdjecie).width(800).url()}
            alt={teatr.zdjecie.alt || teatr.nazwa}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="text-[10px] tracking-[0.1em] uppercase text-gold mb-2 font-medium">
        {teatr.miasto}
      </div>

      <h1 className="font-serif text-[32px] md:text-[40px] leading-[1.1] font-normal text-text-1 mb-4">
        {teatr.nazwa}
      </h1>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px] mb-6 pb-6 border-b-[0.5px] border-border">
        {teatr.adres && (
          <div>
            <span className="text-text-2">Adres: </span>
            <span className="text-text-1">{teatr.adres}</span>
          </div>
        )}
        {teatr.rokZalozenia && (
          <div>
            <span className="text-text-2">Rok założenia: </span>
            <span className="text-text-1">{teatr.rokZalozenia}</span>
          </div>
        )}
        {teatr.dyrektorArtystyczny && (
          <div>
            <span className="text-text-2">Dyr. artystyczny: </span>
            <span className="text-text-1">{teatr.dyrektorArtystyczny}</span>
          </div>
        )}
        {teatr.liczbaMiejsc && (
          <div>
            <span className="text-text-2">Sala główna: </span>
            <span className="text-text-1">{teatr.liczbaMiejsc} miejsc</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-8">
        {teatr.stronaWww && (
          <a
            href={teatr.stronaWww}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] tracking-[0.07em] uppercase text-gold-dim border-[0.5px] border-gold-dim rounded-[2px] px-4 py-2 hover:text-gold hover:border-gold transition-all"
          >
            Strona WWW &rarr;
          </a>
        )}
        {teatr.linkBilety && (
          <a
            href={teatr.linkBilety}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] tracking-[0.07em] uppercase bg-gold text-white rounded-[2px] px-4 py-2 hover:bg-gold/90 transition-all"
          >
            Kup bilety &rarr;
          </a>
        )}
      </div>

      {teatr.opis && (
        <div className="prose-swiat">
          <PortableText value={teatr.opis} components={portableTextComponents} />
        </div>
      )}
    </div>
  )
}
