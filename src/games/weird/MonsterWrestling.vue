<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import GameLog from '../../components/GameLog.vue'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const round = ref(0)
const maxRounds = 12
const size = ref(0)
const dist = ref(0)
const answer = ref('')
const panics = ref(0)
const input = ref('')
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')
const showPanic = ref(false)
const heartbeat = ref(0)
const oxygen = ref(0)
let timer: number | null = null

function start() {
  round.value = 0
  panics.value = 0
  status.value = 'playing'
  nextRound()
}

function nextRound() {
  round.value++
  if (round.value > maxRounds) {
    status.value = 'won'
    sfx.win()
    return
  }
  size.value = Math.floor(Math.random() * 8) + 6 + round.value
  dist.value = Math.floor(Math.random() * 8) + 6 + round.value
  showPanic.value = false
  input.value = ''
}

function submit() {
  if (status.value !== 'playing' || showPanic.value) return
  const a = parseInt(input.value, 10)
  if (isNaN(a)) return
  const correct = size.value * dist.value
  if (a === correct) {
    log.value.push(`▶ ${a} ✓`)
    sfx.powerup()
    nextRound()
  } else {
    log.value.push(`✕ ${a} (era ${correct})`)
    status.value = 'lost'
    sfx.lose()
  }
}

function panic() {
  if (showPanic.value) return
  panics.value++
  if (panics.value >= 4) {
    status.value = 'lost'
    sfx.lose()
    return
  }
  showPanic.value = true
  heartbeat.value = Math.floor(Math.random() * 8) + 1
  oxygen.value = Math.floor(Math.random() * 6) + 2
  input.value = ''
  sfx.error()
}

function submitPanic() {
  if (!showPanic.value) return
  const a = parseFloat(input.value)
  if (isNaN(a)) return
  // Adrenalin = heartbeat / oxygen
  const correct = heartbeat.value / oxygen.value
  if (Math.abs(a - correct) < 0.01) {
    log.value.push(`▶ panic ${a.toFixed(2)} ✓`)
    sfx.powerup()
    showPanic.value = false
    input.value = ''
    nextRound()
  } else {
    log.value.push(`✕ ${a.toFixed(2)} (era ${correct.toFixed(2)})`)
    status.value = 'lost'
    sfx.lose()
  }
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'p' || e.key === 'P') panic()
  if (e.key === 'Enter') {
    if (showPanic.value) submitPanic()
    else submit()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'LUTA DE MONSTROS' : 'MONSTER WRESTLING'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="round === 0 && status === 'playing'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Multiplique TAMANHO × DISTÂNCIA. P = pânico (4 morre).' : 'Multiply SIZE × DISTANCE. P = panic (4 dies).' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-xs flex items-center justify-between">
        <span class="text-cyan">ROUND <span class="text-amber">{{ round }}</span>/{{ maxRounds }}</span>
        <span :class="panics >= 3 ? 'danger-phosphor' : 'text-amber'">PANICS {{ panics }}/4</span>
      </p>
      <div v-if="!showPanic" class="border border-surface-600 bg-surface-800 p-4 space-y-2 text-center">
        <p class="text-cyan">SIZE: <span class="amber-phosphor text-shadow-neon font-display text-2xl">{{ size }}</span></p>
        <p class="text-cyan">DISTANCE: <span class="amber-phosphor text-shadow-neon font-display text-2xl">{{ dist }}</span></p>
        <p class="text-ink-muted text-xs">{{ size }} × {{ dist }} = ?</p>
      </div>
      <div v-else class="border border-danger/40 bg-danger/10 p-4 space-y-2 text-center">
        <p class="danger-phosphor text-shadow-neon font-display animate-pulse">⚠ PÂNICO</p>
        <p class="text-cyan text-sm">HEARTBEAT: <span class="amber-phosphor text-shadow-neon font-display">{{ heartbeat }}</span></p>
        <p class="text-cyan text-sm">OXYGEN: <span class="amber-phosphor text-shadow-neon font-display">{{ oxygen }}</span></p>
        <p class="text-ink-muted text-xs">ADRENALIN = heartbeat / oxygen</p>
      </div>
      <GameLog :entries="log" class="border border-surface-600 bg-surface-800 p-2 h-16 text-xs space-y-0.5" />
      <div v-if="status === 'playing'" class="flex gap-1">
        <input
          v-model="input"
          :aria-label="showPanic ? (locale.isPt ? 'Dose de adrenalina' : 'Adrenaline dose') : (locale.isPt ? 'Produto do tamanho pela distância' : 'Product of size and distance')"
          type="number"
          step="0.01"
          class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber text-center outline-none focus:border-phosphor-green"
          @keyup.enter="showPanic ? submitPanic() : submit()"
          autofocus
        />
        <button class="arcade-btn-ghost border border-surface-600 px-2 text-[10px]" @click="panic">P</button>
      </div>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ SURVIVED ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center">✕ CRUSHED ✕</p>
    </div>
  </CrtFrame>
</template>
