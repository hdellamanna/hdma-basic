<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const target = ref('')
const tries = ref(0)
const canGuess = ref(false)
const input = ref('')
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')

function start() {
  target.value = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  tries.value = 15
  canGuess.value = false
  log.value = [locale.current === 'pt-BR' ? 'Mulher-Aranha escolheu uma letra. Dê uma palavra (4-8 letras) que a contenha.' : 'Spider-Woman picked a letter. Give a word (4-8 letters) that contains it.']
  status.value = 'playing'
  input.value = ''
}

function submit() {
  if (status.value !== 'playing') return
  const w = input.value.trim().toLowerCase()
  if (w.length < 4 || w.length > 8) {
    log.value.push(locale.current === 'pt-BR' ? '✗ Palavra deve ter 4-8 letras' : '✗ Word must be 4-8 letters')
    sfx.error()
    input.value = ''
    return
  }
  if (canGuess.value) {
    if (w.toUpperCase() === target.value) {
      status.value = 'won'
      sfx.win()
      log.value.push(`★ ${target.value}`)
    } else {
      tries.value -= 5
      log.value.push(locale.current === 'pt-BR' ? `✗ era ${target.value}` : `✗ was ${target.value}`)
      status.value = 'lost'
      sfx.lose()
    }
    return
  }
  if (w.toUpperCase().includes(target.value)) {
    canGuess.value = true
    log.value.push(locale.current === 'pt-BR' ? `✓ Contém ${target.value}. Palpite (S/N)?` : `✓ Contains ${target.value}. Guess (Y/N)?`)
    sfx.powerup()
  } else {
    tries.value--
    log.value.push(locale.current === 'pt-BR' ? `✗ Não contém` : `✗ Doesn't contain`)
    sfx.error()
  }
  if (tries.value <= 0) {
    status.value = 'lost'
    sfx.lose()
  }
  input.value = ''
}

function skip() {
  if (!canGuess.value) return
  canGuess.value = false
  sfx.tick()
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'MULHER-ARANHA' : 'SPIDER-WOMAN'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="tries === 0 && log.length === 0 && status === 'playing'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-2">
        {{ locale.current === 'pt-BR' ? 'Dê palavras (4-8 letras) que contenham a letra dela. Acerto = palpite. Erro = -5.' : 'Give words (4-8 letters) containing her letter. Hit = guess. Miss = -5.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-cyan text-xs">TRIES <span :class="tries < 5 ? 'danger-phosphor' : 'text-amber'">{{ tries }}</span></p>
      <div class="border border-surface-600 bg-surface-800 p-2 h-32 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <form v-if="status === 'playing'" class="space-y-1" @submit.prevent="submit">
        <div class="flex gap-1">
          <input
            v-model="input"
            :placeholder="canGuess ? (locale.current === 'pt-BR' ? 'Palpite (letra)' : 'Guess (letter)') : (locale.current === 'pt-BR' ? 'Palavra' : 'Word')"
            class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber text-center outline-none focus:border-phosphor-green"
            autofocus
          />
          <button v-if="canGuess" type="button" class="arcade-btn-ghost border border-surface-600 px-2 text-[10px]" @click="skip">SKIP</button>
        </div>
      </form>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ LIVRE ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center">✕ TRANSFORMADO ✕</p>
    </div>
  </CrtFrame>
</template>
