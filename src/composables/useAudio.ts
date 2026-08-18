import { ref } from 'vue'

/**
 * Lightweight 8-bit-style audio using WebAudio. No samples — only square/triangle/noise.
 * Each sound is a 60-200ms blip that matches the era (PC speaker / NES APU).
 */
let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
const muted = ref(false)

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    try {
      ctx = new Ctor()
      masterGain = ctx.createGain()
      masterGain.gain.value = 0.18
      masterGain.connect(ctx.destination)
    } catch {
      ctx = null
    }
  }
  if (ctx && ctx.state === 'suspended') {
    void ctx.resume()
  }
  return ctx
}

export function useAudio() {
  function blip(freq: number, durationMs = 80, type: OscillatorType = 'square', volume = 0.3) {
    if (muted.value) return
    const c = ensureCtx()
    if (!c || !masterGain) return
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = type
    osc.frequency.value = freq
    g.gain.value = 0
    g.gain.setValueAtTime(0, c.currentTime)
    g.gain.linearRampToValueAtTime(volume, c.currentTime + 0.005)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + durationMs / 1000)
    osc.connect(g)
    g.connect(masterGain)
    osc.start()
    osc.stop(c.currentTime + durationMs / 1000 + 0.02)
  }

  function sweep(fromFreq: number, toFreq: number, durationMs = 200, type: OscillatorType = 'sawtooth', volume = 0.25) {
    if (muted.value) return
    const c = ensureCtx()
    if (!c || !masterGain) return
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(fromFreq, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, toFreq), c.currentTime + durationMs / 1000)
    g.gain.setValueAtTime(0, c.currentTime)
    g.gain.linearRampToValueAtTime(volume, c.currentTime + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + durationMs / 1000)
    osc.connect(g)
    g.connect(masterGain)
    osc.start()
    osc.stop(c.currentTime + durationMs / 1000 + 0.02)
  }

  function noise(durationMs = 100, volume = 0.2) {
    if (muted.value) return
    const c = ensureCtx()
    if (!c || !masterGain) return
    const buf = c.createBuffer(1, c.sampleRate * (durationMs / 1000), c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    const src = c.createBufferSource()
    src.buffer = buf
    const g = c.createGain()
    g.gain.value = volume
    src.connect(g)
    g.connect(masterGain)
    src.start()
  }

  // Common 8-bit-style SFX
  const sfx = {
    coin: () => sweep(800, 1200, 80, 'square', 0.25),
    insertCoin: () => {
      sweep(1200, 1800, 60, 'square', 0.2)
      setTimeout(() => sweep(1800, 2400, 80, 'square', 0.2), 60)
    },
    select: () => blip(440, 60, 'square', 0.2),
    start: () => {
      sweep(440, 880, 120, 'square', 0.25)
      setTimeout(() => sweep(880, 1760, 120, 'square', 0.25), 100)
    },
    hit: () => blip(150, 60, 'square', 0.3),
    miss: () => sweep(400, 80, 200, 'sawtooth', 0.2),
    win: () => {
      const notes = [523, 659, 784, 1047]
      notes.forEach((f, i) => setTimeout(() => blip(f, 200, 'square', 0.25), i * 120))
    },
    lose: () => {
      sweep(440, 60, 600, 'sawtooth', 0.3)
    },
    jump: () => sweep(300, 800, 80, 'square', 0.2),
    shoot: () => {
      blip(800, 40, 'square', 0.2)
      noise(60, 0.15)
    },
    explode: () => noise(400, 0.35),
    powerup: () => {
      const notes = [440, 554, 659, 880, 1108]
      notes.forEach((f, i) => setTimeout(() => blip(f, 100, 'square', 0.25), i * 50))
    },
    error: () => sweep(220, 110, 200, 'square', 0.25),
    type: () => blip(1200, 18, 'square', 0.08),
    tick: () => blip(2000, 12, 'square', 0.08),
  }

  function setMuted(v: boolean) {
    muted.value = v
  }

  function toggleMute() {
    muted.value = !muted.value
  }

  function unlock() {
    ensureCtx()
  }

  return { sfx, muted, setMuted, toggleMute, unlock }
}
