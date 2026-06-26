const AUTH_KEY = 'jin-preview-auth'
const AUTH_TOKEN = 'jc-preview-v1'

;(function () {
  if (localStorage.getItem(AUTH_KEY) === AUTH_TOKEN) return
  document.documentElement.classList.add('preview-locked')
})()
