import { NextResponse } from 'next/server'

export async function GET() {
  const brevoKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  // Test Brevo connection
  let brevoStatus = 'no key'
  if (brevoKey) {
    try {
      const res = await fetch('https://api.brevo.com/v3/account', {
        headers: { 'api-key': brevoKey },
      })
      const data = await res.json()
      brevoStatus = res.ok ? `OK (${data.companyName})` : `Error: ${data.message}`
    } catch (e) {
      brevoStatus = `Fetch error: ${e}`
    }
  }

  return NextResponse.json({
    brevoKeyExists: !!brevoKey,
    brevoKeyLength: brevoKey?.length || 0,
    brevoKeyPrefix: brevoKey?.substring(0, 10) || 'none',
    senderEmail: senderEmail || 'not set',
    siteUrl: siteUrl || 'not set',
    brevoStatus,
  })
}
