<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import GameLog from '../../components/GameLog.vue'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

interface Spirit {
  name: string
  era: 'past' | 'present' | 'future'
  place: 'home' | 'travel' | 'famous'
  gender: 'm' | 'f'
  alive: boolean
  namePool: Record<string, string>
}

const SPIRITS = computed(() => {
  const r = locale.current
  return [
    { name: r === 'pt-BR' ? 'Napoleão' : 'Napoleon', era: 'past', place: 'famous', gender: 'm' },
    { name: r === 'pt-BR' ? 'Cleópatra' : 'Cleopatra', era: 'past', place: 'famous', gender: 'f' },
    { name: r === 'pt-BR' ? 'Sua avó' : 'Your grandmother', era: 'past', place: 'home', gender: 'f' },
    { name: r === 'pt-BR' ? 'Albert Einstein' : 'Albert Einstein', era: 'past', place: 'famous', gender: 'm' },
    { name: r === 'pt-BR' ? 'Seu vizinho' : 'Your neighbor', era: 'present', place: 'home', gender: 'm' },
    { name: r === 'pt-BR' ? 'A princesa Diana' : 'Princess Diana', era: 'past', place: 'famous', gender: 'f' },
    { name: r === 'pt-BR' ? 'Um astronauta' : 'An astronaut', era: 'future', place: 'travel', gender: 'm' },
    { name: r === 'pt-BR' ? 'Marie Curie' : 'Marie Curie', era: 'past', place: 'famous', gender: 'f' },
  ]
})

const target = ref<typeof SPIRITS.value[number] | null>(null)
const guesses = ref<{ q: string; a: string }[]>([])
const tries = ref(0)
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')
const input = ref('')

function start() {
  target.value = SPIRITS.value[Math.floor(Math.random() * SPIRITS.value.length)]
  guesses.value = []
  tries.value = 7
  log.value = [locale.current === 'pt-BR' ? 'Espírito presente! Faça 7 perguntas sim/não.' : 'A spirit is present! Ask 7 yes/no questions.']
  status.value = 'playing'
  input.value = ''
}

function ask() {
  if (status.value !== 'playing' || !target.value) return
  const q = input.value.toLowerCase().trim()
  if (!q) return
  let ans = ''
  if (q.includes('passado') || q.includes('past')) ans = target.value.era === 'past' ? (locale.current === 'pt-BR' ? 'SIM' : 'YES') : (locale.current === 'pt-BR' ? 'NÃO' : 'NO')
  else if (q.includes('presente') || q.includes('present') || q.includes('futuro') || q.includes('future')) ans = target.value.era === (q.includes('future') || q.includes('futuro') ? 'future' : 'present') ? (locale.current === 'pt-BR' ? 'SIM' : 'YES') : (locale.current === 'pt-BR' ? 'NÃO' : 'NO')
  else if (q.includes('casa') || q.includes('home')) ans = target.value.place === 'home' ? (locale.current === 'pt-BR' ? 'SIM' : 'YES') : (locale.current === 'pt-BR' ? 'NÃO' : 'NO')
  else if (q.includes('viajou') || q.includes('travel') || q.includes('viajou') || q.includes('viajou muito') || q.includes('famous') || q.includes('famoso') || q.includes('célebre')) ans = target.value.place === 'travel' || target.value.place === 'famous' ? (locale.current === 'pt-BR' ? 'SIM' : 'YES') : (locale.current === 'pt-BR' ? 'NÃO' : 'NO')
  else if (q.includes('mulher') || q.includes('woman') || q.includes('female')) ans = target.value.gender === 'f' ? (locale.current === 'pt-BR' ? 'SIM' : 'YES') : (locale.current === 'pt-BR' ? 'NÃO' : 'NO')
  else if (q.includes('homem') || q.includes('man') || q.includes('male')) ans = target.value.gender === 'm' ? (locale.current === 'pt-BR' ? 'SIM' : 'YES') : (locale.current === 'pt-BR' ? 'NÃO' : 'NO')
  else {
    ans = Math.random() < 0.5 ? (locale.current === 'pt-BR' ? 'SIM' : 'YES') : (locale.current === 'pt-BR' ? 'NÃO' : 'NO')
  }
  log.value.push(`▶ ${q} → ${ans}`)
  tries.value--
  if (tries.value <= 0) {
    status.value = 'lost'
    sfx.lose()
  }
  input.value = ''
  sfx.type()
}

function accuse() {
  if (status.value !== 'playing' || !target.value) return
  const g = input.value.trim().toLowerCase()
  if (g === target.value.name.toLowerCase()) {
    status.value = 'won'
    sfx.win()
    log.value.push(`★ ${target.value.name}`)
  } else {
    log.value.push(locale.current === 'pt-BR' ? '✗ Não é esse' : '✗ Wrong one')
    tries.value--
    if (tries.value <= 0) {
      status.value = 'lost'
      sfx.lose()
    }
  }
  input.value = ''
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'SESSÃO ESPÍRITA' : 'SÉANCE'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="tries === 0 && log.length === 0 && status === 'playing'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-2">
        {{ locale.current === 'pt-BR' ? 'Faça perguntas (passado? famoso? mulher?) e acuse em 7 perguntas.' : 'Ask questions (past? famous? female?) and accuse in 7.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-cyan text-xs">TRIES <span :class="tries < 3 ? 'danger-phosphor' : 'text-amber'">{{ tries }}</span></p>
      <GameLog :entries="log" class="border border-surface-600 bg-surface-800 p-2 h-32 text-xs space-y-0.5" />
      <form v-if="status === 'playing'" class="space-y-1" @submit.prevent="ask">
        <input
          v-model="input"
          :aria-label="locale.isPt ? 'Pergunta ou nome' : 'Question or name'"
          :placeholder="locale.current === 'pt-BR' ? 'pergunta (ou nome)' : 'question (or name)'"
          class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber outline-none focus:border-phosphor-green w-full"
        />
        <div class="grid grid-cols-2 gap-1">
          <button type="button" class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5" @click="ask">{{ locale.current === 'pt-BR' ? 'PERGUNTAR' : 'ASK' }}</button>
          <button type="button" class="arcade-btn arcade-btn-magenta text-[10px] py-1.5" @click="accuse">{{ locale.current === 'pt-BR' ? 'ACUSAR' : 'ACCUSE' }}</button>
        </div>
      </form>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ IDENTIFICADO ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center">✕ PERDEU O CONTATO ✕</p>
    </div>
  </CrtFrame>
</template>
