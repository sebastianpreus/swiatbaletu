import { createClient } from 'next-sanity'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env.local') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function uploadImg(url, filename) {
  console.log(`  Downloading ${filename}...`)
  const res = await fetch(url)
  if (!res.ok) { console.log(`  FAIL ${res.status}`); return null }
  const buf = Buffer.from(await res.arrayBuffer())
  console.log(`  Uploading ${(buf.length / 1024).toFixed(0)}KB...`)
  const asset = await client.assets.upload('image', buf, { filename })
  return asset._id
}

// 1. Fix art-diaghilew cover (ballet_classic was 404)
console.log('--- Fixing art-diaghilew cover ---')
const classicId = await uploadImg(
  'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80',
  'ballet-classic-fix.jpg'
)
if (classicId) {
  await client.patch('art-diaghilew').set({
    zdjecie: { _type: 'image', alt: 'Balet klasyczny', asset: { _type: 'reference', _ref: classicId } }
  }).commit()
  console.log('  ✓ art-diaghilew cover fixed')
}

// 2. Add inline image to art-pointy (ballet_rehearsal was 404)
console.log('--- Fixing art-pointy inline image ---')
const rehearsalId = await uploadImg(
  'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&q=80',
  'ballet-rehearsal-fix.jpg'
)
if (rehearsalId) {
  const article = await client.fetch(`*[_id == $id][0]{trescGlowna}`, { id: 'art-pointy' })
  const body = article?.trescGlowna || []
  const mid = Math.floor(body.length / 2)
  const imgBlock = {
    _type: 'image',
    _key: 'img-fix-' + Date.now(),
    alt: 'Próba baletowa — praca nad techniką pointową',
    asset: { _type: 'reference', _ref: rehearsalId },
  }
  const newBody = [...body.slice(0, mid), imgBlock, ...body.slice(mid)]
  await client.patch('art-pointy').set({ trescGlowna: newBody }).commit()
  console.log('  ✓ art-pointy inline image added')
}

console.log('\n=== Fix complete! ===')
