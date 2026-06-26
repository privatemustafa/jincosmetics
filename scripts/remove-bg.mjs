import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

async function removeBg(input, output) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const sat = max - min
    const lum = (r + g + b) / 3
    if (lum > 200 && sat < 35) {
      const alpha = lum > 230 ? 0 : Math.floor((230 - lum) * 6)
      data[i + 3] = Math.min(data[i + 3], Math.max(0, alpha))
    }
    if (lum > 180 && sat < 20) {
      data[i + 3] = Math.min(data[i + 3], Math.floor((210 - lum) * 4))
    }
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 15 })
    .png()
    .toFile(output)
  const m = await sharp(output).metadata()
  console.log('OK', path.basename(output), `${m.width}x${m.height}`)
}

const assets = '/Users/mustafagumus/.cursor/projects/Users-mustafagumus-Documents-JINCOSMETICS-WEBSITE/assets'
const targets = [
  [path.join(assets, 'PHOTO-2026-06-14-02-38-14-5552518b-1039-46a0-b7a8-f0f9671b2b9e.png'), path.join(root, 'public/images/hero-main.png')],
  [path.join(root, 'public/images/product-moi-day-creme.png'), path.join(root, 'public/images/product-moi-day-creme.png')],
  [path.join(root, 'public/images/product-prana-rose-mist.png'), path.join(root, 'public/images/product-prana-rose-mist.png')],
]

for (const [inp, out] of targets) {
  await removeBg(inp, out)
}
