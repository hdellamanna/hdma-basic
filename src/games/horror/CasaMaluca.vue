<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const doors = ref<{ x: number; dir: number }[]>([
  { x: 3, dir: 1 },
  { x: 5, dir: -1 },
  { x: 7, dir: -1 },
])
const ghostDist = ref(40)
const log = ref<string[]>([])
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')

function start() {
  doors.value = [
    { x: 3, dir: 1 },
    { x: 5, dir: -1 },
    { x: 7, dir: -1 },
  ]
  ghostDist.value = 40
  log.value = []
  status.value = 'playing'
  sfx.start()
}

function flip(idx: number) {
  if (status.value !== 'playing') return
  const door = doors.value[idx]
  if (door.x + door.dir < 0 || door.x + door.dir > 10) door.dir *= -1
  door.x += door.dir
  // Check alignment
  const xs = doors.value.map((d) => d.x)
  if (xs[0] === xs[1] && xs[1] === xs[2]) {
    status.value = 'won'
    sfx.win()
    log.value.push(locale.current === 'pt-BR' ? '★ Portas alinhadas!' : '★ Doors aligned!')
  } else {
    ghostDist.value -= 5
    log.value.push(locale.current === 'pt-BR' ? `▶ moveu porta ${idx + 1}` : `▶ moved door ${idx + 1}`)
    if (ghostDist.value <= 0) {
      status.value = 'lost'
      sfx.lose()
    }
  }
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === '1') flip(0)
  if (e.key === '2') flip(1)
  if (e.key === '3') flip(2)
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'CASA MALUCA' : 'CRAZY HOUSE'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-2">
        {{ locale.current === 'pt-BR' ? 'Alinhe as 3 portas (1/2/3) antes do fantasma te pegar.' : 'Align the 3 doors (1/2/3) before the ghost catches you.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-cyan text-xs">GHOST DIST <span :class="ghostDist < 10 ? 'danger-phosphor' : 'text-amber'">{{ ghostDist }}</span></p>
      <div class="relative h-40 bg-void-deep border border-surface-600 overflow-hidden">
        <div
          v-for="(d, i) in doors"
          :key="i"
          class="absolute h-6 w-2 bg-phosphor-green shadow-neon-green transition-all"
          :style="{ left: `calc(${d.x * 10}% - ${d.x * 0.8}px)`, top: `${12 + i * 28}%` }"
        ></div>
        <div
          v-if="ghostDist < 20"
          class="absolute top-1/2 -translate-y-1/2 danger-phosphor text-shadow-neon font-display text-2xl animate-pulse"
          :style="{ left: `${ghostDist * 2}%` }"
        >G</div>
      </div>
      <div class="grid grid-cols-3 gap-1">
        <button class="arcade-btn" @click="flip(0)">1</button>
        <button class="arcade-btn" @click="flip(1)">2</button>
        <button class="arcade-btn" @click="flip(2)">3</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ ESCAPED ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ CAUGHT ✕</p>
    </div>
  </CrtFrame>
</template>
