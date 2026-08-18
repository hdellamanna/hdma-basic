<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const PUZZLES = [
  {
    q: { 'pt-BR': 'O que tem raízes que ninguém vê, é mais alto que árvores, sobe e não volta?', en: 'What has roots nobody sees, is taller than trees, goes up and never comes down?' },
    a: ['montanha', 'mountain'],
    hint: { 'pt-BR': 'Está na Terra, é grande e imóvel.', en: 'It\'s on Earth, big and unmoving.' },
  },
  {
    q: { 'pt-BR': 'Quanto mais você tem, menos você vê. O que é?', en: 'The more you have, the less you see. What is it?' },
    a: ['escuridao', 'escuridão', 'darkness'],
    hint: { 'pt-BR': 'Oposto da luz.', en: 'Opposite of light.' },
  },
  {
    q: { 'pt-BR': 'Tem cidades mas não casas, montanhas mas não árvores, água mas não peixes. O que é?', en: 'Has cities but no houses, mountains but no trees, water but no fish. What is it?' },
    a: ['mapa', 'map'],
    hint: { 'pt-BR': 'Representa lugares.', en: 'Represents places.' },
  },
  {
    q: { 'pt-BR': 'Pode ser quebrado, mas nunca segurado. O que é?', en: 'Can be broken, but never held. What is it?' },
    a: ['promessa', 'promise'],
    hint: { 'pt-BR': 'É uma palavra.', en: 'It\'s a word.' },
  },
  {
    q: { 'pt-BR': 'Anda sem pés, sussurra sem boca, toca sem mãos. O que é?', en: 'Walks without feet, whispers without mouth, touches without hands. What is it?' },
    a: ['vento', 'wind'],
    hint: { 'pt-BR': 'Vem do céu.', en: 'Comes from the sky.' },
  },
]

const idx = ref(0)
const year = ref(2025)
const input = ref('')
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')
const showHint = ref(false)

function check() {
  const ans = input.value.trim().toLowerCase()
  if (!ans) return
  if (PUZZLES[idx.value].a.includes(ans)) {
    sfx.powerup()
    year.value += 200
    log.value.push(`✓ "${ans}" → +200 anos`)
    idx.value++
    input.value = ''
    showHint.value = false
    if (idx.value >= PUZZLES.length) {
      status.value = 'won'
      sfx.win()
    }
  } else {
    sfx.error()
    log.value.push(`✗ "${ans}" → errado`)
    input.value = ''
  }
}

function hint() {
  showHint.value = true
  sfx.tick()
}

function start() {
  idx.value = 0
  year.value = 2025
  log.value = []
  status.value = 'playing'
  showHint.value = false
  input.value = ''
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="year"
    :status="status"
    title="TRIP INTO THE FUTURE"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'playing' && idx === 0 && log.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR'
          ? 'Resolva 5 enigmas para chegar ao ano 3000.'
          : 'Solve 5 riddles to reach the year 3000.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else-if="status === 'playing'" class="font-mono space-y-2">
      <p class="text-cyan text-lg">YEAR <span class="font-bold amber-phosphor">{{ year }}</span></p>
      <p class="text-xs text-ink-muted">Puzzle {{ idx + 1 }}/{{ PUZZLES.length }}</p>
      <div class="border border-surface-600 bg-surface-800 p-3 text-amber text-sm">
        {{ PUZZLES[idx].q[locale.current] }}
      </div>
      <p v-if="showHint" class="text-ink-muted text-xs italic">
        {{ locale.current === 'pt-BR' ? 'Dica:' : 'Hint:' }} {{ PUZZLES[idx].hint[locale.current] }}
      </p>
      <div class="border border-surface-600 bg-surface-800 p-2 h-20 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <form class="flex gap-1" @submit.prevent="check">
        <input
          v-model="input"
          class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber outline-none focus:border-phosphor-green"
          :placeholder="locale.current === 'pt-BR' ? 'resposta' : 'answer'"
          autofocus
        />
        <button type="button" class="arcade-btn-ghost border border-surface-600 px-2 text-[10px]" @click="hint">?</button>
      </form>
    </div>
    <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center py-6 text-lg">★ YEAR 3000! ★</p>
  </CrtFrame>
</template>
