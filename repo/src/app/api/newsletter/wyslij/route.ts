import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { renderNewsletterHtml } from '@/lib/newsletter-template'
import { sendBatchEmails } from '@/lib/brevo'
import { portableTextToHtml } from '@/lib/portable-to-html'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const NEWSLETTER_QUERY = `
  *[_type == "newsletter" && _id == $id][0] {
    _id, tytul, preheader, wstep, tresc, ctaText, ctaLink, status,
    polecaneArtykuly[]->{ tytul, slug, zajawka, kategoria }
  }
`

export async function POST(req: NextRequest) {
  try {
    // Proste zabezpieczenie — klucz API
    const authHeader = req.headers.get('authorization')
    const apiKey = process.env.NEWSLETTER_API_KEY

    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 })
    }

    const { id, testEmail } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Brak ID newslettera' }, { status: 400 })
    }

    // Pobierz newsletter z Sanity
    const newsletter = await sanityClient.fetch(NEWSLETTER_QUERY, { id })

    if (!newsletter) {
      return NextResponse.json({ error: 'Nie znaleziono newslettera' }, { status: 404 })
    }

    if (newsletter.status === 'wyslany' && !testEmail) {
      return NextResponse.json({ error: 'Ten newsletter został już wysłany' }, { status: 400 })
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

    // Tryb testowy — wyślij tylko do jednego adresu
    if (testEmail) {
      const results = await sendBatchEmails(
        [{ email: testEmail }],
        newsletter.tytul,
        html
      )
      return NextResponse.json({
        message: `Mail testowy wysłany na ${testEmail}`,
        results,
      })
    }

    // Tryb produkcyjny — wyślij do wszystkich aktywnych subskrybentów
    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('email, imie')
      .eq('aktywny', true)

    if (subError || !subscribers?.length) {
      return NextResponse.json(
        { error: 'Brak aktywnych subskrybentów lub błąd bazy' },
        { status: 400 }
      )
    }

    const results = await sendBatchEmails(subscribers, newsletter.tytul, html)

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    // Zaktualizuj status w Sanity
    await sanityClient
      .patch(newsletter._id)
      .set({
        status: 'wyslany',
        dataWyslania: new Date().toISOString(),
        liczbaOdbiorcow: successCount,
      })
      .commit()

    return NextResponse.json({
      message: `Newsletter wysłany! Sukces: ${successCount}, błędy: ${failCount}`,
      successCount,
      failCount,
      total: subscribers.length,
    })
  } catch (error) {
    console.error('Newsletter send error:', error)
    return NextResponse.json(
      { error: 'Błąd wysyłki: ' + String(error) },
      { status: 500 }
    )
  }
}
