import { grantAuth, getNextPath, isAuthed } from './auth.js'

if (isAuthed()) {
  window.location.replace(getNextPath())
}

const form = document.getElementById('gateForm')
const input = document.getElementById('gatePassword')
const card = document.getElementById('gateCard')
const error = document.getElementById('gateError')

form?.addEventListener('submit', (e) => {
  e.preventDefault()
  error.hidden = true
  card?.classList.remove('is-error')

  if (input.value === 'akin1') {
    grantAuth()
    card?.classList.add('is-success')
    setTimeout(() => window.location.replace(getNextPath()), 420)
    return
  }

  error.hidden = false
  card?.classList.add('is-error')
  input.value = ''
  input.focus()
})

input?.focus()
