<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const shipX = ref(50)
const iceX = ref(50)
const iceY = ref(20)
const turn = ref(0)
const log = ref<string[]>([])
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')
const heading = ref('')

function start() {
  shipX.value = 50
  iceX.value = 50
  iceY.value = 20
  turn.value = 0
  log.value = []
  status.value = 'playing'
  heading.value = ''
}

function submit() {
  const h = parseFloat(heading.value)
  if (isNaN(h)) return
  turn.value++
  sfx.type()
  // iceberg drifts
  iceY.value += 5 + Math.random() * 5
  iceX.value += (Math.random() - 0.5) * 10
  // ship moves with heading
  shipX.value = Math.max(0, Math.min(100, shipX.value + h))
  const dist = Math.abs(shipX.value - iceX.value)
  log.value.push(`▶ T${turn.value} h=${h} → dist=${dist.toFixed(1)}`)
  if (dist < 10) {
    log.value.push(locale.current === 'pt-BR' ? '✕ CRASHED NO ICEBERG' : '✕ CRASHED INTO ICEBERG')
    status.value = 'lost'
    sfx.lose()
  } else if (turn.value >= 10) {
    log.value.push(locale.current === 'pt-BR' ? '★ SOBREVIVEU' : '★ SURVIVED')
    status.value = 'won'
    sfx.win()
  }
  heading.value = ''
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'Enter') submit()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    title="ICEBERG"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Direcione o navio (-10 a +10) para evitar o iceberg em 10 turnos.' : 'Steer the ship (-10 to +10) to avoid the iceberg in 10 turns.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-cyan text-xs">TURN <span class="text-amber">{{ turn }}</span>/10</p>
      <div class="relative h-32 bg-gradient-to-b from-blue-900/30 to-blue-950/50 border border-surface-600 overflow-hidden">
        <div class="absolute inset-x-0 bottom-0 h-4 bg-blue-400/20"></div>
        <div
          class="absolute text-cyan text-3xl"
          :style="{ left: `${shipX}%`, top: '50%', transform: 'translate(-50%, -50%)' }"
        >⛵</div>
        <div
          class="absolute text-blue-200 text-3xl"
          :style="{ left: `${iceX}%`, top: `${iceY}%`, transform: 'translate(-50%, -50%)' }"
        >▲</div>
      </div>
      <div class="border border-surface-600 bg-surface-800 p-2 h-20 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <form v-if="status === 'playing'" class="flex gap-1" @submit.prevent="submit">
        <input
          v-model="heading"
          type="number"
          min="-10"
          max="10"
          placeholder="-10 to +10"
          class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber text-center outline-none focus:border-phosphor-green"
          autofocus
        />
        <button class="arcade-btn arcade-btn-amber">▶</button>
      </form>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ SAFE HARBOR ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center">✕ TITANIC ✕</p>
    </div>
  </CrtFrame>
</template>
