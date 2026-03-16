import HeroSection from '../../components/home/HeroSection'
import PromoBanner from '../../components/home/PromoBanner'
import RepertoirePreview from '../../components/home/RepertoirePreview'
import ArticlesGrid from '../../components/home/ArticlesGrid'
import ProfilesRow from '../../components/home/ProfilesRow'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PromoBanner />
      <RepertoirePreview />
      <ArticlesGrid />
      <ProfilesRow />
    </>
  )
}
