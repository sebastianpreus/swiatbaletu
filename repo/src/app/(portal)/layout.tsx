import TopBar from '../../../components/layout/TopBar'
import Navigation from '../../../components/layout/Navigation'
import Ticker from '../../../components/layout/Ticker'
import Footer from '../../../components/layout/Footer'
import NewsletterPopup from '../../../components/layout/NewsletterPopup'
import CookieBanner from '../../../components/layout/CookieBanner'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <TopBar />
      <Navigation />
      <Ticker />
      <main>{children}</main>
      <Footer />
      <NewsletterPopup />
      <CookieBanner />
    </>
  )
}
