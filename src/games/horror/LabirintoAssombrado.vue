<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

// maze 7x10, 0=corridor, 1=wall, 9=exit
const MAZE = [
  '0000000000',
  '0111011010',
  '0001010100',
  '0111010110',
  '0100000100',
  '0101111010',
  '0001000090',
]
const W = 10, H = 7
const player = ref({ x: 0, y: 0 })
const ghost = ref({ x: 6, y: 3 })
const dir = ref(1) // 1=N 2=E 3=S 4=W
const moves = ref(0)
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')

function start() {
  player.value = { x: 0, y: 0 }
  ghost.value = { x: 6, y: 3 }
  dir.value = 1
  moves.value = 0
  status.value = 'playing'
}

function turnLeft() {
  dir.value = dir.value === 1 ? 4 : dir.value - 1
  sfx.tick()
}
function turnRight() {
  dir.value = dir.value === 4 ? 1 : dir.value + 1
  sfx.tick()
}

function forward() {
  if (status.value !== 'playing') return
  const dx = [0, 1, 0, -1]
  const dy = [-1, 0, 1, 0]
  const nx = player.value.x + dx[dir.value - 1]
  const ny = player.value.y + dy[dir.value - 1]
  if (nx < 0 || nx >= W || ny < 0 || ny >= H) return
  if (MAZE[ny][nx] === '1') return
  player.value = { x: nx, y: ny }
  moves.value++
  if (MAZE[ny][nx] === '9') {
    status.value = 'won'
    sfx.win()
    return
  }
  // ghost moves every 5 moves
  if (moves.value % 5 === 0) {
    if (Math.random() < 0.4) {
      const gdx = Math.sign(player.value.x - ghost.value.x)
      const gdy = Math.sign(player.value.y - ghost.value.y)
      const gx = ghost.value.x + gdx
      const gy = ghost.value.y + gdy
      if (gx >= 0 && gx < W && gy >= 0 && gy < H && MAZE[gy][gx] !== '1') {
        ghost.value = { x: gx, y: gy }
      }
    }
  }
  if (ghost.value.x === player.value.x && ghost.value.y === player.value.y) {
    status.value = 'lost'
    sfx.lose()
  }
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'n' || e.key === 'N') turnLeft()
  if (e.key === 'm' || e.key === 'M') turnRight()
  if (e.key === ' ' || e.key === 'x' || e.key === 'X') { e.preventDefault(); forward() }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

const view = computed(() => {
  const dx = [0, 1, 0, -1][dir.value - 1]
  const dy = [-1, 0, 1, 0][dir.value - 1]
  return [3, 2, 1].map((depth) => ({
    cells: [-1, 0, 1].map((side) => {
      const x = player.value.x + depth * dx - side * dy
      const y = player.value.y + depth * dy + side * dx
      if (ghost.value.x === x && ghost.value.y === y) return 'G'
      const tile = MAZE[y]?.[x]
      return tile === '0' ? '·' : tile === '9' ? '+' : '#'
    }),
  }))
})

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'LABIRINTO ASSOMBRADO' : 'HAUNTED LABYRINTH'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-2">
        {{ locale.current === 'pt-BR' ? 'Você só vê 3 células à frente. N=vira esquerda, M=vira direita, ESPAÇO=avança.' : 'You see 3 cells ahead. N=turn left, M=turn right, SPACE=forward.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-cyan text-xs">MOVES <span class="text-amber">{{ moves }}</span></p>
      <div class="bg-void-deep border border-surface-600 p-3 text-center phosphor font-display text-3xl space-y-1">
        <p>██ {{ view[0].cells[1] }} ██</p>
        <p>██ {{ view[1].cells.join('') }} ██</p>
        <p>██ {{ view[2].cells[1] }} ██</p>
      </div>
      <div class="grid grid-cols-3 gap-1">
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5" @click="turnLeft">N ←</button>
        <button class="arcade-btn arcade-btn-amber" @click="forward">▶</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5" @click="turnRight">M →</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ ENCONTROU A CRUZ ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ FANTASMA TE PEGOU ✕</p>
    </div>
  </CrtFrame>
</template>
