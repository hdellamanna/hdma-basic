<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const phase = ref<'count' | 'wait' | 'draw' | 'result'>('count')
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')

let drawTimer: number | null = null
let startTime = 0

function start() {
  phase.value = 'count'
  log.value = ['1...2...3...4...5...6...7...8...9...10']
  sfx.tick()
  // random delay 1.5-4s
  const delay = 1500 + Math.random() * 2500
  drawTimer = window.setTimeout(() => {
    phase.value = 'draw'
    startTime = performance.now()
    sfx.start()
  }, delay)
}

function shoot() {
  if (phase.value === 'count') {
    // Cheated
    if (drawTimer) clearTimeout(drawTimer)
    log.value.push(locale.current === 'pt-BR' ? 'TRAPAÇA! Você perdeu.' : 'CHEATING! You lose.')
    status.value = 'lost'
    phase.value = 'result'
    sfx.lose()
    return
  }
  if (phase.value !== 'draw') return
  const reaction = performance.now() - startTime
  if (reaction < 100) {
    log.value.push(locale.current === 'pt-BR' ? `CEDO DEMAIS (${reaction.toFixed(0)}ms) — você perdeu.` : `TOO EARLY (${reaction.toFixed(0)}ms) — you lose.`)
    status.value = 'lost'
    sfx.lose()
  } else {
    log.value.push(locale.current === 'pt-BR' ? `${reaction.toFixed(0)}ms — você atirou primeiro!` : `${reaction.toFixed(0)}ms — you drew first!`)
    status.value = 'won'
    sfx.win()
  }
  phase.value = 'result'
}

function onKey(e: KeyboardEvent) {
  if (e.key === ' ') { e.preventDefault(); shoot() }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (drawTimer) clearTimeout(drawTimer)
})

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    title="SHOOTOUT"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="phase === 'count' && log.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Dê 10 passos. Atire quando vir HE DRAWS. ESPAÇO.' : 'Take 10 paces. Shoot when HE DRAWS appears. SPACE.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ DRAW!</button>
    </div>
    <div v-else class="font-mono text-center py-12 space-y-4">
      <p
        v-if="phase === 'count'"
        class="font-display text-3xl amber-phosphor text-shadow-neon animate-flicker"
      >{{ log[log.length - 1] }}</p>
      <p
        v-else-if="phase === 'draw'"
        class="font-display text-5xl danger-phosphor text-shadow-neon animate-pulse"
      >HE DRAWS!</p>
      <button
        v-if="phase !== 'result'"
        class="arcade-btn arcade-btn-magenta text-2xl px-8 py-4"
        @click="shoot"
      >☠ FIRE</button>
      <p v-if="phase === 'result'" class="text-2xl">
        <span v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display">★ YOU SHOT FIRST ★</span>
        <span v-else class="danger-phosphor text-shadow-neon font-display">✕ YOU'RE DEAD ✕</span>
      </p>
    </div>
  </CrtFrame>
</template>
