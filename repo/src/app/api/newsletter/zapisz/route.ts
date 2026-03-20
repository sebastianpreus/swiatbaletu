import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    return NextResponse.json({
      message: 'Dziękujemy za zapis! Wkrótce otrzymasz pierwszy newsletter.',
    })
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return NextResponse.json(
      { error: 'Błąd serwera. Spróbuj ponownie.' },
      { status: 500 }
    )
  }
}
