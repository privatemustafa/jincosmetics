/* ═══════════════════════════════════════════════════
   JIN COSMETICS — Home
   ═══════════════════════════════════════════════════ */

import { initIntroSphere } from './intro-sphere.js'
import { initSite } from './ui.js'

initSite()

// ─── Intro / Preloader (STEM-style mercury sphere) ───
const intro = document.getElementById('intro')
const introCanvas = document.getElementById('introCanvas')
const introGlow = document.getElementById('introGlow')
const introShadow = document.getElementById('introShadow')
const introCounter = document.getElementById('introCounter')
const introLogoStage = document.getElementById('introLogoStage')
const heroImg = document.querySelector('.hero__img')
const heroTagline = document.querySelector('.hero__tagline')

function revealHero() {
  heroImg?.classList.add('is-visible')
  heroTagline?.classList.add('is-visible')
  document.documentElement.classList.add('lenis')
  window.dispatchEvent(new Event('resize'))
}

const stopIntro = initIntroSphere({
  intro,
  canvas: introCanvas,
  glow: introGlow,
  shadow: introShadow,
  counter: introCounter,
  logoStage: introLogoStage,
  onComplete: revealHero,
})

setTimeout(() => {
  if (!intro?.classList.contains('is-hidden')) {
    intro?.classList.add('is-hidden')
    stopIntro()
    revealHero()
  }
}, 12000)

// ─── Product Carousel ───
const carouselTrack = document.getElementById('carouselTrack')
const carouselPrev = document.getElementById('carouselPrev')
const carouselNext = document.getElementById('carouselNext')
const carouselProgress = document.getElementById('carouselProgress')

const cards = carouselTrack ? [...carouselTrack.querySelectorAll('.product-card')] : []
const totalCards = cards.length

function updateCarousel() {
  if (!carouselTrack) return
  const scrollLeft = carouselTrack.scrollLeft
  const cardWidth = cards[0]?.offsetWidth || 1
  const gap = 30
  const index = Math.round(scrollLeft / (cardWidth + gap))

  carouselPrev.disabled = index <= 0
  carouselNext.disabled = index >= totalCards - 1

  if (carouselProgress) {
    carouselProgress.style.width = `${((index + 1) / totalCards) * 100}%`
  }
}

carouselPrev?.addEventListener('click', () => {
  const cardWidth = cards[0]?.offsetWidth || 480
  carouselTrack.scrollBy({ left: -(cardWidth + 30), behavior: 'smooth' })
})

carouselNext?.addEventListener('click', () => {
  const cardWidth = cards[0]?.offsetWidth || 480
  carouselTrack.scrollBy({ left: cardWidth + 30, behavior: 'smooth' })
})

carouselTrack?.addEventListener('scroll', updateCarousel, { passive: true })
updateCarousel()

// ─── Testimonials ───
const testimonials = [...document.querySelectorAll('.testimonial')]
let testIndex = 0

function showTestimonial(index) {
  testimonials.forEach((t, i) => t.classList.toggle('active', i === index))
}

document.getElementById('testPrev')?.addEventListener('click', () => {
  testIndex = (testIndex - 1 + testimonials.length) % testimonials.length
  showTestimonial(testIndex)
})

document.getElementById('testNext')?.addEventListener('click', () => {
  testIndex = (testIndex + 1) % testimonials.length
  showTestimonial(testIndex)
})

setInterval(() => {
  testIndex = (testIndex + 1) % testimonials.length
  showTestimonial(testIndex)
}, 6000)

// ─── Newsletter ───
document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
  e.preventDefault()
  const btn = e.target.querySelector('.link-cta')
  if (btn) {
    btn.textContent = 'Thank you'
    btn.style.pointerEvents = 'none'
  }
})
