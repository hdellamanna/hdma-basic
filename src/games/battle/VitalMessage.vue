<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const difficulty = ref(6)
const message = ref('')
const phase = ref<'pick' | 'show' | 'recall'>('pick')
const input = ref('')
const status = ref<'playing' | 'won' | 'lost'>('playing')

function start() {
  let m = ''
  for (let i = 0; i < difficulty.value; i++) m += String.fromCharCode(65 + Math.floor(Math.random() * 26))
  message.value = m
  input.value = ''
  phase.value = 'show'
  sfx.start()
  setTimeout(() => {
    phase.value = 'recall'
  }, Math.max(1500, difficulty.value * 800))
}

function submit() {
  if (input.value.toUpperCase() === message.value) {
    status.value = 'won'
    sfx.win()
  } else {
    status.value = 'lost'
    sfx.lose()
  }
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'A MENSAGEM VITAL' : 'THE VITAL MESSAGE'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="phase === 'pick' && !message" class="text-center py-6 space-y-3">
      <p class="text-ink-muted text-sm">
        {{ locale.current === 'pt-BR' ? 'Memorize uma sequência de letras.' : 'Memorize a letter sequence.' }}
      </p>
      <p class="text-cyan text-xs">DIFICULDADE: <span class="amber-phosphor text-shadow-neon font-display">{{ difficulty }}</span></p>
      <div class="flex items-center justify-center gap-2">
        <button class="arcade-btn-ghost border border-surface-600 px-3" @click="difficulty = Math.max(4, difficulty - 1)">-</button>
        <span class="text-2xl text-amber font-display w-12 text-center">{{ difficulty }}</span>
        <button class="arcade-btn-ghost border border-surface-600 px-3" @click="difficulty = Math.min(10, difficulty + 1)">+</button>
      </div>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else-if="phase === 'show'" class="text-center py-12">
      <p class="text-ink-muted text-xs mb-4">Memorize:</p>
      <p class="font-display text-4xl phosphor text-shadow-neon animate-flicker tracking-widest">{{ message }}</p>
    </div>
    <div v-else-if="phase === 'recall' && status === 'playing'" class="text-center py-6 space-y-3">
      <p class="text-ink-muted text-sm">{{ locale.current === 'pt-BR' ? 'Digite a mensagem:' : 'Type the message:' }}</p>
      <input
        v-model="input"
        maxlength="10"
        class="bg-void-deep border border-surface-600 px-3 py-2 text-amber text-center text-2xl font-display tracking-widest outline-none focus:border-phosphor-green uppercase"
        @keyup.enter="submit"
        autofocus
      />
      <div>
        <button class="arcade-btn arcade-btn-amber" @click="submit">▶ SEND</button>
      </div>
    </div>
    <div v-else class="text-center py-8">
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-lg">★ MESSAGE CORRECT ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-lg">✕ WRONG ({{ message }}) ✕</p>
    </div>
  </CrtFrame>
</template>
