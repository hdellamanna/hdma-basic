import { onUnmounted } from 'vue'

export function useRoundTimer() {
  let timer: number | undefined

  function cancel() {
    window.clearTimeout(timer)
    timer = undefined
  }

  function schedule(callback: () => void, delay: number) {
    cancel()
    timer = window.setTimeout(() => {
      timer = undefined
      callback()
    }, delay)
  }

  onUnmounted(cancel)
  return { schedule, cancel }
}
