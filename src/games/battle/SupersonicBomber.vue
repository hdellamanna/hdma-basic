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
const bombs = ref<{ x: number; y: number; vx: number; vy: number }[]>([])
const targets = ref<{ x: number; y: number; alive: boolean }[]>([])
const score = ref(0)
const status = ref<'playing' | 'won' | 'lost'>('playing')
let frame: number | null = null

function start() {
  shipX.value = W / 2
  bombs.value = []
  targets.value = [
    { x: 60, y: H - 30, alive: true },
    { x: W / 2, y: H - 30, alive: true },
    { x: W - 60, y: H - 30, alive: true },
    { x: 30, y: H - 30, alive: true },
    { x: W - 30, y: H - 30, alive: true },
  ]
  score.value = 0
  status.value = 'playing'
  frame = requestAnimationFrame(loop)
}

function loop() {
  if (status.value !== 'playing') return
  bombs.value.forEach((b) => {
    b.x += b.vx
    b.y += b.vy
    b.vy += 0.2
  })
  bombs.value = bombs.value.filter((b) => b.y < H && b.x > 0 && b.x < W)
  for (const b of bombs.value) {
    for (const t of targets.value) {
      if (t.alive && Math.abs(b.x - t.x) < 18 && Math.abs(b.y - t.y) < 18) {
        t.alive = false
        score.value++
        sfx.explode()
      }
    }
  }
  if (targets.value.every((t) => !t.alive)) {
    status.value = 'won'
    sfx.win()
    return
  }
  if (score.value > 0 && targets.value.filter((t) => !t.alive).length >= 3) {
    status.value = 'won'
    sfx.win()
    return
  }
  frame = requestAnimationFrame(loop)
}

function drop() {
  bombs.value.push({ x: shipX.value, y: 20, vx: 0, vy: 1 })
  sfx.shoot()
}

function move(dx: number) {
  shipX.value = Math.max(10, Math.min(W - 10, shipX.value + dx))
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'ArrowLeft' || e.key === 'a') move(-15)
  if (e.key === 'ArrowRight' || e.key === 'd') move(15)
  if (e.key === ' ') { e.preventDefault(); drop() }
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
    :status="status"
    title="SUPERSONIC BOMBER"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="targets.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Solte bombas sobre os alvos. Setas + ESPAÇO.' : 'Drop bombs on targets. Arrows + SPACE.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <div class="relative bg-void-deep border border-surface-600 overflow-hidden mx-auto" :style="{ aspectRatio: '4/3', maxWidth: '400px' }">
        <div
          v-for="(b, i) in bombs"
          :key="i"
          class="absolute w-1.5 h-1.5 bg-danger shadow-neon-red"
          :style="{ left: `${b.x}px`, top: `${b.y}px`, transform: 'translate(-50%, -50%)' }"
        ></div>
        <div
          v-for="(t, i) in targets"
          :key="`t-${i}`"
          v-show="t.alive"
          class="absolute danger-phosphor font-bold"
          :style="{ left: `${t.x}px`, top: `${t.y}px`, transform: 'translate(-50%, -50%)' }"
        >█</div>
        <div
          class="absolute phosphor font-bold"
          :style="{ left: `${shipX}px`, top: '10px', transform: 'translateX(-50%)' }"
        >▼</div>
      </div>
      <p class="text-xs text-amber">HITS <span class="font-bold">{{ score }}</span>/3</p>
      <div class="grid grid-cols-3 gap-1 sm:hidden">
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(-15)">◀</button>
        <button class="arcade-btn arcade-btn-amber text-[10px] py-1" @click="drop">BOMB</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(15)">▶</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ MISSION COMPLETE ★</p>
    </div>
  </CrtFrame>
</template>
