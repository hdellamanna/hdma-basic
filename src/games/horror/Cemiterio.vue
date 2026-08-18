<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 20, H = 10
const player = ref({ x: 10, y: 5 })
const skeletons = ref<{ x: number; y: number }[]>([])
const holes = ref<{ x: number; y: number }[]>([])
const moves = ref(0)
const turn = ref(0)
const status = ref<'playing' | 'won' | 'lost'>('playing')

const WALL = '#'
const TOMB = '+'
const YOU = '*'
const SKELETON = 'X'
const HOLE = 'O'

function start() {
  player.value = { x: 10, y: 5 }
  holes.value = []
  moves.value = 5
  turn.value = 0
  status.value = 'playing'
  skeletons.value = [
    { x: 1, y: 1 }, { x: 18, y: 1 }, { x: 1, y: 8 }, { x: 18, y: 8 },
  ]
}

function move(dx: number, dy: number) {
  if (status.value !== 'playing') return
  const nx = player.value.x + dx
  const ny = player.value.y + dy
  if (nx < 1 || nx > W - 2 || ny < 1 || ny > H - 2) return
  if (holes.value.some((h) => h.x === nx && h.y === ny)) {
    sfx.lose()
    log.value.push(locale.current === 'pt-BR' ? '✕ Caiu no próprio buraco' : '✕ Fell in your own hole')
    status.value = 'lost'
    return
  }
  player.value = { x: nx, y: ny }
  turn.value++
  if (skeletons.value.some((s) => s.x === nx && s.y === ny)) {
    sfx.lose()
    log.value.push(locale.current === 'pt-BR' ? '✕ Esqueleto te matou' : '✕ Skeleton killed you')
    status.value = 'lost'
    return
  }
  // Move skeletons
  skeletons.value.forEach((s) => {
    if (Math.random() < 0.5) {
      const sdx = Math.sign(player.value.x - s.x) * (Math.random() < 0.6 ? 1 : 0)
      const sdy = Math.sign(player.value.y - s.y) * (Math.random() < 0.6 ? 1 : 0)
      const sx = s.x + sdx
      const sy = s.y + sdy
      if (sx >= 1 && sx <= W - 2 && sy >= 1 && sy <= H - 2) {
        s.x = sx
        s.y = sy
      }
    }
  })
  if (skeletons.value.some((s) => s.x === player.value.x && s.y === player.value.y)) {
    sfx.lose()
    log.value.push(locale.current === 'pt-BR' ? '✕ Esqueleto te matou' : '✕ Skeleton killed you')
    status.value = 'lost'
    return
  }
  if (player.value.x === 1 || player.value.x === W - 2 || player.value.y === 1 || player.value.y === H - 2) {
    status.value = 'won'
    sfx.win()
  } else if (turn.value >= 40) {
    log.value.push(locale.current === 'pt-BR' ? '✕ Meia-noite' : '✕ Midnight')
    status.value = 'lost'
    sfx.lose()
  }
}

function dig() {
  if (moves.value <= 0) {
    sfx.error()
    return
  }
  moves.value--
  holes.value.push({ x: player.value.x, y: player.value.y })
  sfx.tick()
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'w' || e.key === 'W') move(0, -1)
  if (e.key === 's' || e.key === 'S') move(0, 1)
  if (e.key === 'a' || e.key === 'A') move(-1, 0)
  if (e.key === 'd' || e.key === 'D') move(1, 0)
  if (e.key === 'c' || e.key === 'C') dig()
}

const log = ref<string[]>([])

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'CEMITÉRIO' : 'CEMETERY'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="skeletons.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Chegue à borda em 40 turnos. C = cavar buraco (5 máx). WASD para mover.' : 'Reach the edge in 40 turns. C = dig hole (5 max). WASD to move.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <p class="text-xs flex items-center justify-between">
        <span class="text-cyan">TURN <span :class="turn > 32 ? 'danger-phosphor' : 'text-amber'">{{ turn }}</span>/40</span>
        <span class="text-amber">DIGS {{ moves }}/5</span>
      </p>
      <div class="grid gap-0.5 bg-void-deep p-1 border border-surface-600" :style="{ gridTemplateColumns: `repeat(${W}, 1fr)` }">
        <template v-for="y in H" :key="`r-${y}`">
          <div
            v-for="x in W"
            :key="`c-${y}-${x}`"
            class="aspect-square border border-surface-700 grid place-items-center text-xs"
            :class="player.x === x - 1 && player.y === y - 1 ? 'border-amber' : ''"
          >
            <span v-if="x === 1 || x === W || y === 1 || y === H" class="text-ink-dim">:</span>
            <span v-else-if="player.x === x - 1 && player.y === y - 1" class="amber-phosphor text-shadow-neon font-bold">*</span>
            <span v-else-if="skeletons.some((s) => s.x === x - 1 && s.y === y - 1)" class="danger-phosphor font-bold">X</span>
            <span v-else-if="holes.some((h) => h.x === x - 1 && h.y === y - 1)" class="text-ink-muted">O</span>
          </div>
        </template>
      </div>
      <div class="grid grid-cols-4 gap-1 sm:hidden">
        <div></div>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(0, -1)">W</button>
        <div></div>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(-1, 0)">A</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(0, 1)">S</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(1, 0)">D</button>
        <div></div>
        <button class="arcade-btn arcade-btn-amber text-[10px] py-1" @click="dig">DIG</button>
      </div>
      <div class="border border-surface-600 bg-surface-800 p-2 h-12 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ ESCAPED ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ DOOMED ✕</p>
    </div>
  </CrtFrame>
</template>
