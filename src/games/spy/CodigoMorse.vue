<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const MORSE: Record<string, string> = {
  A: '·-', B: '-···', C: '-·-·', D: '-··', E: '·', F: '··-·',
  G: '--·', H: '····', I: '··', J: '·---', K: '-·-', L: '·-··',
  M: '--', N: '-·', O: '---', P: '·--·', Q: '--·-', R: '·-·',
  S: '···', T: '-', U: '··-', V: '···-', W: '·--', X: '-··-',
  Y: '-·--', Z: '--··', 1: '·----', 2: '··---', 3: '···--',
  4: '····-', 5: '·····', 6: '-····', 7: '--···', 8: '---··', 9: '----·',
  0: '-----',
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const current = ref('')
const phase = ref<'idle' | 'show' | 'pick' | 'result'>('idle')
const score = ref(0)
const streak = ref(0)
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')

function start() {
  score.value = 0
  streak.value = 0
  log.value = []
  status.value = 'playing'
  next()
}

function next() {
  current.value = LETTERS[Math.floor(Math.random() * LETTERS.length)]
  phase.value = 'show'
  sfx.tick()
  setTimeout(() => {
    phase.value = 'pick'
  }, 1500)
}

function pick(letter: string) {
  if (phase.value !== 'pick') return
  sfx.type()
  if (letter === current.value) {
    score.value++
    streak.value++
    log.value.push(`✓ ${letter} = ${MORSE[letter]}`)
    sfx.coin()
    if (streak.value >= 10) {
      status.value = 'won'
      sfx.win()
      return
    }
  } else {
    streak.value = 0
    log.value.push(`✗ ${letter} (era ${current.value})`)
    sfx.error()
  }
  phase.value = 'result'
  setTimeout(() => next(), 1000)
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (phase.value === 'pick' && /^[a-zA-Z]$/.test(e.key)) {
    pick(e.key.toUpperCase())
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function onQuit() { router.push('/') }

const morse = computed(() => MORSE[current.value] || '?')
</script>

<template>
  <CrtFrame
    :score="score"
    :status="status"
    title="CÓDIGO MORSE"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="streak === 0 && score === 0 && status === 'playing'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Decodifique o Morse. Clique na letra correta.' : 'Decode the Morse. Click the right letter.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <p class="text-xs flex items-center justify-between">
        <span class="text-cyan">SCORE <span class="text-amber">{{ score }}</span></span>
        <span :class="streak >= 5 ? 'amber-phosphor' : 'text-ink-muted'">STREAK <span class="text-amber">{{ streak }}</span>/10</span>
      </p>
      <div class="border border-surface-600 bg-surface-800 p-6 text-center amber-phosphor text-shadow-neon font-display text-4xl">
        {{ phase === 'show' ? morse : (phase === 'pick' ? '?' : '') }}
      </div>
      <div v-if="phase === 'pick'" class="grid grid-cols-9 gap-1">
        <button
          v-for="l in LETTERS"
          :key="l"
          class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5"
          @click="pick(l)"
        >{{ l }}</button>
      </div>
      <div class="border border-surface-600 bg-surface-800 p-2 h-16 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log.slice(-4)" :key="i" :class="i === log.slice(-4).length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ OPERADOR MORSE ★</p>
    </div>
  </CrtFrame>
</template>
