import { ref, onUnmounted } from 'vue'

/**
 * Simple requestAnimationFrame loop. Returns a tick() ref that updates each frame
 * and a function to start/stop. Games can read delta from the tick value.
 */
export function useGameLoop(callback: (dtMs: number) => void) {
  const running = ref(false)
  const fps = ref(0)
  let rafId: number | null = null
  let last = 0
  let frames = 0
  let lastFps = 0

  function start() {
    if (running.value) return
    running.value = true
    last = performance.now()
    lastFps = last
    frames = 0
    loop(last)
  }

  function stop() {
    running.value = false
    if (rafId !== null) cancelAnimationFrame(rafId)
    rafId = null
  }

  function loop(now: number) {
    if (!running.value) return
    const dt = now - last
    last = now
    frames++
    if (now - lastFps >= 1000) {
      fps.value = frames
      frames = 0
      lastFps = now
    }
    try {
      callback(dt)
    } catch (err) {
      console.error('Game loop error', err)
      stop()
      return
    }
    rafId = requestAnimationFrame(loop)
  }

  onUnmounted(stop)

  return { start, stop, running, fps }
}
