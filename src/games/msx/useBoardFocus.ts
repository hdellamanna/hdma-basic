import { ref } from 'vue'

export function useBoardFocus() {
  const focusIndex = ref(0)

  function navigate(event: KeyboardEvent) {
    const cell = event.target
    if (!(cell instanceof HTMLButtonElement)) return
    const row = Math.floor(focusIndex.value / 8)
    const column = focusIndex.value % 8
    let next = focusIndex.value
    switch (event.key) {
      case 'ArrowLeft': next -= column > 0 ? 1 : 0; break
      case 'ArrowRight': next += column < 7 ? 1 : 0; break
      case 'ArrowUp': next -= row > 0 ? 8 : 0; break
      case 'ArrowDown': next += row < 7 ? 8 : 0; break
      case 'Home': next -= column; break
      case 'End': next += 7 - column; break
      default: return
    }
    event.preventDefault()
    const cells = cell.parentElement?.querySelectorAll<HTMLButtonElement>('button')
    cells?.[next]?.focus()
  }

  return { focusIndex, navigate }
}
