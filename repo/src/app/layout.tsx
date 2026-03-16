import type { Metadata } from 'next'
import './globals.css'
import TopBar from '../../components/layout/TopBar'
import Navigation from '../../components/layout/Navigation'
import Ticker from '../../components/layout/Ticker'
import Footer from '../../components/layout/Footer'

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
        <TopBar />
        <Navigation />
        <Ticker />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
