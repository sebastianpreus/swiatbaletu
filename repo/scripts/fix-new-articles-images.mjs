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

async function uploadAndPatch(url, filename, docId, alt) {
  console.log(`Downloading ${filename}...`)
  const res = await fetch(url)
  if (!res.ok) { console.log(`  FAIL ${res.status}`); return }
  const buf = Buffer.from(await res.arrayBuffer())
  console.log(`  Uploading ${(buf.length / 1024).toFixed(0)}KB...`)
  const asset = await client.assets.upload('image', buf, { filename })
  await client.patch(docId).set({
    zdjecie: {
      _type: 'image',
      alt,
      asset: { _type: 'reference', _ref: asset._id },
    },
  }).commit()
  console.log(`  ✓ ${docId}`)
}

console.log('=== Adding images to new articles ===')

await uploadAndPatch(
  'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80',
  'giselle-romantic.jpg',
  'art-giselle-romantyzm',
  'Giselle — scena baletowa w romantycznym stylu'
)

await uploadAndPatch(
  'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800&q=80',
  'ballet-school.jpg',
  'art-polskie-szkoly',
  'Młoda tancerka podczas treningu baletowego'
)

await uploadAndPatch(
  'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80',
  'music-ballet.jpg',
  'art-muzyka-baletu',
  'Orkiestra i scena baletowa'
)

console.log('=== Done! ===')
