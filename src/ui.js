/* ═══════════════════════════════════════════════════
   JIN COSMETICS — Shared UI (menu, cart, header)
   ═══════════════════════════════════════════════════ */

const productImages = {
  cleanser: `${import.meta.env.BASE_URL}images/product-cleanser-crop.png`,
  moi: `${import.meta.env.BASE_URL}images/product-moi-crop.png`,
  mist: `${import.meta.env.BASE_URL}images/product-mist-crop.png`,
  serum: `${import.meta.env.BASE_URL}images/product-serum-crop.png`,
}

let cart = []

export function initWatchInView() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('in-view')
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )
  document.querySelectorAll('.watch-in-view').forEach((el) => observer.observe(el))
}

export function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href')
      if (id === '#') return
      const target = document.querySelector(id)
      if (!target) return
      e.preventDefault()
      target.scrollIntoView({ behavior: 'smooth' })
    })
  })
}

export function initMenu() {
  const menuBtn = document.getElementById('menuBtn')
  const menuOverlay = document.getElementById('menuOverlay')
  const menuClose = document.getElementById('menuClose')

  function openMenu() {
    menuOverlay?.classList.add('is-open')
    menuOverlay?.setAttribute('aria-hidden', 'false')
    menuBtn?.setAttribute('aria-expanded', 'true')
    document.body.style.overflow = 'hidden'
  }

  function closeMenu() {
    menuOverlay?.classList.remove('is-open')
    menuOverlay?.setAttribute('aria-hidden', 'true')
    menuBtn?.setAttribute('aria-expanded', 'false')
    document.body.style.overflow = ''
  }

  menuBtn?.addEventListener('click', openMenu)
  menuClose?.addEventListener('click', closeMenu)
  document.querySelectorAll('[data-close-menu]').forEach((link) => {
    link.addEventListener('click', closeMenu)
  })

  return { closeMenu }
}

export function initCart({ onCloseMenu } = {}) {
  const cartBtn = document.getElementById('cartBtn')
  const cartDrawer = document.getElementById('cartDrawer')
  const cartClose = document.getElementById('cartClose')
  const cartBackdrop = document.getElementById('cartBackdrop')
  const cartItems = document.getElementById('cartItems')
  const cartCount = document.getElementById('cartCount')
  const cartTotal = document.getElementById('cartTotal')
  const checkoutBtn = document.getElementById('checkoutBtn')

  function openCart() {
    cartDrawer?.classList.add('is-open')
    cartDrawer?.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
  }

  function closeCart() {
    cartDrawer?.classList.remove('is-open')
    cartDrawer?.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
  }

  cartBtn?.addEventListener('click', openCart)
  cartClose?.addEventListener('click', closeCart)
  cartBackdrop?.addEventListener('click', closeCart)

  function renderCart() {
    if (!cartItems) return

    if (cart.length === 0) {
      cartItems.innerHTML = '<p class="cart-empty">Your ritual awaits.<br/>Add a product to begin.</p>'
      if (checkoutBtn) checkoutBtn.disabled = true
      if (cartTotal) cartTotal.textContent = '£0'
      if (cartCount) cartCount.textContent = '0'
      return
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
    const count = cart.reduce((sum, item) => sum + item.qty, 0)

    cartItems.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <div class="cart-item__img">
          <img src="${productImages[item.id] || ''}" alt="${item.name}" />
        </div>
        <div class="cart-item__info">
          <p class="cart-item__name">${item.name}</p>
          <p class="cart-item__price">£${item.price} × ${item.qty}</p>
          <button class="cart-item__remove" data-remove="${i}">Remove</button>
        </div>
      </div>
    `).join('')

    if (cartTotal) cartTotal.textContent = `£${total}`
    if (cartCount) cartCount.textContent = String(count)
    if (checkoutBtn) checkoutBtn.disabled = false

    cartItems.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        cart.splice(Number(btn.dataset.remove), 1)
        renderCart()
      })
    })
  }

  function addToCart(card) {
    const id = card.dataset.productId
    const name = card.dataset.name
    const price = Number(card.dataset.price)
    const existing = cart.find((i) => i.id === id)

    if (existing) existing.qty += 1
    else cart.push({ id, name, price, qty: 1 })

    renderCart()
    openCart()
  }

  document.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      const card = btn.closest('.product-card')
      if (card) addToCart(card)
    })
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      onCloseMenu?.()
      closeCart()
    }
  })

  renderCart()
  return { closeCart }
}

export function initHeaderTone() {
  const header = document.getElementById('header')
  if (!header) return

  const sections = [...document.querySelectorAll('main > section')]
  const BLEND = 110
  let currentTone = 0
  let rafId = null

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v))
  }

  function smoothstep(t) {
    const x = clamp(t, 0, 1)
    return x * x * (3 - 2 * x)
  }

  function sectionTone(el) {
    const raw = getComputedStyle(el).getPropertyValue('--section-header-tone').trim()
    return raw ? parseFloat(raw) : 0
  }

  function computeTargetTone() {
    const y = window.scrollY + header.offsetHeight * 0.5

    for (let i = 0; i < sections.length; i++) {
      const el = sections[i]
      const top = el.offsetTop
      const bottom = top + el.offsetHeight

      if (y < top || y > bottom) continue

      const tone = sectionTone(el)
      let t = tone

      if (i > 0 && y < top + BLEND) {
        const prevTone = sectionTone(sections[i - 1])
        t = prevTone + (tone - prevTone) * smoothstep((y - top) / BLEND)
      } else if (i < sections.length - 1 && y > bottom - BLEND) {
        const nextTone = sectionTone(sections[i + 1])
        t = tone + (nextTone - tone) * smoothstep((y - (bottom - BLEND)) / BLEND)
      }

      return t
    }

    return parseFloat(getComputedStyle(document.body).getPropertyValue('--page-header-tone')) || 0
  }

  function applyTone(value) {
    header.style.setProperty('--header-tone', String(clamp(value, 0, 1)))
  }

  function animate() {
    const target = computeTargetTone()
    currentTone += (target - currentTone) * 0.16

    if (Math.abs(currentTone - target) > 0.003) {
      applyTone(currentTone)
      rafId = requestAnimationFrame(animate)
    } else {
      currentTone = target
      applyTone(currentTone)
      rafId = null
    }
  }

  function schedule() {
    if (rafId) return
    rafId = requestAnimationFrame(animate)
  }

  window.addEventListener('scroll', () => {
    header.style.setProperty('--scroll', String(Math.min(window.scrollY / 200, 1)))
    schedule()
  }, { passive: true })

  window.addEventListener('resize', schedule, { passive: true })
  applyTone(computeTargetTone())
  schedule()
}

export function initCookieBanner() {
  const cookieBanner = document.getElementById('cookieBanner')

  setTimeout(() => cookieBanner?.classList.add('is-visible'), 3000)

  document.getElementById('cookieAccept')?.addEventListener('click', () => {
    cookieBanner?.classList.remove('is-visible')
    localStorage.setItem('jin-cookies', 'accepted')
  })

  document.getElementById('cookieDecline')?.addEventListener('click', () => {
    cookieBanner?.classList.remove('is-visible')
  })

  if (localStorage.getItem('jin-cookies')) {
    cookieBanner?.classList.remove('is-visible')
  }
}

export function initSite() {
  initWatchInView()
  initAnchorScroll()
  const { closeMenu } = initMenu()
  initCart({ onCloseMenu: closeMenu })
  initHeaderTone()
  initCookieBanner()
}
