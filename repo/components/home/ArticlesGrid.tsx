import { getHomepageArticles } from './homepageArticles'
import ContentTabs from './ContentTabs'

export default async function ArticlesGrid() {
  const { kafelki } = await getHomepageArticles()

  if (kafelki.length === 0) {
    return null
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <ContentTabs kafelki={kafelki} />
    </div>
  )
}
