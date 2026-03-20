interface ArticleLink {
  tytul: string
  slug: string
  zajawka?: string
  kategoria?: string
}

interface NewsletterData {
  tytul: string
  preheader?: string
  wstep?: string
  trescHtml: string
  polecaneArtykuly?: ArticleLink[]
  ctaText?: string
  ctaLink?: string
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://swiatbaletu.vercel.app'

export function renderNewsletterHtml(data: NewsletterData): string {
  const {
    tytul,
    preheader,
    wstep,
    trescHtml,
    polecaneArtykuly = [],
    ctaText = 'Odwiedź Świat Baletu',
    ctaLink = SITE_URL,
  } = data

  const articlesHtml = polecaneArtykuly.length > 0
    ? `
      <tr>
        <td style="padding: 0 40px 30px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e8e0cc; padding-top: 24px;">
            <tr>
              <td style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; color: #A8832A; padding-bottom: 16px; font-weight: 600;">
                Polecane na portalu
              </td>
            </tr>
            ${polecaneArtykuly.map(art => `
              <tr>
                <td style="padding-bottom: 14px;">
                  ${art.kategoria ? `<span style="font-family: 'DM Sans', Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #A8832A;">${art.kategoria}</span><br/>` : ''}
                  <a href="${SITE_URL}/artykuly/${art.slug}" style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 17px; color: #1a1814; text-decoration: none; font-weight: 600; line-height: 1.3;">
                    ${art.tytul}
                  </a>
                  ${art.zajawka ? `<br/><span style="font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; color: #6b6457; line-height: 1.4;">${art.zajawka.substring(0, 120)}${art.zajawka.length > 120 ? '...' : ''}</span>` : ''}
                </td>
              </tr>
            `).join('')}
          </table>
        </td>
      </tr>
    `
    : ''

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${tytul}</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:#FAFAF8;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
  <!--[if mso]>
  <style>
    table { border-collapse: collapse; }
    .fallback-font { font-family: Georgia, serif; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #FAFAF8; font-family: 'DM Sans', Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAF8; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 4px;">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; border-bottom: 1px solid rgba(0,0,0,0.08); text-align: center;">
              <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; color: #A8832A; margin-bottom: 4px;">
                🩰
              </div>
              <a href="${SITE_URL}" style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 26px; font-weight: 600; color: #1a1814; text-decoration: none; letter-spacing: 1px;">
                Świat Baletu
              </a>
              <div style="font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: #a09880; margin-top: 4px; letter-spacing: 0.5px;">
                Newsletter
              </div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding: 30px 40px 10px;">
              <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 600; color: #1a1814; margin: 0; line-height: 1.3;">
                ${tytul}
              </h1>
            </td>
          </tr>

          ${wstep ? `
          <!-- Intro -->
          <tr>
            <td style="padding: 10px 40px 20px;">
              <p style="font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; color: #6b6457; margin: 0; line-height: 1.6; font-style: italic;">
                ${wstep}
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- Gold separator -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <div style="height: 2px; background: linear-gradient(90deg, #A8832A, #C9A84C, #A8832A); border-radius: 1px;"></div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 30px; font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; color: #1a1814; line-height: 1.7;">
              ${trescHtml}
            </td>
          </tr>

          ${articlesHtml}

          <!-- CTA Button -->
          <tr>
            <td style="padding: 10px 40px 36px;" align="center">
              <a href="${ctaLink}" style="display: inline-block; padding: 14px 36px; background-color: #A8832A; color: #FFFFFF; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 3px; letter-spacing: 0.5px;">
                ${ctaText}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid rgba(0,0,0,0.08); text-align: center;">
              <p style="font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: #a09880; margin: 0 0 8px; line-height: 1.5;">
                Otrzymujesz tę wiadomość, ponieważ zapisałeś/aś się na newsletter Świat Baletu.
              </p>
              <a href="{{UNSUBSCRIBE_URL}}" style="font-family: 'DM Sans', Arial, sans-serif; font-size: 11px; color: #A8832A; text-decoration: underline;">
                Wypisz się z newslettera
              </a>
              <p style="font-family: 'DM Sans', Arial, sans-serif; font-size: 10px; color: #c8c0b0; margin: 12px 0 0;">
                &copy; ${new Date().getFullYear()} Świat Baletu &middot; swiatbaletu.vercel.app
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
