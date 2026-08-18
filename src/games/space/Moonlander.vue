<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import { useGameLoop } from '../../composables/useGameLoop'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const altitude = ref(100)
const velocity = ref(0)
const fuel = ref(150)
const thrust = ref(0)
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')
const GRAVITY = 1.62 // moon m/s^2
const MAX_THRUST = 4

function reset() {
  altitude.value = 100
  velocity.value = 0
  fuel.value = 150
  thrust.value = 0
  log.value = []
  status.value = 'playing'
  loop.start()
}

const loop = useGameLoop((dt) => {
  if (status.value !== 'playing') return
  const dtSec = dt / 1000
  // Apply gravity + thrust
  const a = GRAVITY - thrust.value
  velocity.value += a * dtSec
  altitude.value -= velocity.value * dtSec
  if (altitude.value < 0) altitude.value = 0

  if (thrust.value > 0) {
    fuel.value = Math.max(0, fuel.value - thrust.value * 2 * dtSec)
    if (fuel.value === 0) thrust.value = 0
  }

  if (altitude.value <= 0) {
    if (Math.abs(velocity.value) <= 5) {
      status.value = 'won'
      log.value.push(`★ TOUCHDOWN! v=${velocity.value.toFixed(2)} m/s`)
      sfx.win()
    } else {
      status.value = 'lost'
      log.value.push(`✕ CRASHED at ${Math.abs(velocity.value).toFixed(1)} m/s`)
      sfx.lose()
    }
    loop.stop()
  }
})

function setThrust(v: number) {
  if (fuel.value > 0) thrust.value = v
}

function onQuit() { router.push('/') }

onUnmounted(() => loop.stop())
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'MOONLANDER' : 'MOONLANDER'"
    @restart="reset"
    @quit="onQuit"
  >
    <div v-if="!loop.running.value && status === 'playing' && altitude === 100 && velocity === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR'
          ? 'Pouse a nave lunar. Velocidade segura: ≤ 5 m/s.'
          : 'Land the lunar module. Safe speed: ≤ 5 m/s.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="reset">▶ LAUNCH</button>
    </div>
    <div v-else class="font-mono space-y-3 text-amber">
      <!-- Altitude bar -->
      <div>
        <div class="flex items-center justify-between text-xs">
          <span>ALT</span>
          <span class="font-bold">{{ altitude.toFixed(1) }}m</span>
        </div>
        <div class="h-3 bg-void-deep border border-surface-600 overflow-hidden">
          <div class="h-full bg-phosphor-green" :style="{ width: `${Math.max(0, altitude)}%` }"></div>
        </div>
      </div>
      <!-- Velocity bar -->
      <div>
        <div class="flex items-center justify-between text-xs">
          <span>V</span>
          <span :class="Math.abs(velocity) > 5 ? 'danger-phosphor' : 'text-amber'">{{ velocity.toFixed(1) }} m/s</span>
        </div>
        <div class="h-3 bg-void-deep border border-surface-600 overflow-hidden">
          <div class="h-full bg-danger" :style="{ width: `${Math.min(100, Math.abs(velocity) * 5)}%` }"></div>
        </div>
      </div>
      <!-- Fuel bar -->
      <div>
        <div class="flex items-center justify-between text-xs">
          <span>FUEL</span>
          <span :class="fuel < 30 ? 'danger-phosphor' : 'text-cyan'">{{ fuel.toFixed(0) }}</span>
        </div>
        <div class="h-3 bg-void-deep border border-surface-600 overflow-hidden">
          <div class="h-full bg-amber" :style="{ width: `${Math.max(0, fuel / 150 * 100)}%` }"></div>
        </div>
      </div>
      <!-- Thrust controls -->
      <div v-if="status === 'playing'" class="grid grid-cols-4 gap-1 pt-2">
        <button class="arcade-btn text-[10px]" @click="setThrust(0)">OFF</button>
        <button class="arcade-btn arcade-btn-cyan text-[10px]" @click="setThrust(1)">1</button>
        <button class="arcade-btn arcade-btn-cyan text-[10px]" @click="setThrust(2)">2</button>
        <button class="arcade-btn arcade-btn-magenta text-[10px]" @click="setThrust(3)">3</button>
      </div>
      <div v-else class="text-center py-4">
        <p v-if="status === 'won'" class="amber-phosphor font-display text-shadow-neon text-lg">★ TOUCHDOWN! ★</p>
        <p v-else class="danger-phosphor font-display text-shadow-neon text-lg">✕ CRASHED ✕</p>
      </div>
    </div>
  </CrtFrame>
</template>
