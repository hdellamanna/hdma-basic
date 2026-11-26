<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import GameLog from '../../components/GameLog.vue'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const code = ref('')
const guess = ref('')
const tries = ref(0)
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')

function start() {
  code.value = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  guess.value = ''
  tries.value = 0
  log.value = []
  status.value = 'playing'
}

function submit() {
  const g = guess.value.toUpperCase()
  if (!g || g.length !== 1) return
  tries.value++
  sfx.type()
  if (g === code.value) {
    log.value.push(`${g} = ✓`)
    status.value = 'won'
    sfx.win()
    return
  }
  if (tries.value >= 4) {
    log.value.push(`${g} ✗ (era ${code.value})`)
    status.value = 'lost'
    sfx.lose()
    return
  }
  if (g < code.value) log.value.push(`${g}: LATER`)
  else log.value.push(`${g}: EARLIER`)
  sfx.error()
  guess.value = ''
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'ROBOT MISSILE' : 'ROBOT MISSILE'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="!code && tries === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Encontre a letra-código em 4 tentativas. EARLIER/LATER.' : 'Find the code letter in 4 tries. EARLIER/LATER.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-cyan text-xs">TRIES: <span :class="tries >= 3 ? 'danger-phosphor' : 'text-amber'">{{ tries }}/4</span></p>
      <GameLog :entries="log" class="border border-surface-600 bg-surface-800 p-3 h-32 text-xs space-y-0.5" />
      <form v-if="status === 'playing'" class="flex gap-1" @submit.prevent="submit">
        <input
          v-model="guess"
          :aria-label="locale.isPt ? 'Letra do código' : 'Code letter'"
          maxlength="1"
          class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber text-center text-2xl outline-none focus:border-phosphor-green uppercase"
          placeholder="?"
          autofocus
        />
      </form>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center py-2">★ DEFUSED ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center py-2">✕ BOOM ✕</p>
    </div>
  </CrtFrame>
</template>
