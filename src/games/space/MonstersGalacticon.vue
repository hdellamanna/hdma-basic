<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import { useGameLoop } from '../../composables/useGameLoop'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 320, H = 240
const ship = { x: W / 2, y: H - 30 }
const bullets = ref<{ x: number; y: number }[]>([])
const monsters = ref<{ x: number; y: number; alive: boolean }[]>([])
const shipX = ref(W / 2)
const wave = ref(0)
const score = ref(0)
const lives = ref(3)
const status = ref<'playing' | 'won' | 'lost'>('playing')

function spawnWave() {
  wave.value++
  monsters.value = []
  for (let i = 0; i < 8 + wave.value * 2; i++) {
    monsters.value.push({
      x: 30 + (i % 8) * 35,
      y: 20 + Math.floor(i / 8) * 25,
      alive: true,
    })
  }
}

let lastShot = 0
let lastMove = 0
const loop = useGameLoop((dt) => {
  if (status.value !== 'playing') return
  // Move monsters slowly down
  lastMove += dt
  if (lastMove > 700) {
    lastMove = 0
    monsters.value.forEach((m) => { if (m.alive) m.y += 8 })
    if (monsters.value.some((m) => m.alive && m.y > H - 50)) {
      lives.value--
      sfx.hit()
      if (lives.value <= 0) {
        status.value = 'lost'
        sfx.lose()
        loop.stop()
        return
      }
      monsters.value.forEach((m) => m.y -= 60)
    }
  }
  // Move bullets
  bullets.value = bullets.value.filter((b) => b.y > 0)
  bullets.value.forEach((b) => (b.y -= 4))
  // Collisions
  for (const b of bullets.value) {
    for (const m of monsters.value) {
      if (m.alive && Math.abs(b.x - m.x) < 14 && Math.abs(b.y - m.y) < 14) {
        m.alive = false
        b.y = -100
        score.value += 10
        sfx.hit()
        break
      }
    }
  }
  if (monsters.value.every((m) => !m.alive)) {
    if (wave.value >= 3) {
      status.value = 'won'
      sfx.win()
      loop.stop()
    } else {
      spawnWave()
    }
  }
})

function shoot() {
  if (performance.now() - lastShot < 200) return
  lastShot = performance.now()
  bullets.value.push({ x: shipX.value, y: H - 40 })
  sfx.shoot()
}

function moveShip(dx: number) {
  shipX.value = Math.max(10, Math.min(W - 10, shipX.value + dx))
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'ArrowLeft' || e.key === 'a') moveShip(-15)
  if (e.key === 'ArrowRight' || e.key === 'd') moveShip(15)
  if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); shoot() }
}

function start() {
  lastShot = -Infinity
  lastMove = 0
  score.value = 0
  lives.value = 3
  wave.value = 0
  shipX.value = W / 2
  bullets.value = []
  status.value = 'playing'
  spawnWave()
  loop.start()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  loop.stop()
})

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="score"
    :lives="lives"
    :status="status"
    title="MONSTERS OF GALACTICON"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="!loop.running.value && status === 'playing' && wave === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-2">
        {{ locale.current === 'pt-BR' ? 'Atire com ESPAÇO. Mova com setas.' : 'Shoot with SPACE. Move with arrows.' }}
      </p>
      <p class="text-cyan text-xs mb-4">Wave 1-3</p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <div class="text-xs text-ink-muted flex items-center justify-between">
        <span>WAVE <span class="text-amber">{{ wave }}/3</span></span>
        <button class="arcade-btn-ghost border border-surface-600 px-2 py-0.5 text-[9px]" @click="shoot">▮ FIRE</button>
      </div>
      <div class="relative bg-void-deep border border-surface-600 overflow-hidden" :style="{ aspectRatio: `${W} / ${H}` }">
        <div
          v-for="m in monsters"
          :key="`m-${m.x}-${m.y}`"
          v-show="m.alive"
          class="absolute w-3 h-3 danger-phosphor text-shadow-neon"
          :style="{ left: `${m.x}px`, top: `${m.y}px`, transform: 'translate(-50%, -50%)' }"
        >▣</div>
        <div
          v-for="(b, i) in bullets"
          :key="`b-${i}`"
          class="absolute w-0.5 h-3 bg-amber shadow-neon-amber"
          :style="{ left: `${b.x}px`, top: `${b.y}px` }"
        ></div>
        <div
          class="absolute phosphor text-shadow-neon"
          :style="{ left: `${shipX}px`, bottom: '20px', transform: 'translateX(-50%)' }"
        >▲</div>
      </div>
      <div class="grid grid-cols-3 gap-1 sm:hidden">
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-2" @click="moveShip(-15)">◀</button>
        <button class="arcade-btn-amber text-[10px] py-2" @click="shoot">FIRE</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-2" @click="moveShip(15)">▶</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ GALAXY SAVED ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ DESTROYED ✕</p>
    </div>
  </CrtFrame>
</template>
