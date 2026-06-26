import { grantAuth, isAuthed, siteBase } from './auth.js'

const PASSWORD = 'akin1'

const GATE_HTML = `
<div id="previewGate" class="preview-gate" aria-modal="true" role="dialog" aria-labelledby="previewGateTitle">
  <div class="preview-gate__scene" aria-hidden="true">
    <div class="preview-gate__mist"></div>
    <div class="preview-gate__ring preview-gate__ring--a"></div>
    <div class="preview-gate__ring preview-gate__ring--b"></div>
    <div class="preview-gate__ring preview-gate__ring--c"></div>
    <div class="preview-gate__orb preview-gate__orb--1"></div>
    <div class="preview-gate__orb preview-gate__orb--2"></div>
  </div>

  <div class="preview-gate__panel" id="previewGatePanel">
    <div class="preview-gate__logo-wrap">
      <img src="${import.meta.env.BASE_URL}images/logo-jin-latin.png" alt="Jin" class="preview-gate__logo" width="88" height="60" />
    </div>
    <p class="preview-gate__eyebrow figuration">Private Preview</p>
    <h1 class="preview-gate__title" id="previewGateTitle">Enter the ritual</h1>
    <p class="preview-gate__copy body-sm">This collection is shared in confidence.<br/>Enter your access key to continue.</p>

    <form class="preview-gate__form" id="previewGateForm" autocomplete="off">
      <label class="preview-gate__label figuration" for="previewGateInput">Access key</label>
      <div class="preview-gate__field">
        <input
          class="preview-gate__input"
          id="previewGateInput"
          name="password"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>
      <p class="preview-gate__error body-xs" id="previewGateError" hidden>Incorrect access key. Please try again.</p>
      <button type="submit" class="glass-pill preview-gate__submit">Continue</button>
    </form>

    <p class="preview-gate__foot body-xs">Jin Cosmetics — confidential preview</p>
  </div>
</div>
`

function mountGate() {
  if (document.getElementById('previewGate')) return
  document.body.insertAdjacentHTML('afterbegin', GATE_HTML)
  document.documentElement.classList.add('preview-locked')
}

function unlockGate() {
  const gate = document.getElementById('previewGate')
  gate?.classList.add('is-unlocking')
  document.documentElement.classList.remove('preview-locked')
  setTimeout(() => gate?.remove(), 680)
}

export function initPreviewGate(options = {}) {
  const { redirect = null } = options

  if (isAuthed()) {
    document.documentElement.classList.remove('preview-locked')
    return Promise.resolve()
  }

  mountGate()

  return new Promise((resolve) => {
    const form = document.getElementById('previewGateForm')
    const input = document.getElementById('previewGateInput')
    const panel = document.getElementById('previewGatePanel')
    const error = document.getElementById('previewGateError')

    form?.addEventListener('submit', (e) => {
      e.preventDefault()
      error.hidden = true
      panel?.classList.remove('is-error')

      if (input.value === PASSWORD) {
        grantAuth()
        panel?.classList.add('is-success')
        unlockGate()
        if (redirect) setTimeout(() => window.location.replace(redirect), 520)
        setTimeout(resolve, 640)
        return
      }

      error.hidden = false
      panel?.classList.add('is-error')
      input.value = ''
      input.focus()
    })

    input?.focus()
  })
}

export function initStandaloneGate() {
  if (isAuthed()) {
    window.location.replace(`${siteBase()}/index.html`)
    return
  }

  document.body.classList.add('page-gate-only')
  initPreviewGate({ redirect: `${siteBase()}/index.html` })
}
