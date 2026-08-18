<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 12, H = 10
const player = ref({ x: 5, y: 5 })
const astronauts = ref<{ x: number; y: number; rescued: boolean }[]>([])
const rescued = ref(0)
const turns = ref(0)
const maxTurns = 30
const status = ref<'playing' | 'won' | 'lost'>('playing')

function start() {
  player.value = { x: 5, y: 5 }
  rescued.value = 0
  turns.value = 0
  status.value = 'playing'
  astronauts.value = []
  for (let i = 0; i < 5; i++) {
    let x, y
    do {
      x = Math.floor(Math.random() * W)
      y = Math.floor(Math.random() * H)
    } while ((x === 5 && y === 5) || astronauts.value.some((a) => a.x === x && a.y === y))
    astronauts.value.push({ x, y, rescued: false })
  }
}

function move(dx: number, dy: number) {
  if (status.value !== 'playing') return
  const nx = player.value.x + dx
  const ny = player.value.y + dy
  if (nx < 0 || nx >= W || ny < 0 || ny >= H) return
  player.value = { x: nx, y: ny }
  turns.value++
  // Rescue?
  const a = astronauts.value.find((aa) => aa.x === nx && aa.y === ny)
  if (a && !a.rescued) {
    a.rescued = true
    rescued.value++
    sfx.coin()
  }
  if (rescued.value >= 5) {
    status.value = 'won'
    sfx.win()
  } else if (turns.value >= maxTurns) {
    status.value = 'lost'
    sfx.lose()
  }
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'ArrowUp' || e.key === 'w') move(0, -1)
  if (e.key === 'ArrowDown' || e.key === 's') move(0, 1)
  if (e.key === 'ArrowLeft' || e.key === 'a') move(-1, 0)
  if (e.key === 'ArrowRight' || e.key === 'd') move(1, 0)
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="rescued"
    :status="status"
    title="SPACE RESCUE"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="astronauts.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Resgate 5 astronautas em 30 turnos. Setas para mover.' : 'Rescue 5 astronauts in 30 turns. Arrows to move.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-3">
      <p class="text-xs flex items-center justify-between">
        <span class="text-cyan">RESCUED <span class="text-amber">{{ rescued }}</span>/5</span>
        <span :class="turns > 22 ? 'danger-phosphor' : 'text-ink-muted'">TURN {{ turns }}/{{ maxTurns }}</span>
      </p>
      <div class="grid gap-0.5 bg-void-deep p-1 border border-surface-600" :style="{ gridTemplateColumns: `repeat(${W}, 1fr)`, aspectRatio: '1.2' }">
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
              v-else-if="astronauts.some((a) => a.x === x - 1 && a.y === y - 1 && !a.rescued)"
              class="amber-phosphor"
            >A</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-1 sm:hidden">
        <div></div>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(0, -1)">↑</button>
        <div></div>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(-1, 0)">←</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(0, 1)">↓</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(1, 0)">→</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ ALL RESCUED ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ TIME OUT ✕</p>
    </div>
  </CrtFrame>
</template>
