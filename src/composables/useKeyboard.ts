import { onMounted, onUnmounted } from 'vue'

export interface KeyHandler {
  /** match against KeyboardEvent.key (case-insensitive) */
  key: string
  handler: (e: KeyboardEvent) => void
  /** Optional: only handle when this prefix is set */
  scope?: string
}

const stacks = new Map<string, KeyHandler[]>()
let currentScope: string | null = null

function dispatch(e: KeyboardEvent) {
  const scope = currentScope
  if (!scope) return
  const list = stacks.get(scope)
  if (!list) return
  for (let i = list.length - 1; i >= 0; i--) {
    const h = list[i]
    if (h.key.toLowerCase() === e.key.toLowerCase()) {
      h.handler(e)
      // Only block default if the handler opted in via e.preventDefault()
      if (e.defaultPrevented) return
      return
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', dispatch)
}

export function useKeyboard(scope: string) {
  function push(handler: KeyHandler) {
    handler.scope = scope
    if (!stacks.has(scope)) stacks.set(scope, [])
    stacks.get(scope)!.push(handler)
  }

  function clear() {
    stacks.set(scope, [])
  }

  onMounted(() => {
    currentScope = scope
  })
  onUnmounted(() => {
    if (currentScope === scope) currentScope = null
    stacks.delete(scope)
  })

  return { push, clear }
}
