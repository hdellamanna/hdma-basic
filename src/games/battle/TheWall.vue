<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const wall = ref(0)
const soldiers = ref(5)
const enemyDist = ref(100)
const turn = ref(0)
const log = ref<string[]>([])
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')

function start() {
  wall.value = 0
  soldiers.value = 5
  enemyDist.value = 100
  turn.value = 0
  log.value = []
  status.value = 'playing'
}

function build() {
  if (soldiers.value < 1) { sfx.error(); return }
  wall.value += 5
  soldiers.value--
  turn.value++
  sfx.shoot()
  enemyDist.value -= 8
  log.value.push(`▶ Build → wall ${wall.value}, soldiers ${soldiers.value}, enemy ${enemyDist.value}`)
  if (enemyDist.value <= 0) {
    status.value = wall.value >= 20 ? 'won' : 'lost'
    if (status.value === 'won') sfx.win(); else sfx.lose()
  } else if (turn.value >= 12) {
    status.value = wall.value >= 20 ? 'won' : 'lost'
    if (status.value === 'won') sfx.win(); else sfx.lose()
  }
}

function fortify() {
  if (soldiers.value < 2) { sfx.error(); return }
  soldiers.value -= 2
  wall.value += 8
  turn.value++
  enemyDist.value -= 10
  log.value.push(`▶ Fortify → wall ${wall.value}, soldiers ${soldiers.value}, enemy ${enemyDist.value}`)
  if (enemyDist.value <= 0) {
    status.value = wall.value >= 20 ? 'won' : 'lost'
    if (status.value === 'won') sfx.win(); else sfx.lose()
  } else if (turn.value >= 12) {
    status.value = wall.value >= 20 ? 'won' : 'lost'
    if (status.value === 'won') sfx.win(); else sfx.lose()
  }
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    title="THE WALL"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Construa o muro antes do ataque. Wall precisa ≥ 20 em 12 turnos.' : 'Build the wall before attack. Wall needs ≥ 20 in 12 turns.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-xs flex items-center justify-between">
        <span class="text-cyan">WALL <span :class="wall >= 20 ? 'amber-phosphor' : 'text-amber'">{{ wall }}</span>/20</span>
        <span class="text-cyan">SOLDIERS {{ soldiers }}</span>
        <span :class="enemyDist < 30 ? 'danger-phosphor' : 'text-amber'">ENEMY {{ enemyDist }}</span>
      </p>
      <div class="border border-surface-600 bg-surface-800 p-2 h-20 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <div v-if="status === 'playing'" class="grid grid-cols-2 gap-2">
        <button class="arcade-btn" @click="build">🧱 Build (-1)</button>
        <button class="arcade-btn arcade-btn-amber" @click="fortify">⛓ Fortify (-2)</button>
      </div>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ WALL HELD ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center">✕ FALLEN ✕</p>
    </div>
  </CrtFrame>
</template>
