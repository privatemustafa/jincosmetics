/**
 * Curated Unsplash editorial images for Jin Cosmetics sections.
 * Run: node scripts/fetch-editorial.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public/images/editorial')

const IMAGES = [
  {
    file: 'testimonial-ritual.jpg',
    url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1600&q=85&auto=format&fit=crop',
    credit: 'Unsplash',
  },
  {
    file: 'about-editorial.jpg',
    url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1600&q=85&auto=format&fit=crop',
    credit: 'Unsplash',
  },
  {
    file: 'studio-interior.jpg',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1400&q=85&auto=format&fit=crop',
    credit: 'Unsplash',
  },
  {
    file: 'newsletter-mood.jpg',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1800&q=85&auto=format&fit=crop',
    credit: 'Unsplash',
  },
]

await mkdir(outDir, { recursive: true })

for (const img of IMAGES) {
  const res = await fetch(img.url)
  if (!res.ok) throw new Error(`Failed ${img.file}: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(path.join(outDir, img.file), buf)
  console.log(`✓ ${img.file}`)
}

await writeFile(
  path.join(outDir, 'credits.json'),
  JSON.stringify(IMAGES.map(({ file, credit }) => ({ file, credit })), null, 2)
)

console.log('Done.')
