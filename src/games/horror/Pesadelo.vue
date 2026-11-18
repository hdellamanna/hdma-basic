<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const score = ref(300)
const target = ref(0)
const input = ref('')
const log = ref<string[]>([])
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')
let timer: number | null = null

const INSULTS = computed(() => {
  const r = locale.current
  return r === 'pt-BR'
    ? ['SEU BURRO!', 'NÃO PODE COMIGO!', 'SEU USUÁRIO ESPERTO!', 'BURRÃO!', 'ESTÁ PERDENDO!']
    : ['YOU FOOL!', 'YOU CAN\'T BEAT ME!', 'CLEVER USER!', 'YOU IDIOT!', 'LOSING!']
})

function start() {
  score.value = 300
  log.value = []
  status.value = 'playing'
  nextNumber()
  if (timer) clearInterval(timer)
  timer = window.setInterval(() => {
    score.value = Math.max(0, score.value - 5)
    if (score.value <= 0) {
      log.value.push(locale.current === 'pt-BR' ? '✕ Escravo do computador!' : '✕ Slave of the computer!')
      status.value = 'lost'
      sfx.lose()
      if (timer) clearInterval(timer)
    }
  }, 2000)
}

function nextNumber() {
  target.value = 1 + Math.floor(Math.random() * 9)
  const insult = INSULTS.value[Math.floor(Math.random() * INSULTS.value.length)]
  log.value.push(`${insult} → N=${target.value} (${score.value})`)
}

function submit() {
  if (status.value !== 'playing') return
  const v = parseInt(input.value, 10)
  if (isNaN(v)) return
  if (v === target.value) {
    score.value += 10 + Math.floor(Math.random() * 11)
    sfx.coin()
    log.value.push(`✓ ${v}`)
    input.value = ''
    if (score.value >= 500) {
      log.value.push(locale.current === 'pt-BR' ? '★ Você venceu!' : '★ You won!')
      status.value = 'won'
      sfx.win()
      if (timer) clearInterval(timer)
      return
    }
    nextNumber()
  } else {
    score.value -= 10
    sfx.error()
    log.value.push(`✗ ${v}`)
    input.value = ''
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter') submit()
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
    :status="status"
    title="PESADELO"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'O computador te insulta. Repita os números. Chegue a 500 antes de cair a 0.' : 'The computer insults you. Repeat the numbers. Reach 500 before dropping to 0.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-cyan text-xs">SCORE <span :class="score < 100 ? 'danger-phosphor' : 'amber-phosphor'">{{ score }}</span> / 500</p>
      <div class="border border-surface-600 bg-surface-800 p-2 h-32 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log.slice(-8)" :key="i" :class="i === log.slice(-8).length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <form v-if="status === 'playing'" class="flex gap-1" @submit.prevent="submit">
        <input
          v-model="input"
          type="number"
          min="1"
          max="9"
          class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber text-center text-2xl outline-none focus:border-phosphor-green"
          autofocus
        />
      </form>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ VENCEU ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center">✕ ESCRAVO ✕</p>
    </div>
  </CrtFrame>
</template>
