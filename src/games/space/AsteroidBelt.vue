<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import { useGameLoop } from '../../composables/useGameLoop'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 320, H = 400, SHIP_Y = H - 20
const shipX = ref(W / 2)
const asteroids = ref<{ x: number; y: number; size: number; speed: number }[]>([])
const score = ref(0)
const lives = ref(3)
const timeLeft = ref(60)
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')

let elapsed = 0
let sinceSpawn = 0

function spawn() {
  const size = 10 + Math.random() * 25
  asteroids.value.push({
    x: size + Math.random() * (W - 2 * size),
    y: -size,
    size,
    speed: 1.5 + Math.random() * 2 + (50 - size) / 20,
  })
}

const loop = useGameLoop((dt) => {
  elapsed += dt
  sinceSpawn += dt
  timeLeft.value = Math.max(0, Math.ceil((60000 - elapsed) / 1000))
  if (timeLeft.value === 0) {
    status.value = 'won'
    sfx.win()
    loop.stop()
    return
  }

  if (sinceSpawn >= 400) {
    sinceSpawn -= 400
    spawn()
  }

  for (let i = asteroids.value.length - 1; i >= 0; i--) {
    const asteroid = asteroids.value[i]
    asteroid.y += asteroid.speed * dt / (1000 / 60)
    const radius = asteroid.size / 2
    const hit = Math.abs(asteroid.x - shipX.value) < radius + 8
      && Math.abs(asteroid.y - SHIP_Y) < radius + 7
    if (hit) {
      asteroids.value.splice(i, 1)
      lives.value--
      sfx.hit()
      if (lives.value === 0) {
        status.value = 'lost'
        sfx.lose()
        loop.stop()
        return
      }
    } else if (asteroid.y - radius >= H) {
      score.value += Math.floor(asteroid.size)
      asteroids.value.splice(i, 1)
    }
  }
})

function move(dx: number) {
  if (status.value !== 'playing') return
  shipX.value = Math.max(15, Math.min(W - 15, shipX.value + dx))
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  const key = e.key.toLowerCase()
  if (key !== 'arrowleft' && key !== 'arrowright' && key !== 'a' && key !== 'd') return
  e.preventDefault()
  move(key === 'arrowleft' || key === 'a' ? -15 : 15)
}

function start() {
  loop.stop()
  elapsed = 0
  sinceSpawn = 0
  shipX.value = W / 2
  score.value = 0
  lives.value = 3
  timeLeft.value = 60
  asteroids.value = []
  status.value = 'playing'
  loop.start()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

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
    <div v-if="status === 'intro'" class="text-center py-6">
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
      <svg :viewBox="`0 0 ${W} ${H}`" class="mx-auto w-full max-w-sm border border-surface-600 bg-void-deep" aria-hidden="true">
        <circle v-for="(asteroid, index) in asteroids" :key="index"
          :cx="asteroid.x" :cy="asteroid.y" :r="asteroid.size / 2" fill="#ff7676" />
        <path :transform="`translate(${shipX}, ${SHIP_Y})`" d="M 0 -8 L 9 8 H -9 Z" fill="#77f277" />
      </svg>
      <div class="grid grid-cols-2 gap-1 sm:hidden">
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-2" @click="move(-15)">◀</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-2" @click="move(15)">▶</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ BELT CROSSED ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ DESTROYED ✕</p>
    </div>
  </CrtFrame>
</template>
