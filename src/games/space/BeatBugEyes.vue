<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import { useRoundTimer } from '../../composables/useRoundTimer'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const score = ref(0)
const round = ref(0)
const target = ref(0)
const active = ref(false)
const startTime = ref(0)
const status = ref<'playing' | 'won' | 'lost'>('playing')

const POSITIONS = [
  { top: '15%', left: '15%' },
  { top: '15%', left: '65%' },
  { top: '65%', left: '15%' },
  { top: '65%', left: '65%' },
]

const targetPos = ref(POSITIONS[0])
const { schedule } = useRoundTimer()

function nextRound() {
  round.value++
  if (round.value > 10) {
    status.value = 'won'
    sfx.win()
    return
  }
  target.value = Math.floor(Math.random() * 4) + 1
  targetPos.value = POSITIONS[target.value - 1]
  startTime.value = performance.now()
  active.value = true
  // Random visible duration
  const visible = 400 + Math.random() * 1200
  schedule(() => {
    active.value = false
    schedule(nextRound, 500)
  }, visible)
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (!active.value) return
  const k = parseInt(e.key, 10)
  if (k >= 1 && k <= 4 && k === target.value) {
    const reaction = performance.now() - startTime.value
    score.value += Math.max(0, Math.floor(100 - reaction / 10))
    sfx.hit()
    active.value = false
    schedule(nextRound, 200)
  }
}

function start() {
  score.value = 0
  round.value = 0
  status.value = 'playing'
  nextRound()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="score"
    :status="status"
    title="BEAT THE BUG EYES"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'playing' && round === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR'
          ? 'Pressione 1, 2, 3 ou 4 quando os olhos aparecem no quadrante certo.'
          : 'Press 1, 2, 3 or 4 when eyes appear in the matching quadrant.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else-if="status === 'playing'" class="relative w-full h-[60vh] min-h-[360px] bg-void-deep">
      <div class="absolute inset-0 grid grid-cols-2 grid-rows-2">
        <div v-for="(p, i) in POSITIONS" :key="i" class="border border-surface-700/50"></div>
      </div>
      <transition name="bug">
        <div
          v-if="active"
          class="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          :style="{ top: targetPos.top, left: targetPos.left }"
        >
          <div class="flex gap-2">
            <div class="h-8 w-8 rounded-full bg-amber shadow-neon-amber animate-pulse"></div>
            <div class="h-8 w-8 rounded-full bg-amber shadow-neon-amber animate-pulse"></div>
          </div>
          <p class="text-amber text-shadow-neon font-display text-[10px] mt-1">[{{ target }}]</p>
        </div>
      </transition>
      <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-display tracking-widest text-ink-muted">
        <span class="text-amber">{{ score }}</span>
        <span>Round {{ round }}/10</span>
      </div>
    </div>
    <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center py-6 text-lg">★ {{ score }} ★</p>
  </CrtFrame>
</template>

<style scoped>
.bug-enter-active, .bug-leave-active { transition: opacity 0.05s; }
.bug-enter-from, .bug-leave-to { opacity: 0; }
</style>
