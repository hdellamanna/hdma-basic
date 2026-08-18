<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 9
const positions = ref<{ x: number; y: number; n: number }[]>([])
const moved = ref(-1)
const phase = ref<'idle' | 'show1' | 'show2' | 'ask' | 'next'>('idle')
const score = ref(0)
const streak = ref(0)
const input = ref('')
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')

let timer: number | null = null

function rand(n: number) { return Math.floor(Math.random() * n) }

function setup() {
  positions.value = []
  for (let i = 1; i <= 9; i++) {
    positions.value.push({ n: i, x: rand(W), y: rand(W) })
  }
  moved.value = -1
  phase.value = 'show1'
  sfx.start()
  timer = window.setTimeout(() => {
    // Move one
    const m = rand(9)
    moved.value = positions.value[m].n
    positions.value[m].x = rand(W)
    positions.value[m].y = rand(W)
    phase.value = 'show2'
    timer = window.setTimeout(() => {
      phase.value = 'ask'
    }, 1500)
  }, 2500)
}

function start() {
  score.value = 0
  streak.value = 0
  log.value = [locale.current === 'pt-BR' ? 'Memorize 9 números. Um se moveu.' : 'Memorize 9 numbers. One moved.']
  status.value = 'playing'
  input.value = ''
  setup()
}

function submit() {
  if (phase.value !== 'ask') return
  const v = parseInt(input.value, 10)
  if (isNaN(v) || v < 1 || v > 9) {
    sfx.error()
    input.value = ''
    return
  }
  sfx.type()
  if (v === moved.value) {
    score.value++
    streak.value++
    log.value.push(`✓ ${moved.value}`)
    sfx.coin()
    if (streak.value >= 5) {
      status.value = 'won'
      sfx.win()
      return
    }
  } else {
    streak.value = 0
    log.value.push(`✗ era ${moved.value}`)
    sfx.lose()
  }
  input.value = ''
  if (status.value === 'playing') {
    phase.value = 'next'
    timer = window.setTimeout(() => setup(), 800)
  }
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (phase.value === 'show1' || phase.value === 'show2') {
    // Skip to answer
    if (e.key === ' ') phase.value = 'ask'
  } else if (phase.value === 'ask') {
    if (e.key === 'Enter') submit()
    else if (/^[1-9]$/.test(e.key)) input.value = e.key
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (timer) clearTimeout(timer)
})

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="score"
    :status="status"
    title="OLHOS DE ESPião"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="streak === 0 && score === 0 && status === 'playing'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Memorize 9 números. Um se move. Qual?' : 'Memorize 9 numbers. One moves. Which?' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <p class="text-xs flex items-center justify-between">
        <span class="text-cyan">SCORE <span class="text-amber">{{ score }}</span></span>
        <span :class="streak >= 3 ? 'amber-phosphor' : 'text-ink-muted'">STREAK <span class="text-amber">{{ streak }}</span>/5</span>
      </p>
      <div class="relative bg-void-deep border border-surface-600 mx-auto" style="aspect-ratio: 1; max-width: 360px;">
        <div
          v-for="p in positions"
          :key="p.n"
          class="absolute w-7 h-7 grid place-items-center font-display text-base amber-phosphor text-shadow-neon transition-all duration-500"
          :style="{ left: `${(p.x / (W - 1)) * 100}%`, top: `${(p.y / (W - 1)) * 100}%`, transform: 'translate(-50%, -50%)' }"
        >{{ p.n }}</div>
      </div>
      <div class="border border-surface-600 bg-surface-800 p-2 h-16 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log.slice(-5)" :key="i" :class="i === log.slice(-5).length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <form v-if="phase === 'ask'" class="flex gap-1" @submit.prevent="submit">
        <input
          v-model="input"
          type="number"
          min="1"
          max="9"
          :placeholder="locale.current === 'pt-BR' ? 'qual se moveu? (1-9)' : 'which moved? (1-9)'"
          class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber text-center text-2xl outline-none focus:border-phosphor-green"
          autofocus
        />
      </form>
      <p v-else-if="phase === 'show1'" class="text-cyan text-xs text-center animate-pulse">
        {{ locale.current === 'pt-BR' ? 'MEMORIZE...' : 'MEMORIZE...' }}
      </p>
      <p v-else-if="phase === 'show2'" class="text-amber text-xs text-center animate-pulse">
        {{ locale.current === 'pt-BR' ? '1 mudou!' : '1 moved!' }}
      </p>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ OLHO DE ÁGUIA ★</p>
    </div>
  </CrtFrame>
</template>
