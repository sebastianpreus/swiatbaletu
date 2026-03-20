import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createSanityClient } from 'next-sanity'
import { renderNewsletterHtml } from '@/lib/newsletter-template'
import { portableTextToHtml } from '@/lib/portable-to-html'
import { sendEmail } from '@/lib/brevo'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const WELCOME_EMAIL_QUERY = `
  *[_type == "newsletter" && slugId.current == "email-powitalny"][0] {
    _id, tytul, preheader, wstep, tresc, ctaText, ctaLink,
    polecaneArtykuly[]->{ tytul, slug, zajawka, kategoria }
  }
`

export async function POST(req: NextRequest) {
  try {
    const { email, imie } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Podaj prawidłowy adres email' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Sprawdź czy już istnieje
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, aktywny')
      .eq('email', normalizedEmail)
      .single()

    if (existing) {
      if (existing.aktywny) {
        return NextResponse.json(
          { message: 'Ten adres jest już zapisany na newsletter.' },
          { status: 200 }
        )
      }
      // Reaktywuj subskrypcję
      await supabase
        .from('subscribers')
        .update({ aktywny: true, data_reaktywacji: new Date().toISOString() })
        .eq('id', existing.id)

      return NextResponse.json({
        message: 'Witamy ponownie! Twoja subskrypcja została wznowiona.',
      })
    }

    // Nowy subskrybent
    const { error } = await supabase.from('subscribers').insert({
      email: normalizedEmail,
      imie: imie?.trim() || null,
      aktywny: true,
      token_wypisania: Buffer.from(normalizedEmail + ':' + Date.now()).toString('base64'),
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Błąd zapisu. Spróbuj ponownie.' },
        { status: 500 }
      )
    }

    // Wyślij maila powitalnego (await — musi się zakończyć przed zwróceniem odpowiedzi na Vercel)
    try {
      await sendWelcomeEmail(normalizedEmail)
    } catch (err) {
      console.error('Welcome email error:', err)
      // Nie blokuj zapisu — mail powitalny to bonus
    }

    return NextResponse.json({
      message: 'Dziękujemy za zapis! Sprawdź swoją skrzynkę — wysłaliśmy maila powitalnego.',
    })
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return NextResponse.json(
      { error: 'Błąd serwera. Spróbuj ponownie.' },
      { status: 500 }
    )
  }
}

async function sendWelcomeEmail(email: string) {
  // Pobierz treść maila powitalnego z Sanity
  const welcome = await sanity.fetch(WELCOME_EMAIL_QUERY)

  if (!welcome) {
    console.warn('Brak maila powitalnego w Sanity (slugId: "email-powitalny"). Pomijam wysyłkę.')
    return
  }

  const trescHtml = portableTextToHtml(welcome.tresc)

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://swiatbaletu.vercel.app'
  const unsubscribeUrl = `${SITE_URL}/api/newsletter/wypisz?email=${encodeURIComponent(email)}&token=${encodeURIComponent(Buffer.from(email).toString('base64'))}`

  let html = renderNewsletterHtml({
    tytul: welcome.tytul,
    preheader: welcome.preheader,
    wstep: welcome.wstep,
    trescHtml,
    polecaneArtykuly: welcome.polecaneArtykuly?.map((a: { tytul: string; slug: { current: string }; zajawka?: string; kategoria?: string }) => ({
      ...a,
      slug: a.slug?.current || '',
    })),
    ctaText: welcome.ctaText,
    ctaLink: welcome.ctaLink,
  })

  html = html.replace('{{UNSUBSCRIBE_URL}}', unsubscribeUrl)

  await sendEmail({
    to: [{ email }],
    subject: welcome.tytul,
    htmlContent: html,
  })
}
