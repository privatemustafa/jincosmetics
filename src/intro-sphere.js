/**
 * STEM-style glass metaball intro — mercury palette
 * Three.js MarchingCubes + custom glass shader
 */
import * as THREE from 'three'
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js'

const SCATTER = [
  { x: -410, y: -200, size: 96 },
  { x: -286, y: 186, size: 64 },
  { x: -148, y: -248, size: 48 },
  { x: 118, y: -214, size: 78 },
  { x: 292, y: 180, size: 58 },
  { x: 172, y: 244, size: 36 },
  { x: -886, y: 74, size: 50 },
  { x: -54, y: 246, size: 52 },
  { x: 356, y: -238, size: 34 },
]

const MERCURY_COLORS = [
  0xf2f5f8, 0xe4eaef, 0xd0dae2, 0xb8c6d0, 0x9aacb8,
]

const VERT = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vViewPos;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    vViewPos = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const FRAG = `
  precision highp float;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vViewPos;

  uniform float uTime;
  uniform float uAlpha;
  uniform float uHover;

  float specular(vec3 n, vec3 v, vec3 l, float power) {
    vec3 h = normalize(v + l);
    return pow(max(dot(n, h), 0.0), power);
  }

  float band(float value, float center, float width) {
    return 1.0 - smoothstep(width * 0.45, width, abs(value - center));
  }

  vec3 mercuryEnv(vec3 dir) {
    float t = dir.y * 0.5 + 0.5;
    vec3 top = vec3(0.97, 0.98, 0.99);
    vec3 mid = vec3(0.82, 0.87, 0.92);
    vec3 bot = vec3(0.68, 0.74, 0.80);
    return mix(bot, mix(mid, top, smoothstep(0.2, 0.85, t)), smoothstep(-0.3, 0.7, t));
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewDir);
    float ndv = clamp(abs(dot(n, v)), 0.0, 1.0);
    float fresnel = pow(1.0 - ndv, 1.55);
    float rim = smoothstep(0.03, 0.82, fresnel);
    float outerLine = band(fresnel, 0.86, 0.075);
    float innerLine = band(fresnel, 0.62, 0.070) * smoothstep(-0.95, 0.15, -n.y);

    vec3 l1 = normalize(vec3(-0.55, 0.82, 0.75));
    vec3 l2 = normalize(vec3(0.65, -0.24, 0.86));
    vec3 l3 = normalize(vec3(-0.18 + sin(uTime * 0.35) * 0.08, 0.30, 0.94));

    float s1 = specular(n, v, l1, 72.0) * 0.88;
    float s2 = specular(n, v, l2, 30.0) * 0.16;
    float s3 = specular(n, v, l3, 180.0) * 0.58;
    float glint = s1 + s2 + s3;

    vec3 reflectDir = reflect(-v, n);
    vec3 refractDir = refract(-v, n, 0.74);
    vec3 envReflect = mercuryEnv(reflectDir);
    vec3 envRefract = mercuryEnv(normalize(refractDir + n * 0.22));
    vec3 envCol = mix(envRefract, envReflect, fresnel * 0.92);

    float lowerBend = smoothstep(-0.85, 0.18, -n.y) * smoothstep(0.10, 0.95, fresnel);
    float innerLens = smoothstep(0.18, 0.78, 1.0 - ndv) * 0.001;
    float hoverLift = uHover * smoothstep(0.12, 0.95, fresnel) * 0.0013;
    float depthLens = (1.0 - rim) * smoothstep(0.22, 1.0, ndv);

    vec3 col = vec3(0.94, 0.96, 0.97);
    col = mix(col, envCol, smoothstep(0.18, 0.96, fresnel) * 0.62);
    col = mix(col, vec3(0.55, 0.62, 0.68), outerLine * 0.28 + innerLine * 0.30);
    col = mix(col, vec3(0.72, 0.78, 0.84), rim * 0.18 + lowerBend * 0.08);
    col += vec3(1.0) * (glint * 0.62 + depthLens * 0.05 + innerLens + hoverLift * 1.3);

    float alpha = 0.0001
      + rim * 0.098
      + outerLine * 0.39
      + innerLine * 0.156
      + lowerBend * 0.046
      + innerLens * 0.55
      + depthLens * 0.008
      + glint * 0.31;

    float dissolveEdge = (1.0 - uAlpha) * 1.8 - 0.5;
    float dissolveMask = smoothstep(dissolveEdge, dissolveEdge + 0.4, fresnel);
    alpha = clamp(alpha * dissolveMask, 0.0, 0.754);

    gl_FragColor = vec4(col, alpha);
  }
`

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function easeOutSine(t) {
  return Math.sin((t * Math.PI) / 2)
}

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

