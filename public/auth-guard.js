const AUTH_KEY = 'jin-preview-auth'
const AUTH_TOKEN = 'jc-preview-v1'

function siteBase() {
  const parts = location.pathname.split('/').filter(Boolean)
  if (parts[0] === 'jincosmetics') return '/jincosmetics'
  return ''
}

;(function () {
  const path = location.pathname
  if (path.endsWith('/gate.html') || path.endsWith('gate.html')) return
  if (localStorage.getItem(AUTH_KEY) !== AUTH_TOKEN) {
    const base = siteBase()
    location.replace(`${base}/gate.html?next=${encodeURIComponent(location.pathname + location.search)}`)
  }
})()
