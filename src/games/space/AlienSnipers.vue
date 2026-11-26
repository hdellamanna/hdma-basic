<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const targets = ref<{ id: number; x: number; y: number; expiresAt: number }[]>([])
const score = ref(0)
const hits = ref(0)
const timeLeft = ref(60)
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')
const containerRef = ref<HTMLElement | null>(null)

let lastSpawn = 0
let timer: number | null = null
let frame: number | null = null

function spawnTarget() {
  const cw = containerRef.value?.clientWidth ?? 400
  const ch = containerRef.value?.clientHeight ?? 400
  targets.value.push({
    id: Date.now() + Math.random(),
    x: 22 + Math.random() * Math.max(0, cw - 44),
    y: 22 + Math.random() * Math.max(0, ch - 44),
    expiresAt: performance.now() + 1200 + Math.random() * 1000,
  })
}

function loop() {
  if (status.value !== 'playing') return
  const now = performance.now()
  for (let i = targets.value.length - 1; i >= 0; i--) {
    if (targets.value[i].expiresAt <= now) targets.value.splice(i, 1)
  }
  if (now - lastSpawn > 600) {
    lastSpawn = now
    if (targets.value.length < 4) spawnTarget()
  }
  frame = requestAnimationFrame(loop)
}

function onClick(t: { id: number; x: number; y: number; expiresAt: number }) {
  if (status.value !== 'playing') return
  targets.value = targets.value.filter((x) => x.id !== t.id)
  score.value += 10
  hits.value++
  sfx.hit()
  if (hits.value >= 15) {
    status.value = 'won'
    sfx.win()
    if (timer) clearInterval(timer)
  }
}

function start() {
  if (frame !== null) cancelAnimationFrame(frame)
  score.value = 0
  hits.value = 0
  timeLeft.value = 60
  targets.value = []
  status.value = 'playing'
  lastSpawn = 0
  if (timer) clearInterval(timer)
  timer = window.setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      status.value = hits.value >= 15 ? 'won' : 'lost'
      sfx.lose()
      if (timer) clearInterval(timer)
    }
  }, 1000)
  frame = requestAnimationFrame(loop)
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (frame !== null) cancelAnimationFrame(frame)
})

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="score"
    :status="status"
    title="ALIEN SNIPERS"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Clique nos aliens antes que eles sumam. 15 em 60s.' : 'Click the aliens before they vanish. 15 in 60s.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <div class="flex items-center justify-between text-xs">
        <span class="text-amber">HITS <span class="font-bold">{{ hits }}</span>/15</span>
        <span :class="timeLeft < 10 ? 'danger-phosphor' : 'text-cyan'">⏱ {{ timeLeft }}s</span>
      </div>
      <div
        ref="containerRef"
        class="relative bg-void-deep border border-surface-600 overflow-hidden cursor-crosshair"
        style="width: 100%; aspect-ratio: 1;"
      >
        <button
          type="button"
          :aria-label="locale.isPt ? 'Alienígena' : 'Alien'"
          v-for="t in targets"
          :key="t.id"
          class="absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer danger-phosphor text-3xl"
          :style="{ left: `${t.x}px`, top: `${t.y}px` }"
          @click="onClick(t)"
        >👽</button>
        <p v-if="targets.length === 0" class="absolute inset-0 grid place-items-center text-ink-dim text-xs">
          {{ locale.current === 'pt-BR' ? 'Aguardando alvos...' : 'Waiting for targets...' }}
        </p>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ SHARP SHOOTER ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ TIME OUT ✕</p>
    </div>
  </CrtFrame>
</template>