/** 2 saniyede 2 geçiş: Latin → Katakana → Latin */
function logoCrossfadeMix(seconds) {
  if (seconds >= 2) return 0
  const cross = (start, duration, forward = true) => {
    const t = clamp((seconds - start) / duration, 0, 1)
    const e = easeInOutSine(t)
    return forward ? e : 1 - e
  }
  if (seconds < 0.28) return 0
  if (seconds < 0.72) return cross(0.28, 0.44)
  if (seconds < 1.08) return 1
  if (seconds < 1.52) return cross(1.08, 0.44, false)
  return 0
}

function createSphere(canvas, options = {}) {
  const isMobile = window.innerWidth <= 768
  const resolution = isMobile ? 72 : 108
  const baseScale = isMobile ? 2.58 : 4

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setClearColor(0xffffff, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 0, 5.2)

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTime: { value: 0 },
      uAlpha: { value: 1 },
      uHover: { value: 0 },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false,
  })

  const marching = new MarchingCubes(resolution, material, false, false, 180000)
  marching.isolation = 82
  marching.renderOrder = 2
  scene.add(marching)

  scene.add(new THREE.AmbientLight(0xffffff, 0.35))
  const key = new THREE.DirectionalLight(0xf0f4f8, 2.4)
  key.position.set(-3, 4, 4)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xc5d0d8, 1.6)
  fill.position.set(4, -2, 3)
  scene.add(fill)

  const norm = isMobile ? 620 : 980
  const balls = SCATTER.map((s, i) => {
    const sx = clamp(0.5 + s.x / norm, 0.08, 0.92)
    const sy = clamp(0.5 - s.y / (0.68 * norm), 0.12, 0.88)
    return {
      start: new THREE.Vector3(sx, sy, 0.46 + 0.018 * (i % 5 - 2)),
      target: new THREE.Vector3(0.5, 0.5, 0.5),
      color: new THREE.Color(MERCURY_COLORS[i % MERCURY_COLORS.length]),
      size: s.size / 96,
      delay: 0.045 * i,
      collectStart: (sx < 0.5 ? 0 : 0.24) + (i % 5) * 0.025,
      collectSpan: 0.58,
      seedX: ((37 * i) % 11 - 5) / 5,
      seedY: ((17 * i) % 13 - 6) / 6,
      seedZ: ((29 * i) % 9 - 4) / 4,
      scatterBias: ((19 * i) % 10) / 9,
    }
  })

  const state = {
    reveal: 0,
    collect: 0,
    alpha: 1,
    logoAlpha: 1,
    scale: 1,
    x: 0,
    y: 0,
    travel: 0,
    flowX: 0,
    flowY: 0,
    flowZ: 0,
    pulse: 0,
    rotateX: 0,
    rotateY: 0,
    scatterSpread: 1,
    baseScale,
  }

  const pointer = { x: 0.5, y: 0.5, smoothX: 0.5, smoothY: 0.5, strength: 0, targetStrength: 0 }
  const clock = new THREE.Clock()
  let width = 1
  let height = 1
  let rafId = null
  let running = true
  let scatterEnergy = 0

  function resize() {
    width = canvas.clientWidth || window.innerWidth
    height = canvas.clientHeight || window.innerHeight
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  function onPointerMove(e) {
    if (e.pointerType !== 'mouse') return
    const rect = canvas.getBoundingClientRect()
    pointer.x = clamp((e.clientX - rect.left) / rect.width, 0, 1)
    pointer.y = clamp(1 - (e.clientY - rect.top) / rect.height, 0, 1)
    pointer.targetStrength = 1
  }

  function onPointerLeave() {
    pointer.targetStrength = 0
  }

  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerleave', onPointerLeave)

  function updateScene() {
    const delta = clock.getDelta()
    const t = clock.getElapsedTime()
    const collect = smoothstep(0, 1, state.collect)
    const reveal = smoothstep(0, 1, state.reveal)
    const travel = clamp(state.travel, 0, 1)
    const flowX = clamp(state.flowX * 0.22, -0.22, 0.22)
    const flowY = clamp(state.flowY * 0.22, -0.22, 0.22)
    const flowZ = clamp(state.flowZ * 0.18, -0.18, 0.18)
    const flowMag = clamp(3.4 * Math.hypot(flowX, flowY, flowZ), 0, 1)

    if (flowMag > scatterEnergy) scatterEnergy += (flowMag - scatterEnergy) * 0.14
    else scatterEnergy += (flowMag - scatterEnergy) * 0.028

    pointer.smoothX += (pointer.x - pointer.smoothX) * 0.098
    pointer.smoothY += (pointer.y - pointer.smoothY) * 0.098
    pointer.strength += (pointer.targetStrength - pointer.strength) * 0.117

    const fovRad = (38 * Math.PI) / 180
    const viewHeight = 2 * Math.tan(fovRad / 2) * 5.2
    const viewWidth = viewHeight * camera.aspect
    const ptrWorldX = 2 * (pointer.smoothX - 0.5) * viewWidth * 0.5
    const ptrWorldY = 2 * (pointer.smoothY - 0.5) * viewHeight
    const hoverInfluence = pointer.strength * clamp((collect - 0.32) / 0.58, 0, 1)

    marching.reset()
    marching.scale.setScalar(state.baseScale * state.scale)
    marching.position.set(state.x, state.y, 0)
    marching.rotation.y =
      0.14 * Math.sin(0.34 * t) * (0.35 + collect) +
      0.364 * ((ptrWorldX - state.x) / viewHeight) * hoverInfluence +
      state.rotateY
    marching.rotation.x =
      0.07 * Math.sin(0.27 * t) -
      0.234 * ((ptrWorldY - state.y) / viewHeight) * hoverInfluence +
      state.rotateX

    material.uniforms.uTime.value = t
    material.uniforms.uAlpha.value = state.alpha
    material.uniforms.uHover.value = hoverInfluence

    balls.forEach((b, i) => {
      const appear = smoothstep(0, 1, (reveal - b.delay) / 0.38)
      if (appear <= 0) return

      const c = smoothstep(0, 1, (collect - b.collectStart) / b.collectSpan)
      const scatterT = smoothstep(0, 1, (travel - 0.02) / 0.12 + (Math.floor(i / 5) - 1) * 0.02)
      const wave = Math.sin(scatterT * Math.PI) * flowMag
      const driftX = -flowY
      const driftY = flowX

      let x = lerp(b.start.x, b.target.x, c) + Math.sin(0.75 * t + 1.9 * i) * 0.02 * (1 - c)
      let y = lerp(b.start.y, b.target.y, c) + Math.cos(0.62 * t + 1.3 * i) * 0.02 * (1 - c)
      let z = lerp(b.start.z, b.target.z, c) + Math.sin(0.54 * t + 0.8 * i) * 0.02 * (1 - c)

      let strength = lerp(0.13, 0.34, c) * (0.72 + 0.3 * b.size) * appear * (1 - 0.62 * smoothstep(0, 1, (c - 0.72) / 0.28))
      let subtract = lerp(24, 16.2, c)

      if (collect > 0.95 && travel > 0.02) {
        const o = smoothstep(0, 0.08, scatterEnergy)
        const a = 0.34 * (1 - b.scatterBias)
        const ct = smoothstep(0, 1, (travel - a) / Math.max(1 - a, 0.01))
        const h = Math.sin(ct * Math.PI) * o
        const f = 0.18 + 0.82 * b.scatterBias
        const spread = state.scatterSpread || 1
        x = lerp(x, 0.5 + driftX * h * f * 0.9 + (0.32 * b.seedX + 0.16 * b.seedZ) * h * spread * f, o)
        y = lerp(y, 0.5 + driftY * h * f * 0.9 + (0.28 * b.seedY - 0.14 * b.seedX) * h * spread * f, o)
        z = lerp(z, 0.5 + flowZ * h * 1.8 + b.seedZ * (0.1 * f * h + 1.15 * Math.abs(flowZ)), o)
        strength = lerp(strength, (0.08 + 0.028 * b.size) * appear * (1 - 0.12 * h), o)
        subtract = lerp(subtract, 21 + 2.2 * f + 3.8 * h, o)
      } else {
        x += flowX * (0.55 * (0.026 * (i % 5 - 2)) + 0.34 * wave)
        y += flowY * (0.55 * (0.026 * (i % 5 - 2)) + 0.34 * wave)
        z += flowZ * (0.5 * (0.026 * (i % 5 - 2)) + 0.3 * wave) + 0.04 * wave
        strength *= 1 - 0.1 * wave
        subtract += 1.6 * wave
      }

      marching.addBall(x, y, z, strength, subtract, b.color)
    })

    const coreReveal = smoothstep(0, 1, (collect - 0.18) / 0.82)
    const coreBulge = smoothstep(0, 1, (collect - 0.18) / 0.46)
    const exitWave = smoothstep(0, 1, travel) * flowMag
    const exitPull = (1 - smoothstep(0.22, 0.86, travel)) * flowMag
    const scatterDamp = collect > 0.95 && travel > 0.02 ? 1 - 0.42 * smoothstep(0.12, 0.88, scatterEnergy) : 1

    marching.addBall(
      0.5 - flowX * exitPull * 0.14 + flowX * exitWave * 0.14,
      lerp(0.12, 0.5, coreBulge) + 0.006 * Math.sin(0.5 * t) * coreReveal - flowY * exitPull * 0.14 + flowY * exitWave * 0.14,
      0.5 + flowZ * exitWave * 0.14,
      coreReveal * (0.18 + coreReveal * (0.58 + 0.04 * state.pulse)) * (1 - 0.08 * flowMag) * scatterDamp,
      lerp(18, 13.2, coreReveal) + 0.42 * flowMag,
      new THREE.Color(0xffffff)
    )

    if (hoverInfluence > 0.1) {
      const e = smoothstep(0, 1, (hoverInfluence - 0.1) / 0.9)
      const tx = clamp(0.5 + ((ptrWorldX - state.x) / viewHeight) * 0.21, 0.08, 0.92)
      const ty = clamp(0.5 + ((ptrWorldY - state.y) / viewHeight) * 0.21, 0.08, 0.92)
      const o = clamp(Math.hypot(ptrWorldX - state.x, ptrWorldY - state.y) / (viewHeight * 0.34), 0.3, 1)
      marching.addBall(tx, ty, 0.5, 0.13 * e * o, 13, new THREE.Color(0xf8fafc))
    }

    marching.update()
    options.onFrame?.(state)
    renderer.render(scene, camera)
  }

  function tick() {
    if (!running) return
    updateScene()
    rafId = requestAnimationFrame(tick)
  }

  tick()

  return {
    setState(patch) {
      Object.assign(state, patch)
    },
    destroy() {
      running = false
      if (rafId) cancelAnimationFrame(rafId)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      ro.disconnect()
      marching.geometry.dispose()
      material.dispose()
      renderer.dispose()
    },
  }
}

