<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const h = ref(0)
const angle = ref('')
const speed = ref('')
const tries = ref(0)
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')
const bonus = ref(0)

const ui = {
  intro: {
    'pt-BR': 'Coloque o satélite na órbita certa. Ângulo ±2° e velocidade ±100 em 8 tentativas.',
    en: 'Place the satellite in the right orbit. Angle ±2° and speed ±100 in 8 tries.',
  },
  target: { 'pt-BR': 'ALTURA ALVO:', en: 'TARGET HEIGHT:' },
  angle: { 'pt-BR': 'Ângulo (0–70):', en: 'Angle (0–70):' },
  speed: { 'pt-BR': 'Velocidade (0–40000):', en: 'Speed (0–40000):' },
  shallow: { 'pt-BR': 'TOO SHALLOW', en: 'TOO SHALLOW' },
  steep: { 'pt-BR': 'TOO STEEP', en: 'TOO STEEP' },
  slow: { 'pt-BR': 'TOO SLOW', en: 'TOO SLOW' },
  fast: { 'pt-BR': 'TOO FAST', en: 'TOO FAST' },
  success: { 'pt-BR': 'NCTV WINS!', en: 'NCTV WINS!' },
  failed: { 'pt-BR': 'VOCÊ FOI DEMITIDO.', en: 'YOU\'RE FIRED.' },
  bonus: { 'pt-BR': 'BÔNUS:', en: 'BONUS:' },
}

function start() {
  h.value = Math.floor(Math.random() * 100) + 1
  angle.value = ''
  speed.value = ''
  tries.value = 0
  log.value = []
  status.value = 'playing'
  bonus.value = 0
}

function submit() {
  const a = parseFloat(angle.value)
  const v = parseFloat(speed.value)
  if (isNaN(a) || isNaN(v)) return
  tries.value++
  sfx.type()

  // Calculate the "correct" angle and speed (similar to original logic)
  const aDiff = a - Math.atan(h.value / 3) * 180 / 3.14159
  const vDiff = v - 3000 * Math.sqrt(h.value + 1 / h.value)

  log.value.push(`▶ ${a}° / ${v} → Δa=${aDiff.toFixed(1)} Δv=${vDiff.toFixed(0)}`)

  if (Math.abs(aDiff) < 2 && Math.abs(vDiff) < 100) {
    bonus.value = Math.floor(1000 / tries.value)
    status.value = 'won'
    log.value.push(`★ ${ui.success[locale.current]} (${ui.bonus[locale.current]} ${bonus.value})`)
    sfx.win()
  } else {
    if (aDiff < -2) log.value.push(`  ${ui.shallow[locale.current]}`)
    if (aDiff > 2) log.value.push(`  ${ui.steep[locale.current]}`)
    if (vDiff < -100) log.value.push(`  ${ui.slow[locale.current]}`)
    if (vDiff > 100) log.value.push(`  ${ui.fast[locale.current]}`)
    sfx.error()
  }
  if (tries.value >= 8 && status.value === 'playing') {
    status.value = 'lost'
    log.value.push(`✕ ${ui.failed[locale.current]}`)
    sfx.lose()
  }
  angle.value = ''
  speed.value = ''
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="bonus"
    :status="status"
    title="INTERGALACTIC GAMES"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="h === 0 && tries === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">{{ ui.intro[locale.current] }}</p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2 text-amber">
      <p class="text-cyan text-lg">{{ ui.target[locale.current] }} <span class="font-bold">{{ h }}</span></p>
      <p class="text-ink-muted text-xs">Tries: <span :class="tries >= 6 ? 'danger-phosphor' : 'text-amber'">{{ tries }}/8</span></p>
      <div class="border border-surface-600 bg-surface-800 p-3 h-32 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <form v-if="status === 'playing'" class="space-y-1" @submit.prevent="submit">
        <div class="flex items-center gap-2">
          <span class="text-cyan w-24">A:</span>
          <input
            v-model="angle"
            type="number"
            min="0"
            max="70"
            step="0.1"
            class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber outline-none focus:border-phosphor-green"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-cyan w-24">V:</span>
          <input
            v-model="speed"
            type="number"
            min="0"
            max="40000"
            class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber outline-none focus:border-phosphor-green"
          />
        </div>
        <button class="arcade-btn w-full">▶ LAUNCH</button>
      </form>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center py-2">★ {{ ui.success[locale.current] }} ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center py-2">✕ {{ ui.failed[locale.current] }} ✕</p>
    </div>
  </CrtFrame>
</template>
