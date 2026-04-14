import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Świat Baletu — Portal o balecie i operze',
  description:
    'Artykuły, wywiady, repertuar teatrów, sylwetki artystów. Wszystko o balecie i operze w Polsce.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t)document.body.setAttribute('data-theme',t)}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
