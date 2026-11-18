<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import { useRoundTimer } from '../../composables/useRoundTimer'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const L = ref(1)
const K = ref(0)
const phase = ref<'idle' | 'show' | 'recall' | 'result'>('idle')
const sequence = ref<string[]>([])
const guess = ref<string[]>([])
const score = ref(0)
const highScore = ref(0)
const input = ref('')
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')

const { schedule, cancel } = useRoundTimer()

function start() {
  cancel()
  score.value = 0
  L.value = 1
  K.value = 0
  status.value = 'playing'
  log.value = [locale.current === 'pt-BR' ? 'Espiobot ativo. Memorize a sequência.' : 'Spybot active. Memorize the sequence.']
  nextRound()
}

function nextRound() {
  if (K.value >= 5) {
    L.value++
    K.value = 0
  }
  sequence.value = []
  for (let i = 0; i < L.value; i++) {
    sequence.value.push(Math.random() < 0.5 ? 'E' : 'D')
  }
  guess.value = []
  phase.value = 'show'
  sfx.start()
  const showTime = Math.max(800, L.value * 600)
  schedule(() => {
    phase.value = 'recall'
  }, showTime)
}

function submitChar(c: string) {
  if (phase.value !== 'recall') return
  if (c !== 'E' && c !== 'D') return
  guess.value.push(c)
  const idx = guess.value.length - 1
  if (c !== sequence.value[idx]) {
    // wrong
    log.value.push(`✗ esperado ${sequence.value.join('')}`)
    sfx.lose()
    phase.value = 'result'
    if (score.value > highScore.value) highScore.value = score.value
    schedule(() => {
      status.value = score.value > 20 ? 'won' : 'lost'
    }, 1500)
    return
  }
  sfx.type()
  if (guess.value.length === sequence.value.length) {
    // correct
    score.value += L.value
    K.value++
    log.value.push(`✓ ${sequence.value.join('')} +${L.value}`)
    sfx.powerup()
    phase.value = 'result'
    if (score.value >= 30) {
      status.value = 'won'
      sfx.win()
      return
    }
    schedule(() => nextRound(), 1500)
  }
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (phase.value === 'recall') {
    if (e.key === 'e' || e.key === 'E' || e.key === 'd' || e.key === 'D' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const c = (e.key === 'e' || e.key === 'E' || e.key === 'ArrowLeft') ? 'E' : 'D'
      submitChar(c)
    }
  }
}

import { onMounted, onUnmounted } from 'vue'
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="score"
    :status="status"
    title="ESPIOBOT"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="phase === 'idle'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Memorize ESQ/DIR. Sequência cresce a cada 5 acertos.' : 'Memorize L/R. Sequence grows every 5 hits.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <p class="text-xs flex items-center justify-between">
        <span class="text-cyan">SCORE <span class="text-amber">{{ score }}</span></span>
        <span class="text-ink-muted">LEN <span class="text-amber">{{ L }}</span></span>
        <span class="text-ink-muted">REC <span class="text-amber">{{ highScore }}</span></span>
      </p>
      <div v-if="phase === 'show'" class="border border-surface-600 bg-surface-800 p-6 text-center amber-phosphor text-shadow-neon font-display text-3xl">
        {{ sequence.join(' ') }}
      </div>
      <div v-else-if="phase === 'recall'" class="border border-surface-600 bg-surface-800 p-6 text-center cyan-phosphor text-shadow-neon font-display text-3xl">
        {{ guess.join(' ') || '_'.repeat(sequence.length) }}
      </div>
      <div v-else class="border border-surface-600 bg-surface-800 p-6 text-center text-ink-muted font-display text-2xl">
        —
      </div>
      <div v-if="phase === 'recall'" class="grid grid-cols-2 gap-1">
        <button class="arcade-btn text-[10px] py-2" @click="submitChar('E')">E / ◀</button>
        <button class="arcade-btn text-[10px] py-2" @click="submitChar('D')">D / ▶</button>
      </div>
      <div class="border border-surface-600 bg-surface-800 p-2 h-16 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log.slice(-4)" :key="i" :class="i === log.slice(-4).length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ ESPIÃO SUPREMO ★</p>
    </div>
  </CrtFrame>
</template>
