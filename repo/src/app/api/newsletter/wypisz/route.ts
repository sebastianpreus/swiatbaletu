import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  const token = req.nextUrl.searchParams.get('token')

  if (!email || !token) {
    return new NextResponse(renderPage('Nieprawidłowy link wypisania.', true), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  try {
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('id, aktywny')
      .eq('email', email.toLowerCase())
      .single()

    if (!subscriber) {
      return new NextResponse(renderPage('Nie znaleziono takiego adresu w naszej bazie.', true), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    if (!subscriber.aktywny) {
      return new NextResponse(renderPage('Ten adres został już wypisany z newslettera.'), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    await supabase
      .from('subscribers')
      .update({
        aktywny: false,
        data_wypisania: new Date().toISOString(),
      })
      .eq('id', subscriber.id)

    return new NextResponse(
      renderPage('Zostałeś/aś wypisany/a z newslettera Świat Baletu. Będzie nam Ciebie brakować! 🩰'),
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return new NextResponse(renderPage('Wystąpił błąd. Spróbuj ponownie.', true), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}

function renderPage(message: string, isError = false) {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter — Świat Baletu</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; padding: 40px 20px; background: #FAFAF8; font-family: 'DM Sans', sans-serif; color: #1a1814; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { max-width: 460px; background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 4px; padding: 48px 40px; text-align: center; }
    .logo { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600; color: #1a1814; margin-bottom: 24px; }
    .message { font-size: 15px; line-height: 1.6; color: ${isError ? '#c0392b' : '#6b6457'}; margin-bottom: 24px; }
    .link { color: #A8832A; text-decoration: none; font-size: 14px; }
    .link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🩰 Świat Baletu</div>
    <div class="message">${message}</div>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://swiatbaletu.vercel.app'}" class="link">← Wróć na portal</a>
  </div>
</body>
</html>`
}
