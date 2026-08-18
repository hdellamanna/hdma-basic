<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 320, H = 320
const shipX = ref(W / 2)
const invaders = ref<{ x: number; y: number; alive: boolean; row: number }[]>([])
const bullets = ref<{ x: number; y: number; vx: number }[]>([])
const enemyBullets = ref<{ x: number; y: number }[]>([])
const score = ref(0)
const lives = ref(3)
const status = ref<'playing' | 'won' | 'lost'>('playing')
let lastShot = 0
let lastEnemy = 0
let dir = 1
let frame: number | null = null

function start() {
  shipX.value = W / 2
  bullets.value = []
  enemyBullets.value = []
  invaders.value = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      invaders.value.push({ x: 30 + c * 35, y: 30 + r * 30, alive: true, row: r })
    }
  }
  score.value = 0
  lives.value = 3
  dir = 1
  status.value = 'playing'
  frame = requestAnimationFrame(loop)
}

function loop() {
  if (status.value !== 'playing') return
  // Move invaders
  let edge = false
  for (const inv of invaders.value) {
    if (!inv.alive) continue
    if ((inv.x > W - 20 && dir > 0) || (inv.x < 20 && dir < 0)) edge = true
  }
  if (edge) {
    dir *= -1
    invaders.value.forEach((inv) => { if (inv.alive) inv.y += 10 })
  } else {
    invaders.value.forEach((inv) => { if (inv.alive) inv.x += dir * 0.5 })
  }
  // Enemy shoots
  lastEnemy += 16
  if (lastEnemy > 1500) {
    lastEnemy = 0
    const alive = invaders.value.filter((i) => i.alive)
    if (alive.length > 0) {
      const s = alive[Math.floor(Math.random() * alive.length)]
      enemyBullets.value.push({ x: s.x, y: s.y + 5 })
    }
  }
  // Bullets
  bullets.value.forEach((b) => (b.y -= 6))
  enemyBullets.value.forEach((b) => (b.y += 3))
  bullets.value = bullets.value.filter((b) => b.y > 0)
  enemyBullets.value = enemyBullets.value.filter((b) => b.y < H)
  // Collisions
  for (const b of bullets.value) {
    for (const inv of invaders.value) {
      if (inv.alive && Math.abs(b.x - inv.x) < 12 && Math.abs(b.y - inv.y) < 12) {
        inv.alive = false
        b.y = -10
        score.value += 10
        sfx.hit()
        break
      }
    }
  }
  // Player hit
  for (const b of enemyBullets.value) {
    if (Math.abs(b.x - shipX.value) < 12 && Math.abs(b.y - (H - 20)) < 12) {
      enemyBullets.value = enemyBullets.value.filter((bb) => bb !== b)
      lives.value--
      sfx.explode()
      if (lives.value <= 0) {
        status.value = 'lost'
        sfx.lose()
        return
      }
    }
  }
  // Invaders reached bottom
  if (invaders.value.some((inv) => inv.alive && inv.y > H - 30)) {
    status.value = 'lost'
    sfx.lose()
    return
  }
  if (invaders.value.every((inv) => !inv.alive)) {
    status.value = 'won'
    sfx.win()
    return
  }
  frame = requestAnimationFrame(loop)
}

function shoot() {
  if (performance.now() - lastShot < 200) return
  lastShot = performance.now()
  bullets.value.push({ x: shipX.value, y: H - 30, vx: 0 })
  sfx.shoot()
}

function move(dx: number) {
  shipX.value = Math.max(12, Math.min(W - 12, shipX.value + dx))
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'ArrowLeft' || e.key === 'a') move(-15)
  if (e.key === 'ArrowRight' || e.key === 'd') move(15)
  if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); shoot() }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (frame) cancelAnimationFrame(frame)
})

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="score"
    :lives="lives"
    :status="status"
    title="ROBOT INVADERS"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="invaders.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Space Invaders estilo anos 80. Setas + ESPAÇO.' : '80s Space Invaders. Arrows + SPACE.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <div class="relative bg-void-deep border border-surface-600 overflow-hidden mx-auto" :style="{ aspectRatio: '1', maxWidth: '360px' }">
        <div
          v-for="(inv, i) in invaders"
          :key="i"
          v-show="inv.alive"
          class="absolute danger-phosphor text-xs font-bold"
          :style="{ left: `${inv.x}px`, top: `${inv.y}px`, transform: 'translate(-50%, -50%)' }"
        >[{{ inv.row % 2 ? 'M' : 'W' }}]</div>
        <div
          v-for="(b, i) in bullets"
          :key="`b-${i}`"
          class="absolute w-0.5 h-3 bg-phosphor-green shadow-neon-green"
          :style="{ left: `${b.x}px`, top: `${b.y}px` }"
        ></div>
        <div
          v-for="(b, i) in enemyBullets"
          :key="`eb-${i}`"
          class="absolute w-0.5 h-3 bg-danger shadow-neon-red"
          :style="{ left: `${b.x}px`, top: `${b.y}px` }"
        ></div>
        <div
          class="absolute phosphor text-shadow-neon font-bold"
          :style="{ left: `${shipX}px`, bottom: '10px', transform: 'translateX(-50%)' }"
        >▲</div>
      </div>
      <div class="grid grid-cols-3 gap-1 sm:hidden">
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(-15)">◀</button>
        <button class="arcade-btn arcade-btn-amber text-[10px] py-1" @click="shoot">FIRE</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(15)">▶</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ EARTH SAVED ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ INVADED ✕</p>
    </div>
  </CrtFrame>
</template>
