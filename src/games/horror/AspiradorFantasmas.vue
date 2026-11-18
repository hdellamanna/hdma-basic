<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const vac = ref(0)
const ghost = ref(0)
const ghostX = ref(0)
const lives = ref(3)
const score = ref(0)
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')
let timer: number | null = null

function start() {
  vac.value = 0
  ghost.value = Math.floor(Math.random() * 10)
  ghostX.value = 0
  lives.value = 3
  score.value = 0
  status.value = 'playing'
  if (timer) clearInterval(timer)
  timer = window.setInterval(() => {
    ghostX.value++
    if (ghostX.value >= 10) {
      lives.value--
      sfx.lose()
      if (lives.value <= 0) {
        status.value = 'lost'
        if (timer) clearInterval(timer)
      } else {
        ghostX.value = 0
        ghost.value = Math.floor(Math.random() * 10)
      }
    }
  }, 600)
}

function vacuum() {
  if (status.value !== 'playing') return
  if (vac.value === ghost.value && ghostX.value >= 7) {
    score.value += 10
    sfx.coin()
    ghostX.value = 0
    ghost.value = Math.floor(Math.random() * 10)
    if (score.value >= 30) {
      status.value = 'won'
      sfx.win()
      if (timer) clearInterval(timer)
    }
  } else {
    sfx.error()
  }
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'x' || e.key === 'X') vacuum()
  if (e.key === 'm' || e.key === 'M') {
    vac.value = (vac.value + 1) % 10
    sfx.tick()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (timer) clearInterval(timer)
})

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="score"
    :lives="lives"
    :status="status"
    :title="locale.current === 'pt-BR' ? 'ASPIRADOR DE FANTASMAS' : 'GHOST VACUUM'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-2">
        {{ locale.current === 'pt-BR' ? 'Mude o número do aspirador (M=0-9). X para aspirar. Número deve bater com o fantasma.' : 'Change vacuum number (M=0-9). X to vacuum. Number must match ghost.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-xs text-cyan">SCORE <span class="text-amber">{{ score }}</span>/30</p>
      <div class="border border-surface-600 bg-surface-800 p-2 h-16 flex items-center">
        <span
          class="magenta-phosphor text-shadow-neon text-2xl font-display transition-all"
          :style="{ marginLeft: `${ghostX * 10}%` }"
        >{{ ghost }}</span>
        <span class="text-ink-muted ml-auto text-xs">|</span>
        <span class="cyan-phosphor text-shadow-neon text-2xl font-display ml-2">{{ vac }}</span>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5" @click="vac = (vac + 1) % 10; sfx.tick()">M ({{ vac }})</button>
        <button class="arcade-btn arcade-btn-magenta text-[10px] py-1.5" @click="vacuum">X VACUUM</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ ASPIROU TUDO ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ SEM VIDAS ✕</p>
    </div>
  </CrtFrame>
</template>
