<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const code = ref([0, 0, 0, 0])
const guess = ref([0, 0, 0, 0])
const tries = ref(0)
const log = ref<string[]>([])
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')

function start() {
  code.value = [
    Math.floor(Math.random() * 10),
    Math.floor(Math.random() * 10),
    Math.floor(Math.random() * 10),
    Math.floor(Math.random() * 10),
  ]
  guess.value = [0, 0, 0, 0]
  tries.value = 0
  log.value = []
  status.value = 'playing'
}

function submit() {
  if (status.value !== 'playing') return
  tries.value++
  sfx.type()
  let exact = 0, partial = 0
  const cCount: Record<number, number> = {}
  const gCount: Record<number, number> = {}
  for (let i = 0; i < 4; i++) {
    if (guess.value[i] === code.value[i]) exact++
    else {
      cCount[code.value[i]] = (cCount[code.value[i]] ?? 0) + 1
      gCount[guess.value[i]] = (gCount[guess.value[i]] ?? 0) + 1
    }
  }
  for (const k of Object.keys(gCount)) {
    partial += Math.min(gCount[k], cCount[k] ?? 0)
  }
  log.value.push(`▶ ${guess.value.join('')} → ${exact}✓ ${partial}○`)
  if (exact === 4) {
    status.value = 'won'
    sfx.win()
  } else if (tries.value >= 6) {
    status.value = 'lost'
    sfx.lose()
    log.value.push(`(era ${code.value.join('')})`)
  }
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    title="SECRET WEAPON"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Adivinhe o código de 4 dígitos em 6 tentativas. ✓ = certo, ○ = presente mas em outra posição.' : 'Guess the 4-digit code in 6 tries. ✓ = right, ○ = right digit wrong place.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-xs text-ink-muted">TRIES: <span :class="tries >= 5 ? 'danger-phosphor' : 'text-amber'">{{ tries }}/6</span></p>
      <div class="border border-surface-600 bg-surface-800 p-2 h-32 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <div v-if="status === 'playing'" class="space-y-2">
        <div class="flex justify-center gap-2">
          <input
            v-for="(_, i) in guess"
            :key="i"
            v-model.number="guess[i]"
            type="number"
            min="0"
            max="9"
            class="w-14 h-14 bg-void-deep border border-surface-600 text-center text-3xl text-amber phosphor font-display outline-none focus:border-phosphor-green"
          />
        </div>
        <button class="arcade-btn arcade-btn-amber w-full" @click="submit">▶ SUBMIT</button>
      </div>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ WEAPON FOUND ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center">✕ WEAPON LOST ✕</p>
    </div>
  </CrtFrame>
</template>
