import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { client } from '../../../../../sanity/lib/client'
import { ARTICLE_BY_SLUG_QUERY } from '../../../../../sanity/lib/queries'
import { urlFor } from '../../../../../sanity/lib/image'
import { portableTextComponents } from '../../../../../components/portable-text/PortableTextComponents'
import type { Artykul } from '../../../../../types'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article: Artykul | null = await client.fetch(ARTICLE_BY_SLUG_QUERY, { slug })
  if (!article) return { title: 'Artykuł nie znaleziony' }
  return {
    title: `${article.tytul} — Świat Baletu`,
    description: article.zajawka,
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article: Artykul | null = await client.fetch(ARTICLE_BY_SLUG_QUERY, { slug })

  if (!article) notFound()

  const date = article.dataPublikacji
    ? new Date(article.dataPublikacji).toLocaleDateString('pl-PL', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <Link href="/artykuly" className="text-[11px] tracking-[0.07em] uppercase text-gold-dim hover:text-gold transition-colors mb-6 inline-block">
        &larr; Wszystkie artykuły
      </Link>

      {article.kategoria && (
        <div className="text-[10px] tracking-[0.1em] uppercase text-gold mb-3 font-medium">
          {article.kategoria}
        </div>
      )}

      <h1 className="font-serif text-[32px] md:text-[40px] leading-[1.1] font-normal text-text-1 mb-4">
        {article.tytul}
      </h1>

      {article.zajawka && (
        <p className="text-[15px] text-text-2 leading-[1.7] mb-6">
          {article.zajawka}
        </p>
      )}

      <div className="flex items-center gap-3 text-[12px] text-text-2 mb-8 pb-6 border-b-[0.5px] border-border">
        {article.autor && <span>{article.autor}</span>}
        {date && <span>· {date}</span>}
        {article.czasCzytania && <span>· {article.czasCzytania} min czytania</span>}
      </div>

      {article.zdjecie && (
        <div className="w-full aspect-video rounded-lg overflow-hidden mb-8 border-[0.5px] border-border">
          <img
            src={urlFor(article.zdjecie).width(800).url()}
            alt={article.zdjecie.alt || article.tytul}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {article.trescGlowna && (
        <div className="prose-swiat">
          <PortableText value={article.trescGlowna} components={portableTextComponents} />
        </div>
      )}

      {article.tagi && article.tagi.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t-[0.5px] border-border">
          {article.tagi.map((tag) => (
            <span key={tag} className="text-[10px] tracking-[0.08em] uppercase text-text-2 bg-bg-section px-3 py-1 rounded-[2px] border-[0.5px] border-border">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
