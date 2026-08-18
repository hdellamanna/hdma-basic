<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 10, H = 10
const player = ref({ x: 4, y: 9 })
const mines = ref<{ x: number; y: number; defused: boolean }[]>([])
const defused = ref(0)
const moves = ref(0)
const status = ref<'playing' | 'won' | 'lost'>('playing')

function start() {
  player.value = { x: 4, y: 9 }
  defused.value = 0
  moves.value = 0
  status.value = 'playing'
  mines.value = []
  // 10 mines random
  for (let i = 0; i < 10; i++) {
    let x, y
    do {
      x = Math.floor(Math.random() * W)
      y = Math.floor(Math.random() * (H - 2))
    } while (mines.value.some((m) => m.x === x && m.y === y) || (x === 4 && y === 9))
    mines.value.push({ x, y, defused: false })
  }
}

function move(dx: number, dy: number) {
  if (status.value !== 'playing') return
  const nx = player.value.x + dx
  const ny = player.value.y + dy
  if (nx < 0 || nx >= W || ny < 0 || ny >= H) return
  player.value = { x: nx, y: ny }
  moves.value++
  // Stepped on mine?
  const m = mines.value.find((mm) => mm.x === nx && mm.y === ny)
  if (m && !m.defused) {
    sfx.explode()
    status.value = 'lost'
    return
  }
  sfx.tick()
}

function defuse() {
  if (status.value !== 'playing') return
  const m = mines.value.find((mm) => mm.x === player.value.x && mm.y === player.value.y)
  if (m && !m.defused) {
    m.defused = true
    defused.value++
    sfx.powerup()
    if (defused.value >= 10) {
      status.value = 'won'
      sfx.win()
    }
  } else {
    sfx.error()
  }
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'ArrowUp' || e.key === 'w') move(0, -1)
  if (e.key === 'ArrowDown' || e.key === 's') move(0, 1)
  if (e.key === 'ArrowLeft' || e.key === 'a') move(-1, 0)
  if (e.key === 'ArrowRight' || e.key === 'd') move(1, 0)
  if (e.key === ' ') { e.preventDefault(); defuse() }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="defused"
    :status="status"
    title="SPACE MINES"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="mines.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Desarme 10 minas. Setas para mover, ESPAÇO para desarmar.' : 'Defuse 10 mines. Arrows to move, SPACE to defuse.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-3">
      <p class="text-xs flex items-center justify-between">
        <span class="text-cyan">DEFUSED <span class="text-amber">{{ defused }}</span>/10</span>
        <span class="text-ink-muted">MOVES {{ moves }}</span>
      </p>
      <div class="grid gap-0.5 bg-void-deep p-1 border border-surface-600" :style="{ gridTemplateColumns: `repeat(${W}, 1fr)`, aspectRatio: '1' }">
        <div
          v-for="y in H"
          :key="`r-${y}`"
          class="contents"
        >
          <div
            v-for="x in W"
            :key="`c-${y}-${x}`"
            class="aspect-square border border-surface-700 grid place-items-center text-xs"
            :class="player.x === x - 1 && player.y === y - 1 ? 'border-phosphor-green' : ''"
          >
            <span
              v-if="player.x === x - 1 && player.y === y - 1"
              class="phosphor text-shadow-neon"
            >▲</span>
            <span
              v-else-if="mines.some((m) => m.x === x - 1 && m.y === y - 1 && !m.defused)"
              class="danger-phosphor"
            >◆</span>
            <span
              v-else-if="mines.some((m) => m.x === x - 1 && m.y === y - 1 && m.defused)"
              class="text-ink-dim"
            >·</span>
          </div>
        </div>
      </div>
      <button class="arcade-btn arcade-btn-amber w-full" @click="defuse">⌬ DEFUSE</button>
      <div class="grid grid-cols-3 gap-1 sm:hidden">
        <div></div>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(0, -1)">↑</button>
        <div></div>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(-1, 0)">←</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(0, 1)">↓</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(1, 0)">→</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ CLEAR ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ BOOM! ✕</p>
    </div>
  </CrtFrame>
</template>
