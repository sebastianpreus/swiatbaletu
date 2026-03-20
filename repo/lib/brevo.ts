const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const BREVO_API_URL = 'https://api.brevo.com/v3'

interface SendEmailParams {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  sender?: { name: string; email: string }
  replyTo?: { name: string; email: string }
}

export async function sendEmail(params: SendEmailParams) {
  const { to, subject, htmlContent, sender, replyTo } = params

  const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: sender || {
        name: 'Świat Baletu',
        email: process.env.BREVO_SENDER_EMAIL || 'newsletter@swiatbaletu.pl',
      },
      to,
      subject,
      htmlContent,
      replyTo: replyTo || {
        name: 'Świat Baletu',
        email: process.env.BREVO_SENDER_EMAIL || 'newsletter@swiatbaletu.pl',
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Brevo API error: ${JSON.stringify(error)}`)
  }

  return response.json()
}

export async function sendBatchEmails(
  recipients: { email: string; name?: string }[],
  subject: string,
  htmlContent: string
) {
  // Brevo pozwala max 50 odbiorców na raz w jednym API call
  // Ale lepiej wysyłać po jednym żeby personalizować link wypisania
  const BATCH_SIZE = 50
  const results = []

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)
    // Dla każdego odbiorcy personalizujemy link wypisania
    for (const recipient of batch) {
      const personalizedHtml = htmlContent.replace(
        '{{UNSUBSCRIBE_URL}}',
        `${process.env.NEXT_PUBLIC_SITE_URL || 'https://swiatbaletu.vercel.app'}/api/newsletter/wypisz?email=${encodeURIComponent(recipient.email)}&token=${encodeURIComponent(Buffer.from(recipient.email).toString('base64'))}`
      )
      try {
        const result = await sendEmail({
          to: [{ email: recipient.email, name: recipient.name }],
          subject,
          htmlContent: personalizedHtml,
        })
        results.push({ email: recipient.email, success: true, result })
      } catch (error) {
        results.push({ email: recipient.email, success: false, error: String(error) })
      }
    }
  }

  return results
}
