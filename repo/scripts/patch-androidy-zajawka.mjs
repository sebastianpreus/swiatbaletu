import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '..', '.env.local')
const env = {}
readFileSync(envPath, 'utf8').split('\n').forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim()
})

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: env.SANITY_API_TOKEN,
  useCdn: false,
})

const ARTICLE_ID = 'QQPI8EE9dTLPal9ynhGhjv'

const newZajawka = 'Pointy i cyberpunk. Klasyczna technika baletowa i świat rodem z science-fiction. To zestawienie rzadko spotyka się na scenie – a „Androidy" Polskiego Baletu Narodowego właśnie na nim stoją. Dwuaktowy balet Roberta Bondary, do oryginalnej muzyki Przemysława Zycha, miał premierę 10 maja 2026 r. Akcja toczy się w świecie po katastrofie ekologicznej, w którym łowca tropi zbuntowane androidy. To kolejny w tym roku polski spektakl baletowy o sztucznej inteligencji – po „Metropolis – Refleksje naszych czasów" z Opery Bałtyckiej.'

const result = await client
  .patch(ARTICLE_ID)
  .set({ zajawka: newZajawka })
  .commit()

console.log('✅ Zajawka zaktualizowana:', result._id)
