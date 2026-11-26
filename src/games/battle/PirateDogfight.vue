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
const shipX = ref(W / 2)
const shipY = ref(H - 30)
const pirates = ref<{ x: number; y: number; alive: boolean; vx: number }[]>([])
const bullets = ref<{ x: number; y: number }[]>([])
const pBullets = ref<{ x: number; y: number }[]>([])
const score = ref(0)
const lives = ref(3)
const status = ref<'playing' | 'won' | 'lost'>('playing')
let lastShot = 0
let lastP = 0
let frame: number | null = null

function start() {
  if (frame !== null) cancelAnimationFrame(frame)
  shipX.value = W / 2
  shipY.value = H - 30
  pirates.value = []
  lastShot = -Infinity
  lastP = 0
  for (let i = 0; i < 5; i++) pirates.value.push({ x: 40 + i * 60, y: 40 + Math.random() * 40, alive: true, vx: 1.5 })
  bullets.value = []
  pBullets.value = []
  score.value = 0
  lives.value = 3
  status.value = 'playing'
  frame = requestAnimationFrame(loop)
}

function loop() {
  if (status.value !== 'playing') return
  pirates.value.forEach((p) => {
    if (!p.alive) return
    p.x += p.vx
    p.y += Math.sin(p.x / 30) * 0.5
    if (p.x < 30 || p.x > W - 30) p.vx *= -1
  })
  bullets.value.forEach((b) => (b.y -= 6))
  bullets.value = bullets.value.filter((b) => b.y > 0)
  pBullets.value.forEach((b) => (b.y += 3))
  pBullets.value = pBullets.value.filter((b) => b.y < H)
  lastP += 16
  if (lastP > 1000) {
    lastP = 0
    const alive = pirates.value.filter((p) => p.alive)
    if (alive.length) {
      const s = alive[Math.floor(Math.random() * alive.length)]
      pBullets.value.push({ x: s.x, y: s.y + 5 })
    }
  }
  // Collisions
  for (const b of bullets.value) {
    for (const p of pirates.value) {
      if (p.alive && Math.abs(b.x - p.x) < 14 && Math.abs(b.y - p.y) < 14) {
        p.alive = false
        b.y = -10
        score.value += 20
        sfx.hit()
      }
    }
  }
  for (const b of pBullets.value) {
    if (Math.abs(b.x - shipX.value) < 12 && Math.abs(b.y - shipY.value) < 12) {
      lives.value--
      sfx.explode()
      b.y = H + 10
      if (lives.value <= 0) { status.value = 'lost'; sfx.lose(); return }
    }
  }
  if (pirates.value.every((p) => !p.alive) && score.value >= 100) {
    status.value = 'won'
    sfx.win()
    return
  }
  frame = requestAnimationFrame(loop)
}

function shoot() {
  if (performance.now() - lastShot < 200) return
  lastShot = performance.now()
  bullets.value.push({ x: shipX.value, y: shipY.value - 8 })
  sfx.shoot()
}

function move(dx: number, dy: number) {
  shipX.value = Math.max(10, Math.min(W - 10, shipX.value + dx))
  shipY.value = Math.max(H / 2, Math.min(H - 10, shipY.value + dy))
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.ctrlKey || e.altKey || e.metaKey || (e.key === ' ' && e.target instanceof HTMLButtonElement)) return
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault()
  if (e.key === 'ArrowLeft' || e.key === 'a') move(-12, 0)
  if (e.key === 'ArrowRight' || e.key === 'd') move(12, 0)
  if (e.key === 'ArrowUp' || e.key === 'w') move(0, -10)
  if (e.key === 'ArrowDown' || e.key === 's') move(0, 10)
  if (e.key === ' ') { e.preventDefault(); shoot() }
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
    :lives="lives"
    :status="status"
    title="PIRATE DOGFIGHT"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="pirates.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Abaixe 5 piratas. Setas para mover, ESPAÇO para atirar.' : 'Shoot 5 pirates. Arrows to move, SPACE to fire.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <div class="relative bg-void-deep border border-surface-600 overflow-hidden mx-auto" :style="{ aspectRatio: '4/3', maxWidth: '400px' }">
        <div
          v-for="(p, i) in pirates"
          :key="i"
          v-show="p.alive"
          class="absolute danger-phosphor font-bold"
          :style="{ left: `${p.x / W * 100}%`, top: `${p.y / H * 100}%`, transform: 'translate(-50%, -50%)' }"
        >☠</div>
        <div
          v-for="(b, i) in bullets"
          :key="`b-${i}`"
          class="absolute w-0.5 h-2 bg-phosphor-green"
          :style="{ left: `${b.x / W * 100}%`, top: `${b.y / H * 100}%` }"
        ></div>
        <div
          v-for="(b, i) in pBullets"
          :key="`eb-${i}`"
          class="absolute w-0.5 h-2 bg-danger"
          :style="{ left: `${b.x / W * 100}%`, top: `${b.y / H * 100}%` }"
        ></div>
        <div
          class="absolute phosphor font-bold"
          :style="{ left: `${shipX / W * 100}%`, top: `${shipY / H * 100}%`, transform: 'translate(-50%, -50%)' }"
        >▲</div>
      </div>
      <p class="text-xs text-amber">SCORE <span class="font-bold">{{ score }}</span>/100</p>
      <div v-if="status === 'playing'" class="grid grid-cols-3 gap-2">
        <button class="min-h-11 touch-manipulation arcade-btn-ghost col-start-2" :aria-label="locale.current === 'pt-BR' ? 'Subir' : 'Move up'" @click="move(0, -10)">↑</button>
        <button class="min-h-11 touch-manipulation arcade-btn-ghost col-start-1 border border-surface-600 text-[10px] py-1" :aria-label="locale.current === 'pt-BR' ? 'Mover para a esquerda' : 'Move left'" @click="move(-12, 0)">←</button>
        <button class="min-h-11 touch-manipulation arcade-btn arcade-btn-amber text-[10px] py-1" @click="shoot">FIRE</button>
        <button class="min-h-11 touch-manipulation arcade-btn-ghost border border-surface-600 text-[10px] py-1" :aria-label="locale.current === 'pt-BR' ? 'Mover para a direita' : 'Move right'" @click="move(12, 0)">→</button>
        <button class="min-h-11 touch-manipulation arcade-btn-ghost col-start-2" :aria-label="locale.current === 'pt-BR' ? 'Descer' : 'Move down'" @click="move(0, 10)">↓</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ ACE PILOT ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ SHOT DOWN ✕</p>
    </div>
  </CrtFrame>
</template>
