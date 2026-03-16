/**
 * Upload ballet images from Unsplash to Sanity documents
 * Run: node repo/scripts/upload-images.mjs
 */
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

// Unsplash images (free to use, no API key needed for direct URLs)
// Using specific photo IDs for ballet-related images
const IMAGES = {
  // Interviews & hero
  ballerina_portrait: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80',
  ballet_stage: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80',
  ballet_dance: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&q=80',
  // Articles
  pointe_shoes: 'https://images.unsplash.com/photo-1549989476-69a92fa57c36?w=800&q=80',
  ballet_performance: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80',
  ballet_classic: 'https://images.unsplash.com/photo-1509670572995-5023c233f3f0?w=800&q=80',
  // Profiles
  dancer_1: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=400&q=80',
  dancer_2: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&q=80',
  dancer_3: 'https://images.unsplash.com/photo-1562771379-eafdca7a02f8?w=400&q=80',
  dancer_4: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
  // Theaters
  theater_1: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80',
  theater_2: 'https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=800&q=80',
  theater_3: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&q=80',
  // Extra for article body
  ballet_rehearsal: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
  ballet_tutu: 'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044?w=800&q=80',
}

async function uploadImageFromUrl(url, filename) {
  console.log(`  Downloading ${filename}...`)
  const response = await fetch(url)
  if (!response.ok) {
    console.log(`  Warning: Failed to download ${filename} (${response.status}), skipping`)
    return null
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  console.log(`  Uploading ${filename} to Sanity (${(buffer.length / 1024).toFixed(0)}KB)...`)
  const asset = await client.assets.upload('image', buffer, { filename })
  return asset._id
}

async function patchImage(docId, fieldName, assetId, alt) {
  if (!assetId) return
  await client.patch(docId).set({
    [fieldName]: {
      _type: 'image',
      alt: alt || '',
      asset: { _type: 'reference', _ref: assetId },
    },
  }).commit()
  console.log(`  ✓ Updated ${docId} → ${fieldName}`)
}

async function addImageToArticleBody(docId, assetId, alt) {
  if (!assetId) return
  // Fetch current article
  const article = await client.fetch(`*[_id == $id][0]{trescGlowna}`, { id: docId })
  const currentBody = article?.trescGlowna || []

  // Insert image block in the middle of the content
  const midpoint = Math.floor(currentBody.length / 2)
  const imageBlock = {
    _type: 'image',
    _key: 'img-' + Date.now(),
    alt: alt || '',
    asset: { _type: 'reference', _ref: assetId },
  }

  const newBody = [
    ...currentBody.slice(0, midpoint),
    imageBlock,
    ...currentBody.slice(midpoint),
  ]

  await client.patch(docId).set({ trescGlowna: newBody }).commit()
  console.log(`  ✓ Added inline image to ${docId} article body`)
}

// ── Main ──────────────────────────────────────────────────────────────────

console.log('=== Uploading images to Sanity ===\n')

// 1. Interviews
console.log('--- Wywiady ---')
const heroImg = await uploadImageFromUrl(IMAGES.ballerina_portrait, 'ballerina-portrait.jpg')
await patchImage('wywiad-kowalska', 'zdjecie', heroImg, 'Baletnica w pozie artystycznej')

const stageImg = await uploadImageFromUrl(IMAGES.ballet_stage, 'ballet-stage.jpg')
await patchImage('wywiad-nowak-spartakus', 'zdjecie', stageImg, 'Scena baletowa')

const danceImg = await uploadImageFromUrl(IMAGES.ballet_dance, 'ballet-dance.jpg')
await patchImage('wywiad-semionova', 'zdjecie', danceImg, 'Tancerka baletowa w ruchu')

// 2. Articles - cover images
console.log('\n--- Artykuły (okładki) ---')
const pointeImg = await uploadImageFromUrl(IMAGES.pointe_shoes, 'pointe-shoes.jpg')
await patchImage('art-pointy', 'zdjecie', pointeImg, 'Buty baletowe pointy')

const perfImg = await uploadImageFromUrl(IMAGES.ballet_performance, 'ballet-performance.jpg')
await patchImage('art-don-kichot', 'zdjecie', perfImg, 'Występ baletowy na scenie')

const classicImg = await uploadImageFromUrl(IMAGES.ballet_classic, 'ballet-classic.jpg')
await patchImage('art-diaghilew', 'zdjecie', classicImg, 'Balet klasyczny')

// 3. Articles - inline body images
console.log('\n--- Artykuły (zdjęcia w treści) ---')
const rehearsalImg = await uploadImageFromUrl(IMAGES.ballet_rehearsal, 'ballet-rehearsal.jpg')
await addImageToArticleBody('art-pointy', rehearsalImg, 'Próba baletowa — praca nad techniką pointową')

const tutuImg = await uploadImageFromUrl(IMAGES.ballet_tutu, 'ballet-tutu.jpg')
await addImageToArticleBody('art-don-kichot', tutuImg, 'Kostium baletowy — detal z przedstawienia')

await addImageToArticleBody('art-diaghilew', stageImg, 'Scena baletowa — nawiązanie do tradycji Ballets Russes')

// 4. Profiles
console.log('\n--- Sylwetki ---')
const d1 = await uploadImageFromUrl(IMAGES.dancer_1, 'dancer-1.jpg')
const d2 = await uploadImageFromUrl(IMAGES.dancer_2, 'dancer-2.jpg')
const d3 = await uploadImageFromUrl(IMAGES.dancer_3, 'dancer-3.jpg')
const d4 = await uploadImageFromUrl(IMAGES.dancer_4, 'dancer-4.jpg')

await patchImage('sylwetka-nureyev', 'zdjecie', d1, 'Rudolf Nureyev')
await patchImage('sylwetka-copeland', 'zdjecie', d2, 'Misty Copeland')
await patchImage('sylwetka-acosta', 'zdjecie', d3, 'Carlos Acosta')
await patchImage('sylwetka-cojocaru', 'zdjecie', d4, 'Alina Cojocaru')
await patchImage('sylwetka-kowalska', 'zdjecie', heroImg, 'Alina Kowalska')
await patchImage('sylwetka-guillem', 'zdjecie', danceImg, 'Sylvie Guillem')
await patchImage('sylwetka-nunez', 'zdjecie', perfImg, 'Marianela Nuñez')

// 5. Theaters
console.log('\n--- Teatry ---')
const t1 = await uploadImageFromUrl(IMAGES.theater_1, 'theater-opera.jpg')
const t2 = await uploadImageFromUrl(IMAGES.theater_2, 'theater-interior.jpg')
const t3 = await uploadImageFromUrl(IMAGES.theater_3, 'theater-hall.jpg')

await patchImage('teatr-warszawa', 'zdjecie', t1, 'Teatr Wielki — Opera Narodowa')
await patchImage('teatr-krakow', 'zdjecie', t2, 'Opera Krakowska')
await patchImage('teatr-wroclaw', 'zdjecie', t3, 'Opera Wrocławska')
await patchImage('teatr-gdansk', 'zdjecie', t1, 'Opera Bałtycka')
await patchImage('teatr-lodz', 'zdjecie', t2, 'Teatr Wielki w Łodzi')
await patchImage('teatr-poznan', 'zdjecie', t3, 'Teatr Wielki w Poznaniu')

console.log('\n=== Done! All images uploaded and assigned. ===')
