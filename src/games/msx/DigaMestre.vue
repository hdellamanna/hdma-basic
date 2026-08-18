<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const SUBJECTS = computed(() => {
  const r = locale.current
  return [
    { name: r === 'pt-BR' ? 'filmes' : 'movies', rule: (w: string) => w.length > 5 },
    { name: r === 'pt-BR' ? 'frutas' : 'fruits', rule: (w: string) => /^[aeiou]/i.test(w) },
    { name: r === 'pt-BR' ? 'cores' : 'colors', rule: (w: string) => w.length % 2 === 0 },
    { name: r === 'pt-BR' ? 'animais' : 'animals', rule: (w: string) => w.endsWith('o') || w.endsWith('s') },
    { name: r === 'pt-BR' ? 'carros' : 'cars', rule: (w: string) => w.includes('a') },
  ]
})

const subject = ref<typeof SUBJECTS.value[number] | null>(null)
const wins = ref(0)
const input = ref('')
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')

function start() {
  subject.value = SUBJECTS.value[Math.floor(Math.random() * SUBJECTS.value.length)]
  wins.value = 0
  log.value = [`${locale.current === 'pt-BR' ? 'Mestre' : 'Master'}: ${locale.current === 'pt-BR' ? 'Pense em' : 'Think of'} ${subject.value.name}`]
  status.value = 'playing'
  input.value = ''
}

function submit() {
  if (!subject.value) return
  const w = input.value.toLowerCase().trim()
  if (!w) return
  if (subject.value.rule(w)) {
    wins.value++
    log.value.push(`▶ ${w} → ${locale.current === 'pt-BR' ? 'SIM' : 'YES'} (${wins.value}/3)`)
    sfx.coin()
    if (wins.value >= 3) {
      status.value = 'won'
      sfx.win()
      log.value.push(locale.current === 'pt-BR' ? '★ Você descobriu!' : '★ You found it!')
    }
  } else {
    wins.value = 0
    log.value.push(`▶ ${w} → ${locale.current === 'pt-BR' ? 'NÃO' : 'NO'}`)
    sfx.error()
  }
  input.value = ''
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'DIGA, MESTRE' : 'SAY, MASTER'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="wins === 0 && log.length === 0 && status === 'playing'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-2">
        {{ locale.current === 'pt-BR' ? 'O Mestre escolheu um tema. Dê exemplos que ele aceite (3 seguidos = vence).' : 'The Master picked a subject. Give examples he accepts (3 in a row = win).' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-cyan text-xs">WINS <span class="text-amber">{{ wins }}</span>/3</p>
      <div class="border border-surface-600 bg-surface-800 p-2 h-32 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <form v-if="status === 'playing'" class="flex gap-1" @submit.prevent="submit">
        <input
          v-model="input"
          class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber outline-none focus:border-phosphor-green"
          :placeholder="locale.current === 'pt-BR' ? 'exemplo' : 'example'"
          autofocus
        />
      </form>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ DESCOBRIU ★</p>
    </div>
  </CrtFrame>
</template>
