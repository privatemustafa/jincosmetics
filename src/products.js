import { initPreviewGate } from './preview-gate.js'
import { initSite } from './ui.js'

initPreviewGate().then(() => initSite())
