<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import { useGameLoop } from '../../composables/useGameLoop'
import { useRoundTimer } from '../../composables/useRoundTimer'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const altitude = ref(200)
const vSpeed = ref(15)
const hSpeed = ref(8)
const fuel = ref(100)
const targetX = ref(50)
const shipX = ref(50)
const log = ref<string[]>([])
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')

const levels = [
  { alt: 200, grav: 1.62, wind: 0 },
  { alt: 300, grav: 3.7, wind: 2 },
  { alt: 150, grav: 9.8, wind: -3 },
  { alt: 250, grav: 1.62, wind: 4 },
  { alt: 200, grav: 3.7, wind: -2 },
]
const level = ref(0)
const score = ref(0)
const landed = ref(false)
const { schedule, cancel } = useRoundTimer()
const groundOffset = computed(() => Math.min(90, altitude.value / levels[level.value].alt * 90))

function nextLevel() {
  if (level.value >= levels.length) {
    status.value = 'won'
    sfx.win()
    return
  }
  const l = levels[level.value]
  altitude.value = l.alt
  vSpeed.value = 15
  hSpeed.value = 8
  fuel.value = 100
  shipX.value = 50
  targetX.value = 40 + Math.random() * 20
  log.value = []
  landed.value = false
  status.value = 'playing'
  loop.start()
}

function start() {
  cancel()
  loop.stop()
  level.value = 0
  score.value = 0
  nextLevel()
}

const loop = useGameLoop((dtMs) => {
  const dt = dtMs / 1000
  const l = levels[level.value]
  vSpeed.value += l.grav * dt
  altitude.value -= vSpeed.value * dt * 8
  shipX.value += (hSpeed.value + l.wind) * dt * 2

  if (altitude.value <= 0) {
    altitude.value = 0
    loop.stop()
    const drift = Math.abs(shipX.value - targetX.value)
    if (vSpeed.value <= 5 && drift < 10) {
      log.value.push(`★ Touchdown! drift=${drift.toFixed(1)} v=${vSpeed.value.toFixed(1)}`)
      sfx.coin()
      score.value += Math.floor(100 - vSpeed.value * 5 - drift * 3)
      landed.value = true
      if (level.value === levels.length - 1) {
        status.value = 'won'
        sfx.win()
      } else {
        schedule(() => {
          level.value++
          nextLevel()
        }, 1500)
      }
    } else {
      log.value.push(`✕ Crash! v=${vSpeed.value.toFixed(1)} drift=${drift.toFixed(1)}`)
      status.value = 'lost'
      sfx.lose()
      return
    }
  }
})

function burn(vs: number, hs: number) {
  if (status.value !== 'playing' || landed.value || fuel.value <= 0) return
  if (vs > 0) {
    vSpeed.value = Math.max(0, vSpeed.value - vs)
    fuel.value = Math.max(0, fuel.value - vs)
  }
  if (hs !== 0) {
    hSpeed.value = Math.max(-10, Math.min(10, hSpeed.value + hs))
    fuel.value = Math.max(0, fuel.value - 0.5)
  }
  sfx.shoot()
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="score"
    :status="status"
    title="TOUCHDOWN"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? '5 alunissagens. Controle velocidade vertical e drift horizontal.' : '5 landings. Control vertical speed and horizontal drift.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-xs flex items-center justify-between">
        <span class="text-cyan">LEVEL <span class="text-amber">{{ level + 1 }}</span>/5</span>
        <span class="text-ink-muted">FUEL <span :class="fuel < 20 ? 'danger-phosphor' : 'text-cyan'">{{ fuel.toFixed(0) }}</span></span>
      </p>
      <div class="text-xs flex justify-between">
        <span class="text-ink-muted">v <span :class="vSpeed > 5 ? 'danger-phosphor' : 'phosphor'">{{ vSpeed.toFixed(1) }}</span></span>
        <span class="text-ink-muted">h <span :class="Math.abs(hSpeed) > 5 ? 'danger-phosphor' : 'cyan-phosphor'">{{ hSpeed.toFixed(1) }}</span></span>
        <span class="text-ink-muted">alt <span class="text-amber">{{ altitude.toFixed(0) }}</span></span>
      </div>
      <div class="relative h-32 bg-void-deep border border-surface-600 overflow-hidden">
        <div class="absolute bottom-0 inset-x-0 h-2 bg-surface-600"></div>
        <div
          class="absolute bottom-2 h-3 w-1 bg-danger"
          :style="{ left: `${targetX}%` }"
        ></div>
        <div
          class="absolute phosphor text-shadow-neon"
          :style="{ left: `${shipX}%`, bottom: `${8 + groundOffset}px`, transform: 'translateX(-50%)' }"
        >▼</div>
      </div>
      <div class="grid grid-cols-3 gap-1">
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5" :disabled="landed || status !== 'playing'" @click="burn(0, -2)">◀ L</button>
        <button class="arcade-btn arcade-btn-amber text-[10px] py-1.5" :disabled="landed || status !== 'playing'" @click="burn(3, 0)">▼ BRAKE</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5" :disabled="landed || status !== 'playing'" @click="burn(0, 2)">R ▶</button>
      </div>
      <div class="border border-surface-600 bg-surface-800 p-2 h-16 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ ALL TOUCHDOWNS ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ CRASHED ✕</p>
    </div>
  </CrtFrame>
</template>
