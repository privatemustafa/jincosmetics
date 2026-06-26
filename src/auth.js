const AUTH_KEY = 'jin-preview-auth'
const AUTH_TOKEN = 'jc-preview-v1'
export const PREVIEW_PASSWORD = 'akin1'

export function siteBase() {
  const parts = window.location.pathname.split('/').filter(Boolean)
  if (parts[0] === 'jincosmetics') return '/jincosmetics'
  return ''
}

export function isAuthed() {
  return localStorage.getItem(AUTH_KEY) === AUTH_TOKEN
}

export function grantAuth() {
  localStorage.setItem(AUTH_KEY, AUTH_TOKEN)
}

export function getNextPath() {
  const params = new URLSearchParams(window.location.search)
  const next = params.get('next')
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return `${siteBase()}/`
  }
  return next
}
