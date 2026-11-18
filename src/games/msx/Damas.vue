<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import { useRoundTimer } from '../../composables/useRoundTimer'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

type Piece = { color: 'r' | 'b' | 'R' | 'B' | null } // r/b normal, R/B king
const board = ref<Piece[][]>([])
const turn = ref<'r' | 'b'>('r')
const selected = ref<{ r: number; c: number } | null>(null)
const validMoves = ref<{ r: number; c: number; jump?: { r: number; c: number } }[]>([])
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')
const { schedule, cancel } = useRoundTimer()

function initBoard() {
  board.value = Array(8).fill(null).map(() => Array(8).fill(null))
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) board.value[r][c] = { color: 'b' }
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) board.value[r][c] = { color: 'r' }
    }
  }
}

function start() {
  cancel()
  initBoard()
  turn.value = 'r'
  selected.value = null
  validMoves.value = []
  log.value = [locale.current === 'pt-BR' ? 'Vermelho começa.' : 'Red starts.']
  status.value = 'playing'
}

function getMoves(r: number, c: number) {
  const piece = board.value[r][c]
  if (!piece || piece.color.toLowerCase() !== turn.value) return []
  const moves: typeof validMoves.value = []
  const dirs = piece.color === piece.color.toUpperCase()
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : turn.value === 'r' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc
    if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) continue
    if (!board.value[nr][nc]) {
      moves.push({ r: nr, c: nc })
    } else {
      const jr = nr + dr, jc = nc + dc
      if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && !board.value[jr][jc]) {
        const jp = board.value[nr][nc]
        if (jp && jp.color.toLowerCase() !== turn.value) {
          moves.push({ r: jr, c: jc, jump: { r: nr, c: nc } })
        }
      }
    }
  }
  return moves
}

function select(r: number, c: number) {
  if (status.value !== 'playing' || turn.value !== 'r') return
  const p = board.value[r][c]
  if (p && p.color.toLowerCase() === turn.value) {
    selected.value = { r, c }
    validMoves.value = availableMoves().filter(({ from }) => from.r === r && from.c === c).map(({ mv }) => mv)
    sfx.select()
  } else if (selected.value) {
    const mv = validMoves.value.find((m) => m.r === r && m.c === c)
    if (mv) {
      move(mv)
    }
  }
}

function move(mv: { r: number; c: number; jump?: { r: number; c: number } }) {
  if (!selected.value) return
  const { r, c } = selected.value
  const piece = board.value[r][c]!
  board.value[r][c] = null
  board.value[mv.r][mv.c] = piece
  if (mv.jump) {
    board.value[mv.jump.r][mv.jump.c] = null
    sfx.hit()
  } else sfx.tick()
  // King promotion
  if (piece.color === 'r' && mv.r === 0) board.value[mv.r][mv.c] = { color: 'R' }
  if (piece.color === 'b' && mv.r === 7) board.value[mv.r][mv.c] = { color: 'B' }
  selected.value = null
  validMoves.value = []
  // Check win
  const redCount = board.value.flat().filter((p) => p && p.color.toLowerCase() === 'r').length
  const blackCount = board.value.flat().filter((p) => p && p.color.toLowerCase() === 'b').length
  if (redCount === 0) { status.value = 'lost'; sfx.lose(); return }
  if (blackCount === 0) { status.value = 'won'; sfx.win(); return }
  // AI: simple move for black
  turn.value = turn.value === 'r' ? 'b' : 'r'
  const nextMoves = availableMoves()
  if (nextMoves.length === 0) {
    status.value = turn.value === 'r' ? 'lost' : 'won'
    if (status.value === 'won') sfx.win()
    else sfx.lose()
  } else if (turn.value === 'b') {
    schedule(() => aiMove(nextMoves), 500)
  }
}

function availableMoves() {
  const allMoves: { from: { r: number; c: number }; mv: { r: number; c: number; jump?: { r: number; c: number } } }[] = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const mvs = getMoves(r, c)
      for (const m of mvs) allMoves.push({ from: { r, c }, mv: m })
    }
  }
  const captures = allMoves.filter(({ mv }) => mv.jump)
  return captures.length ? captures : allMoves
}

function aiMove(allMoves: ReturnType<typeof availableMoves>) {
  if (status.value !== 'playing' || turn.value !== 'b') return
  const choice = allMoves[Math.floor(Math.random() * allMoves.length)]
  selected.value = choice.from
  validMoves.value = getMoves(choice.from.r, choice.from.c)
  move(choice.mv)
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'Escape') {
    selected.value = null
    validMoves.value = []
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    title="DAMAS"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="board.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Você é vermelho. Clique para selecionar, depois no destino. Capturas são obrigatórias.' : 'You are red. Click to select, then destination. Captures are mandatory.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <p class="text-xs text-amber">TURN: <span :class="turn === 'r' ? 'text-danger' : 'text-ink'">{{ turn === 'r' ? (locale.current === 'pt-BR' ? 'VERMELHO' : 'RED') : (locale.current === 'pt-BR' ? 'PRETO' : 'BLACK') }}</span></p>
      <div class="grid grid-cols-8 gap-0 bg-void-deep border border-surface-600 mx-auto" style="max-width: 360px;">
        <template v-for="(row, r) in board" :key="`r-${r}`">
          <div
            v-for="(piece, c) in row"
            :key="`c-${r}-${c}`"
            class="aspect-square grid place-items-center cursor-pointer"
            :class="[
              (r + c) % 2 === 0 ? 'bg-surface-700' : 'bg-void-deep',
              selected?.r === r && selected?.c === c ? 'ring-2 ring-amber' : '',
              validMoves.some((m) => m.r === r && m.c === c) ? 'ring-2 ring-cyan' : '',
            ]"
            @click="select(r, c)"
          >
            <span
              v-if="piece"
              class="w-3/4 h-3/4 rounded-full border-2 font-display text-xs grid place-items-center"
              :class="piece.color.toLowerCase() === 'r' ? 'bg-danger border-amber text-amber' : 'bg-surface-800 border-ink text-ink'"
            >{{ piece.color === piece.color.toUpperCase() ? '★' : '' }}</span>
          </div>
        </template>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ VOCÊ VENCEU ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ DERROTADO ✕</p>
    </div>
  </CrtFrame>
</template>
