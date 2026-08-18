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
    q: { 'pt-BR': 'O que tem 4 pernas de manhã, 2 ao meio-dia e 3 à noite?', en: 'What has 4 legs in the morning, 2 at noon and 3 at night?' },
    a: ['homem', 'man', 'humano', 'human', 'pessoa', 'person'],
    hint: { 'pt-BR': 'Enigma da Esfinge.', en: 'Riddle of the Sphinx.' },
  },
  {
    q: { 'pt-BR': 'Quanto mais seco fica, mais molhado fica. O que é?', en: 'The drier it gets, the wetter it gets. What is it?' },
    a: ['toalha', 'towel'],
    hint: { 'pt-BR': 'Você usa para se secar.', en: 'You use it to dry off.' },
  },
  {
    q: { 'pt-BR': 'Você o compra para comer, mas não come. O que é?', en: 'You buy it to eat, but you don\'t eat it. What is it?' },
    a: ['prato', 'plate', 'garfo', 'fork', 'colher', 'spoon', 'talher', 'cutlery'],
    hint: { 'pt-BR': 'É louça.', en: 'It\'s tableware.' },
  },
  {
    q: { 'pt-BR': '1 pai + 1 mãe têm 6 filhos. Cada filho tem 1 irmã. Quantas pessoas na família?', en: '1 father + 1 mother have 6 children. Each child has 1 sister. How many people in the family?' },
    a: ['9', 'nove', 'nine'],
    hint: { 'pt-BR': 'Os 6 filhos compartilham 1 irmã.', en: 'The 6 children share 1 sister.' },
  },
  {
    q: { 'pt-BR': 'Se você me tem, quer me contar. Se você me conta, não me tem. O que é?', en: 'If you have me, you want to tell me. If you tell me, you don\'t have me. What am I?' },
    a: ['segredo', 'secret'],
    hint: { 'pt-BR': 'Você guarda de si mesmo.', en: 'You keep it from yourself.' },
  },
  {
    q: { 'pt-BR': 'O que pode viajar ao redor do mundo ficando em um canto?', en: 'What can travel around the world while staying in a corner?' },
    a: ['selo', 'stamp', 'envelope'],
    hint: { 'pt-BR': 'Vai em cartas.', en: 'Goes on letters.' },
  },
  {
    q: { 'pt-BR': 'O que é grande e pesado, mas leve como uma pena quando você segura?', en: 'What is big and heavy, but as light as a feather when you hold it?' },
    a: ['balão', 'balloon', 'bexiga'],
    hint: { 'pt-BR': 'Tem hélio.', en: 'It has helium.' },
  },
  {
    q: { 'pt-BR': 'Quanto mais você tira, maior fica. O que é?', en: 'The more you take, the bigger it gets. What is it?' },
    a: ['buraco', 'hole'],
    hint: { 'pt-BR': 'No chão.', en: 'In the ground.' },
  },
]

const idx = ref(0)
const input = ref('')
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')
const showHint = ref(false)

function check() {
  const ans = input.value.trim().toLowerCase()
  if (!ans) return
  if (PUZZLES[idx.value].a.includes(ans)) {
    sfx.powerup()
    log.value.push(`✓ "${ans}"`)
    idx.value++
    input.value = ''
    showHint.value = false
    if (idx.value >= PUZZLES.length) {
      status.value = 'won'
      sfx.win()
    }
  } else {
    sfx.error()
    log.value.push(`✗ "${ans}"`)
    input.value = ''
  }
}

function hint() {
  showHint.value = true
  sfx.tick()
}

function start() {
  idx.value = 0
  log.value = []
  status.value = 'playing'
  showHint.value = false
  input.value = ''
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'MICROPUZZLE' : 'MICROPUZZLE'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'playing' && idx === 0 && log.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? '8 mini-puzzles. Resposta curta.' : '8 mini-puzzles. Short answer.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else-if="status === 'playing'" class="font-mono space-y-2">
      <p class="text-xs text-ink-muted">PUZZLE {{ idx + 1 }}/{{ PUZZLES.length }}</p>
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
          autofocus
        />
        <button type="button" class="arcade-btn-ghost border border-surface-600 px-2 text-[10px]" @click="hint">?</button>
      </form>
    </div>
    <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center py-6 text-lg">★ ALL SOLVED ★</p>
  </CrtFrame>
</template>
