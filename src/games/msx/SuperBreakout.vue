<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 320, H = 360
const paddle = ref({ x: W / 2, w: 60 })
const ball = ref({ x: W / 2, y: H - 30, vx: 2, vy: -3 })
const bricks = ref<{ x: number; y: number; alive: boolean }[]>([])
const score = ref(0)
const lives = ref(3)
const level = ref(0)
const status = ref<'playing' | 'won' | 'lost'>('playing')
let frame: number | null = null

function buildBricks() {
  bricks.value = []
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 10; c++) {
      bricks.value.push({ x: 10 + c * 30, y: 20 + r * 20, alive: true })
    }
  }
}

function start() {
  score.value = 0
  lives.value = 3
  level.value = 1
  paddle.value = { x: W / 2, w: 60 }
  ball.value = { x: W / 2, y: H - 30, vx: 2, vy: -3 }
  buildBricks()
  status.value = 'playing'
  frame = requestAnimationFrame(loop)
}

function loop() {
  if (status.value !== 'playing') return
  ball.value.x += ball.value.vx
  ball.value.y += ball.value.vy
  if (ball.value.x < 5 || ball.value.x > W - 5) ball.value.vx *= -1
  if (ball.value.y < 5) ball.value.vy *= -1
  if (ball.value.y > H - 20) {
    if (Math.abs(ball.value.x - paddle.value.x) < paddle.value.w / 2) {
      ball.value.vy = -Math.abs(ball.value.vy)
      ball.value.vx += (ball.value.x - paddle.value.x) * 0.05
    } else {
      lives.value--
      if (lives.value <= 0) {
        status.value = 'lost'
        sfx.lose()
        return
      }
      ball.value = { x: W / 2, y: H - 30, vx: 2, vy: -3 }
    }
  }
  for (const b of bricks.value) {
    if (b.alive && Math.abs(ball.value.x - b.x) < 15 && Math.abs(ball.value.y - b.y) < 10) {
      b.alive = false
      ball.value.vy *= -1
      score.value += 10
      sfx.hit()
    }
  }
  if (bricks.value.every((b) => !b.alive)) {
    level.value++
    if (level.value > 3) {
      status.value = 'won'
      sfx.win()
      return
    }
    buildBricks()
  }
  frame = requestAnimationFrame(loop)
}

function move(dx: number) {
  paddle.value.x = Math.max(paddle.value.w / 2, Math.min(W - paddle.value.w / 2, paddle.value.x + dx))
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'ArrowLeft' || e.key === 'a') move(-25)
  if (e.key === 'ArrowRight' || e.key === 'd') move(25)
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
    title="SUPER BREAKOUT"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="bricks.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Quebre os tijolos. Setas para mover. 3 fases.' : 'Break the bricks. Arrows to move. 3 levels.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <p class="text-xs text-cyan">LEVEL <span class="text-amber">{{ level }}</span>/3</p>
      <div class="relative bg-void-deep border border-surface-600 overflow-hidden mx-auto" :style="{ aspectRatio: '8/9', maxWidth: '320px' }">
        <div
          v-for="(b, i) in bricks"
          :key="i"
          v-show="b.alive"
          class="absolute amber-phosphor"
          :style="{ left: `${b.x}px`, top: `${b.y}px`, width: '28px', height: '16px', transform: 'translate(-50%, -50%)' }"
        ></div>
        <div
          class="absolute w-1.5 h-1.5 bg-phosphor-green shadow-neon-green"
          :style="{ left: `${ball.x}px`, top: `${ball.y}px`, transform: 'translate(-50%, -50%)' }"
        ></div>
        <div
          class="absolute h-1 phosphor shadow-neon-green"
          :style="{ left: `${paddle.x}px`, bottom: '10px', width: `${paddle.w}px`, transform: 'translateX(-50%)' }"
        ></div>
      </div>
      <div class="grid grid-cols-2 gap-1 sm:hidden">
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(-25)">◀</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(25)">▶</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ CHAMPION ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ GAME OVER ✕</p>
    </div>
  </CrtFrame>
</template>
