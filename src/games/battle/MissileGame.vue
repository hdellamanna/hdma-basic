<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 320, H = 240
const cannonX = ref(W / 2)
const missiles = ref<{ x: number; y: number }[]>([])
const interceptions = ref<{ x: number; y: number; vx: number; vy: number }[]>([])
const score = ref(0)
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')
let frame: number | null = null
let lastSpawn = 0

function start() {
  if (frame !== null) cancelAnimationFrame(frame)
  lastSpawn = performance.now()
  cannonX.value = W / 2
  missiles.value = []
  interceptions.value = []
  score.value = 0
  status.value = 'playing'
  frame = requestAnimationFrame(loop)
}

function loop() {
  if (status.value !== 'playing') return
  const now = performance.now()
  if (now - lastSpawn > 800) {
    lastSpawn = now
    missiles.value.push({ x: Math.random() * W, y: 0 })
  }
  missiles.value.forEach((m) => (m.y += 1.5))
  interceptions.value.forEach((i) => { i.x += i.vx; i.y += i.vy })
  // Collisions
  const intercepted = new Set<(typeof missiles.value)[number]>()
  for (const i of interceptions.value) {
    for (const m of missiles.value) {
      if (!intercepted.has(m) && Math.abs(i.x - m.x) < 12 && Math.abs(i.y - m.y) < 12) {
        intercepted.add(m)
        i.y = -10
        score.value++
        sfx.explode()
        if (score.value >= 10) { status.value = 'won'; sfx.win(); return }
        break
      }
    }
  }
  missiles.value = missiles.value.filter((m) => !intercepted.has(m))
  // Reach ground
  if (missiles.value.some((m) => m.y > H - 20)) {
    status.value = 'lost'
    sfx.lose()
    return
  }
  interceptions.value = interceptions.value.filter((i) => i.y > 0 && i.y < H)
  frame = requestAnimationFrame(loop)
}

function fire() {
  interceptions.value.push({ x: cannonX.value, y: H - 30, vx: 0, vy: -6 })
  sfx.shoot()
}

function move(dx: number) {
  cannonX.value = Math.max(10, Math.min(W - 10, cannonX.value + dx))
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.ctrlKey || e.altKey || e.metaKey || (e.key === ' ' && e.target instanceof HTMLButtonElement)) return
  if (['ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault()
  if (e.key === 'ArrowLeft' || e.key === 'a') move(-15)
  if (e.key === 'ArrowRight' || e.key === 'd') move(15)
  if (e.key === ' ') { e.preventDefault(); fire() }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (frame !== null) cancelAnimationFrame(frame)
})

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="score"
    :status="status"
    title="MISSILE!"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Intercepte 10 mísseis. Setas + ESPAÇO.' : 'Intercept 10 missiles. Arrows + SPACE.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <div class="relative bg-void-deep border border-surface-600 overflow-hidden mx-auto" :style="{ aspectRatio: '4/3', maxWidth: '400px' }">
        <div
          v-for="(m, i) in missiles"
          :key="`m-${i}`"
          class="absolute w-0.5 h-3 bg-danger shadow-neon-red"
          :style="{ left: `${m.x / W * 100}%`, top: `${m.y / H * 100}%` }"
        ></div>
        <div
          v-for="(i, idx) in interceptions"
          :key="`i-${idx}`"
          class="absolute w-0.5 h-2 bg-phosphor-green shadow-neon-green"
          :style="{ left: `${i.x / W * 100}%`, top: `${i.y / H * 100}%` }"
        ></div>
        <div
          class="absolute phosphor font-bold"
          :style="{ left: `${cannonX / W * 100}%`, top: `${(H - 20) / H * 100}%`, transform: 'translate(-50%, -50%)' }"
        >⌐_</div>
      </div>
      <p class="text-xs text-amber">SCORE <span class="font-bold">{{ score }}</span>/10</p>
      <div v-if="status === 'playing'" class="grid grid-cols-3 gap-2">
        <button class="min-h-11 touch-manipulation arcade-btn-ghost border border-surface-600 text-[10px] py-1" :aria-label="locale.current === 'pt-BR' ? 'Mover para a esquerda' : 'Move left'" @click="move(-15)">◀</button>
        <button class="min-h-11 touch-manipulation arcade-btn arcade-btn-amber text-[10px] py-1" @click="fire">FIRE</button>
        <button class="min-h-11 touch-manipulation arcade-btn-ghost border border-surface-600 text-[10px] py-1" :aria-label="locale.current === 'pt-BR' ? 'Mover para a direita' : 'Move right'" @click="move(15)">▶</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ DEFENDED ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ BASE HIT ✕</p>
    </div>
  </CrtFrame>
</template>
