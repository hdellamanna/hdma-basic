<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 320, H = 400
const shipX = ref(W / 2)
const asteroids = ref<{ x: number; y: number; size: number; speed: number }[]>([])
const score = ref(0)
const lives = ref(3)
const timeLeft = ref(60)
const status = ref<'playing' | 'won' | 'lost'>('playing')

let frame: number | null = null
let lastSpawn = 0
let timer: number | null = null

function spawn() {
  const size = 10 + Math.random() * 25
  asteroids.value.push({
    x: size + Math.random() * (W - 2 * size),
    y: -size,
    size,
    speed: 1.5 + Math.random() * 2 + (50 - size) / 20,
  })
}

function loop() {
  if (status.value !== 'playing') return
  const now = performance.now()
  if (now - lastSpawn > 400) {
    lastSpawn = now
    spawn()
  }
  // Move asteroids
  asteroids.value.forEach((a) => (a.y += a.speed))
  asteroids.value = asteroids.value.filter((a) => a.y < H + 30)
  // Check collision
  for (const a of asteroids.value) {
    const dx = a.x - shipX.value
    const dy = a.y - (H - 20)
    if (Math.abs(dx) < a.size && Math.abs(dy) < a.size) {
      // Hit
      lives.value--
      sfx.hit()
      a.y = H + 100
      if (lives.value <= 0) {
        status.value = 'lost'
        sfx.lose()
        if (timer) clearInterval(timer)
        return
      }
    } else if (a.y > H - 18) {
      // Dodged
      score.value += Math.floor(a.size)
    }
  }
  frame = requestAnimationFrame(loop)
}

function move(dx: number) {
  shipX.value = Math.max(15, Math.min(W - 15, shipX.value + dx))
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'ArrowLeft' || e.key === 'a') move(-15)
  if (e.key === 'ArrowRight' || e.key === 'd') move(15)
}

function start() {
  score.value = 0
  lives.value = 3
  timeLeft.value = 60
  asteroids.value = []
  status.value = 'playing'
  if (timer) clearInterval(timer)
  timer = window.setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      status.value = 'won'
      sfx.win()
      if (timer) clearInterval(timer)
    }
  }, 1000)
  frame = requestAnimationFrame(loop)
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (timer) clearInterval(timer)
  if (frame) cancelAnimationFrame(frame)
})

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="score"
    :lives="lives"
    :status="status"
    title="ASTEROID BELT"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="timeLeft === 60 && score === 0 && status === 'playing'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Desvie dos asteroides por 60 segundos.' : 'Dodge asteroids for 60 seconds.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <div class="flex items-center justify-between text-xs">
        <span class="text-cyan">⏱ {{ timeLeft }}s</span>
        <span class="text-amber">SCORE {{ score }}</span>
      </div>
      <div class="relative bg-void-deep border border-surface-600 overflow-hidden" :style="{ aspectRatio: `${W} / ${H}` }">
        <div
          v-for="(a, i) in asteroids"
          :key="i"
          class="absolute rounded-full danger-phosphor"
          :style="{
            left: `${a.x}px`,
            top: `${a.y}px`,
            width: `${a.size}px`,
            height: `${a.size}px`,
            transform: 'translate(-50%, -50%)',
            background: 'currentColor',
            boxShadow: '0 0 8px currentColor',
          }"
        ></div>
        <div
          class="absolute phosphor text-shadow-neon"
          :style="{ left: `${shipX}px`, bottom: '10px', transform: 'translateX(-50%)' }"
        >▲</div>
      </div>
      <div class="grid grid-cols-2 gap-1 sm:hidden">
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-2" @click="move(-15)">◀</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-2" @click="move(15)">▶</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ BELT CROSSED ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ DESTROYED ✕</p>
    </div>
  </CrtFrame>
</template>
