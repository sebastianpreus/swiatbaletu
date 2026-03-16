import TopBar from '../../../components/layout/TopBar'
import Navigation from '../../../components/layout/Navigation'
import Ticker from '../../../components/layout/Ticker'
import Footer from '../../../components/layout/Footer'

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
    </>
  )
}
