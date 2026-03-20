import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { renderNewsletterHtml } from '@/lib/newsletter-template'
import { portableTextToHtml } from '@/lib/portable-to-html'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const NEWSLETTER_QUERY = `
  *[_type == "newsletter" && _id == $id][0] {
    _id, tytul, preheader, wstep, tresc, ctaText, ctaLink, status,
    polecaneArtykuly[]->{ tytul, slug, zajawka, kategoria }
  }
`

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Brak parametru id' }, { status: 400 })
  }

  try {
    const newsletter = await sanityClient.fetch(NEWSLETTER_QUERY, { id })

    if (!newsletter) {
      return NextResponse.json({ error: 'Nie znaleziono newslettera' }, { status: 404 })
    }

    const trescHtml = portableTextToHtml(newsletter.tresc)

    const html = renderNewsletterHtml({
      tytul: newsletter.tytul,
      preheader: newsletter.preheader,
      wstep: newsletter.wstep,
      trescHtml,
      polecaneArtykuly: newsletter.polecaneArtykuly?.map((a: { tytul: string; slug: { current: string }; zajawka?: string; kategoria?: string }) => ({
        ...a,
        slug: a.slug?.current || '',
      })),
      ctaText: newsletter.ctaText,
      ctaLink: newsletter.ctaLink,
    })

    // Zamień placeholder na przykładowy link
    const previewHtml = html.replace(
      '{{UNSUBSCRIBE_URL}}',
      '#wypisz-podglad'
    )

    return new NextResponse(previewHtml, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    console.error('Newsletter preview error:', error)
    return NextResponse.json({ error: 'Błąd generowania podglądu' }, { status: 500 })
  }
}
