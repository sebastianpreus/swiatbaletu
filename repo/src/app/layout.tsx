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
      <body>{children}</body>
    </html>
  )
}