function tween(obj, props, duration, ease, onUpdate) {
  return new Promise((resolve) => {
    const start = performance.now()
    const from = {}
    for (const k of Object.keys(props)) from[k] = obj[k]

    function frame(now) {
      const t = clamp((now - start) / (duration * 1000), 0, 1)
      const e = ease(t)
      for (const k of Object.keys(props)) {
        obj[k] = lerp(from[k], props[k], e)
      }
      onUpdate?.()
      if (t < 1) requestAnimationFrame(frame)
      else resolve()
    }
    requestAnimationFrame(frame)
  })
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export function initIntroSphere({ intro, canvas, glow, shadow, counter, logoStage, onComplete }) {
  if (!intro || !canvas) return () => {}

  const isMobile = window.innerWidth <= 1100
  const startScale = isMobile ? 1.5 : 1.2

  const latinLogo = logoStage?.querySelector('.intro__logo-mark--latin')
  const katakanaLogo = logoStage?.querySelector('.intro__logo-mark--katakana')
  let logoAltStart = 0
  let logoAltActive = false

  const state = {
    progress: 0,
    reveal: 0,
    collect: 0,
    alpha: 0,
    logoAlpha: 1,
    scale: startScale,
    x: 0,
    y: 0,
    pulse: 0,
    travel: 0,
    flowX: 0,
    flowY: 0,
    rotateY: 0,
    scatterSpread: 1,
  }

  function updateHtmlLogos() {
    if (!latinLogo && !katakanaLogo) return

    const collect = smoothstep(0, 1, state.collect)
    const logoT = smoothstep(0, 1, (collect - 0.42) / 0.22)
    const visibility = logoT * state.logoAlpha

    if (logoT > 0.02 && !logoAltActive) {
      logoAltActive = true
      logoAltStart = performance.now()
    }

    const elapsed = logoAltActive ? (performance.now() - logoAltStart) / 1000 : 0
    const mix = logoCrossfadeMix(elapsed)
    const mixT = smoothstep(0, 1, mix)

    if (latinLogo) latinLogo.style.opacity = String(visibility * (1 - mixT))
    if (katakanaLogo) katakanaLogo.style.opacity = String(visibility * mixT)
  }

  const sphere = createSphere(canvas, {
    onFrame: updateHtmlLogos,
  })

  function sync() {
    sphere.setState(state)
  }

  function setCounter(p) {
    if (counter) counter.textContent = `${Math.round(p)}%`
  }

  if (glow) {
    glow.style.opacity = '0'
    glow.style.transform = 'translate(-50%, -50%) scale(0.35)'
  }
  if (shadow) {
    shadow.style.opacity = '0'
    shadow.style.transform = 'translate(-50%, -50%) scale(0.5)'
  }
  if (counter) counter.style.opacity = '0'

  sync()
  setCounter(0)

  let stopped = false

  async function runSequence() {
    const glowEl = glow
    const shadowEl = shadow
    const counterEl = counter

    const animGlow = (opacity, scale, duration) =>
      new Promise((resolve) => {
        if (!glowEl) return resolve()
        glowEl.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`
        glowEl.style.opacity = String(opacity)
        glowEl.style.transform = `translate(-50%, -50%) scale(${scale})`
        setTimeout(resolve, duration)
      })

    animGlow(0.72, 0.92, 800)
    if (shadowEl) {
      shadowEl.style.transition = 'opacity 1800ms ease, transform 1800ms ease'
      setTimeout(() => {
        shadowEl.style.opacity = '0.12'
        shadowEl.style.transform = 'translate(-50%, -50%) scale(0.82)'
      }, 350)
    }

    const revealDone = tween(state, { reveal: 1, alpha: 1 }, 1.35, easeOutSine, sync)
    await wait(420)
    const collectDone = tween(state, { collect: 1, pulse: 0.24 }, 2.9, easeInOutSine, sync)

    await wait(2100)
    await collectDone
    await revealDone

    if (counterEl) {
      counterEl.style.transition = 'opacity 250ms ease'
      counterEl.style.opacity = '1'
    }

    await tween(state, { progress: 100 }, 3.2, easeInOutQuad, () => {
      setCounter(state.progress)
      sync()
    })

    setCounter(100)
    await wait(300)

    await Promise.all([
      tween(state, { flowX: 1, flowY: 1, travel: 0.65, scatterSpread: 2 }, 4.5, easeInOutQuad, sync),
      tween(state, { scale: 18, rotateY: 0.26 }, 4.5, easeInOutSine, sync),
      tween(state, { logoAlpha: 0, pulse: 0 }, 0.8, easeInOutSine, sync),
      tween(state, { alpha: 0 }, 1.8, easeOutSine, sync),
      animGlow(0, 1.2, 1000),
    ])

    intro.classList.add('is-hidden')
    stopped = true
    sphere.destroy()
    onComplete?.()
  }

  runSequence()

  return () => {
    if (!stopped) {
      stopped = true
      sphere.destroy()
    }
  }
}
