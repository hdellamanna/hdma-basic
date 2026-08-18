<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const g = ref(0)
const w = ref(0)
const r = ref(0)
const tries = ref(0)
const triesLeft = ref(10)
const guess = ref('')
const status = ref<'playing' | 'won' | 'lost'>('playing')
const log = ref<string[]>([])

const ui = {
  intro: {
    'pt-BR': 'Computador alienígena. Calcule a força de decolagem G × W em 10 tentativas.',
    en: 'Alien computer. Calculate the takeoff thrust G × W in 10 tries.',
  },
  gravity: { 'pt-BR': 'GRAVIDADE:', en: 'GRAVITY:' },
  triesLeft: { 'pt-BR': 'Tentativas restantes:', en: 'Tries left:' },
  enterForce: { 'pt-BR': 'Força:', en: 'Force:' },
  tooHigh: { 'pt-BR': 'TOO HIGH — fail-safe.', en: 'TOO HIGH — fail-safe.' },
  tooLow: { 'pt-BR': 'TOO LOW — não levanta.', en: 'TOO LOW — won\'t lift.' },
  youWon: { 'pt-BR': 'GOOD TAKE OFF!', en: 'GOOD TAKE OFF!' },
  youFailed: { 'pt-BR': 'THE ALIENS GOT YOU.', en: 'THE ALIENS GOT YOU.' },
}

function start() {
  g.value = Math.floor(Math.random() * 20) + 1
  w.value = Math.floor(Math.random() * 40) + 1
  r.value = g.value * w.value
  tries.value = 0
  triesLeft.value = 10
  guess.value = ''
  status.value = 'playing'
  log.value = [`${ui.gravity[locale.current]} ${g.value}`, `${ui.triesLeft[locale.current]} 10`]
}

function submit() {
  const f = parseInt(guess.value, 10)
  if (isNaN(f)) return
  tries.value++
  triesLeft.value = 10 - tries.value
  sfx.type()
  if (f === r.value) {
    log.value.push(`Força ${f} → ${ui.youWon[locale.current]}`)
    status.value = 'won'
    sfx.win()
  } else if (f > r.value) {
    log.value.push(`${f} → ${ui.tooHigh[locale.current]}`)
    sfx.error()
  } else {
    log.value.push(`${f} → ${ui.tooLow[locale.current]}`)
    sfx.error()
  }
  if (tries.value >= 10 && status.value === 'playing') {
    status.value = 'lost'
    log.value.push(`${ui.youFailed[locale.current]} (era ${r.value})`)
    sfx.lose()
  }
  guess.value = ''
}

function onQuit() { router.push('/') }

const accent = computed(() => 'phosphor')
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'STARSHIP TAKEOFF' : 'STARSHIP TAKEOFF'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="r === 0 && tries === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">{{ ui.intro[locale.current] }}</p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2 text-amber">
      <p class="text-cyan text-lg">{{ ui.gravity[locale.current] }} <span class="font-bold">{{ g }}</span></p>
      <p class="text-ink-muted text-xs">{{ ui.triesLeft[locale.current] }} <span :class="triesLeft <= 2 ? 'danger-phosphor' : 'text-amber'">{{ triesLeft }}</span></p>
      <div class="border border-surface-600 bg-surface-800 p-3 h-40 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <form v-if="status === 'playing'" class="flex items-center gap-2" @submit.prevent="submit">
        <span class="text-cyan">▶</span>
        <input
          v-model="guess"
          type="number"
          min="1"
          :placeholder="ui.enterForce[locale.current]"
          class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber outline-none focus:border-phosphor-green"
          autofocus
        />
      </form>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center py-2">★ {{ ui.youWon[locale.current] }} ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center py-2">✕ {{ ui.youFailed[locale.current] }} ✕</p>
    </div>
  </CrtFrame>
</template>
