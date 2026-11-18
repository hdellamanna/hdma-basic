<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const MAZE = [
  '0000000000',
  '0111011010',
  '0001010100',
  '0111010110',
  '0100000100',
  '0101111011',
  '0001000090',
]
const W = 10, H = 7
const player = ref({ x: 0, y: 0 })
const bull = ref({ x: 5, y: 3 })
const dir = ref(1)
const moves = ref(0)
const bullSteps = ref(8)
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')

function start() {
  player.value = { x: 0, y: 0 }
  bull.value = { x: 5, y: 3 }
  dir.value = 1
  moves.value = 0
  bullSteps.value = 8
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
  bullSteps.value--
  if (MAZE[ny][nx] === '9') {
    status.value = 'won'
    sfx.win()
    return
  }
  if (bullSteps.value <= 0) {
    // bull moves
    bullSteps.value = 3
    const bdx = Math.sign(player.value.x - bull.value.x)
    const bdy = Math.sign(player.value.y - bull.value.y)
    if (Math.abs(bdx) > Math.abs(bdy) && bdx !== 0) {
      const bx = bull.value.x + bdx
      if (bx >= 0 && bx < W && MAZE[bull.value.y][bx] !== '1') bull.value.x = bx
    } else if (bdy !== 0) {
      const by = bull.value.y + bdy
      if (by >= 0 && by < H && MAZE[by][bull.value.x] !== '1') bull.value.y = by
    }
  }
  if (bull.value.x === player.value.x && bull.value.y === player.value.y) {
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
  const dx = [0, 1, 0, -1]
  const dy = [-1, 0, 1, 0]
  const f = { x: player.value.x + dx[dir.value - 1], y: player.value.y + dy[dir.value - 1] }
  const r = { x: dx[(dir.value + 1) % 4], y: dy[(dir.value + 1) % 4] }
  const l = { x: dx[(dir.value + 3) % 4], y: dy[(dir.value + 3) % 4] }
  return [
    { cell: f, txt: MAZE[f.y]?.[f.x] ?? '1', bull: bull.value.x === f.x && bull.value.y === f.y },
    { cell: { x: player.value.x + l.x, y: player.value.y + l.y }, txt: MAZE[player.value.y + l.y]?.[player.value.x + l.x] ?? '1' },
    { cell: { x: player.value.x, y: player.value.y }, txt: '0' },
    { cell: { x: player.value.x + r.x, y: player.value.y + r.y }, txt: MAZE[player.value.y + r.y]?.[player.value.x + r.x] ?? '1' },
  ]
})

function cellChar(c: string, bull: boolean) {
  if (bull) return 'B'
  if (c === '1') return '#'
  if (c === '9') return '+'
  return '·'
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'LABIRINTO 3D' : '3D LABYRINTH'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-2">
        {{ locale.current === 'pt-BR' ? 'Vista em primeira pessoa. N=vira esquerda, M=direita, ESPAÇO=avança. Encontre a cruz.' : 'First person. N=turn left, M=right, SPACE=forward. Find the cross.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-cyan text-xs">MOVES <span class="text-amber">{{ moves }}</span></p>
      <div class="bg-void-deep border border-surface-600 p-4 text-center phosphor font-mono space-y-1">
        <p class="text-2xl">#{{ cellChar(view[0].txt, view[0].bull) }}#</p>
        <p class="text-3xl">{{ cellChar(view[1].txt, false) }}{{ cellChar(view[2].txt, false) }}{{ cellChar(view[3].txt, false) }}</p>
      </div>
      <div class="grid grid-cols-3 gap-1">
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5" @click="turnLeft">N ←</button>
        <button class="arcade-btn arcade-btn-amber" @click="forward">▶</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5" @click="turnRight">M →</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ CRUZ ENCONTRADA ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ TOURO TE PEGOU ✕</p>
    </div>
  </CrtFrame>
</template>
