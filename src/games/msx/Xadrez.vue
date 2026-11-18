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

type Piece = { type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k'; color: 'w' | 'b' }
const board = ref<(Piece | null)[][]>([])
const turn = ref<'w' | 'b'>('w')
const selected = ref<{ r: number; c: number } | null>(null)
const validMoves = ref<{ r: number; c: number }[]>([])
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')
const { schedule, cancel } = useRoundTimer()

function initBoard() {
  const empty: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null))
  const back: Piece['type'][] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
  for (let c = 0; c < 8; c++) {
    empty[0][c] = { type: back[c], color: 'b' }
    empty[1][c] = { type: 'p', color: 'b' }
    empty[6][c] = { type: 'p', color: 'w' }
    empty[7][c] = { type: back[c], color: 'w' }
  }
  return empty
}

function start() {
  cancel()
  board.value = initBoard()
  turn.value = 'w'
  selected.value = null
  validMoves.value = []
  log.value = [locale.current === 'pt-BR' ? 'Brancas começam.' : 'White starts.']
  status.value = 'playing'
}

function isValid(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8
}

function getMoves(r: number, c: number) {
  const p = board.value[r][c]
  if (!p) return []
  const moves: { r: number; c: number }[] = []
  const enemy = p.color === 'w' ? 'b' : 'w'
  if (p.type === 'p') {
    const dir = p.color === 'w' ? -1 : 1
    const startRow = p.color === 'w' ? 6 : 1
    if (isValid(r + dir, c) && !board.value[r + dir][c]) {
      moves.push({ r: r + dir, c })
      if (r === startRow && isValid(r + 2 * dir, c) && !board.value[r + 2 * dir][c]) moves.push({ r: r + 2 * dir, c })
    }
    for (const dc of [-1, 1]) {
      if (isValid(r + dir, c + dc) && board.value[r + dir][c + dc]?.color === enemy) moves.push({ r: r + dir, c: c + dc })
    }
  }
  if (p.type === 'n') {
    for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
      if (isValid(r + dr, c + dc) && board.value[r + dr][c + dc]?.color !== p.color) moves.push({ r: r + dr, c: c + dc })
    }
  }
  if (['b', 'r', 'q'].includes(p.type)) {
    const dirs: number[][] = []
    if (p.type !== 'b') { dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]) }
    if (p.type !== 'r') { dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]) }
    for (const [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc
      while (isValid(nr, nc)) {
        const t = board.value[nr][nc]
        if (!t) moves.push({ r: nr, c: nc })
        else { if (t.color === enemy) moves.push({ r: nr, c: nc }); break }
        nr += dr; nc += dc
      }
    }
  }
  if (p.type === 'k') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        if (isValid(r + dr, c + dc) && board.value[r + dr][c + dc]?.color !== p.color) moves.push({ r: r + dr, c: c + dc })
      }
    }
  }
  return moves
}

function findKing(color: 'w' | 'b') {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board.value[r][c]?.type === 'k' && board.value[r][c]?.color === color) return { r, c }
    }
  }
  return null
}

function isInCheck(color: 'w' | 'b') {
  const k = findKing(color)
  if (!k) return false
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board.value[r][c]
      if (p && p.color !== color) {
        const m = getMoves(r, c)
        if (m.some((mm) => mm.r === k.r && mm.c === k.c)) return true
      }
    }
  }
  return false
}

function select(r: number, c: number) {
  if (status.value !== 'playing' || turn.value !== 'w') return
  const p = board.value[r][c]
  if (p && p.color === turn.value) {
    selected.value = { r, c }
    validMoves.value = getMoves(r, c)
    sfx.select()
  } else if (selected.value) {
    const mv = validMoves.value.find((m) => m.r === r && m.c === c)
    if (mv) {
      move(mv)
    }
  }
}

function move(mv: { r: number; c: number }) {
  if (!selected.value) return
  const { r, c } = selected.value
  const piece = board.value[r][c]!
  const target = board.value[mv.r][mv.c]
  board.value[r][c] = null
  board.value[mv.r][mv.c] = piece
  // Pawn promotion
  if (piece.type === 'p' && (mv.r === 0 || mv.r === 7)) {
    board.value[mv.r][mv.c] = { type: 'q', color: piece.color }
  }
  if (target) sfx.hit(); else sfx.tick()
  selected.value = null
  validMoves.value = []
  turn.value = turn.value === 'w' ? 'b' : 'w'
  // Check checkmate
  if (!findKing('w')) { status.value = 'lost'; sfx.lose(); return }
  if (!findKing('b')) { status.value = 'won'; sfx.win(); return }
  if (isInCheck(turn.value)) log.value.push(locale.current === 'pt-BR' ? '⚠ Xeque!' : '⚠ Check!')
  if (turn.value === 'b') schedule(aiMove, 500)
}

function aiMove() {
  if (status.value !== 'playing' || turn.value !== 'b') return
  const allMoves: { from: { r: number; c: number }; mv: { r: number; c: number } }[] = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board.value[r][c]
      if (p?.color === 'b') {
        const mvs = getMoves(r, c)
        for (const m of mvs) allMoves.push({ from: { r, c }, mv: m })
      }
    }
  }
  if (allMoves.length === 0) {
    status.value = 'won'
    sfx.win()
    return
  }
  const choice = allMoves[Math.floor(Math.random() * allMoves.length)]
  selected.value = choice.from
  validMoves.value = getMoves(choice.from.r, choice.from.c)
  move(choice.mv)
}

const PIECE_GLYPH: Record<string, string> = {
  wp: '♙', wn: '♘', wb: '♗', wr: '♖', wq: '♕', wk: '♔',
  bp: '♟', bn: '♞', bb: '♝', br: '♜', bq: '♛', bk: '♚',
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { selected.value = null; validMoves.value = [] }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function onQuit() { router.push('/') }

const STORAGE_KEY = 'hdma-mlogo-era:xadrez:save'
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ board: board.value, turn: turn.value }))
  sfx.coin()
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (!Array.isArray(data.board) || data.board.length !== 8
        || !data.board.every((row: unknown) => Array.isArray(row) && row.length === 8
          && row.every((piece) => piece === null || ((piece?.color === 'w' || piece?.color === 'b')
            && ['p', 'n', 'b', 'r', 'q', 'k'].includes(piece?.type))))
        || (data.turn !== 'w' && data.turn !== 'b')) return
      cancel()
      board.value = data.board
      turn.value = data.turn
      selected.value = null
      validMoves.value = []
      status.value = 'playing'
      if (turn.value === 'b') schedule(aiMove, 500)
      log.value.push(locale.current === 'pt-BR' ? '↻ Carregado' : '↻ Loaded')
    }
  } catch {}
}
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'XADREZ' : 'CHESS'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="board.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Xadrez simplificado. Jogue de brancas, capture o rei e salve a partida no navegador.' : 'Simplified chess. Play White, capture the king and save your game in this browser.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <div class="flex items-center justify-between text-xs">
        <span :class="turn === 'w' ? 'amber-phosphor' : 'text-ink-muted'">{{ locale.current === 'pt-BR' ? 'BRANCAS' : 'WHITE' }}</span>
        <div class="flex gap-1">
          <button class="arcade-btn-ghost border border-surface-600 text-[10px] px-2 py-0.5" @click="save">SAVE</button>
          <button class="arcade-btn-ghost border border-surface-600 text-[10px] px-2 py-0.5" @click="load">LOAD</button>
        </div>
        <span :class="turn === 'b' ? 'text-ink' : 'text-ink-muted'">{{ locale.current === 'pt-BR' ? 'PRETAS' : 'BLACK' }}</span>
      </div>
      <div class="grid grid-cols-8 gap-0 bg-void-deep border border-surface-600 mx-auto" style="max-width: 360px;">
        <template v-for="(row, r) in board" :key="`r-${r}`">
          <div
            v-for="(piece, c) in row"
            :key="`c-${r}-${c}`"
            class="aspect-square grid place-items-center cursor-pointer text-2xl"
            :class="[
              (r + c) % 2 === 0 ? 'bg-surface-700' : 'bg-void-deep',
              selected?.r === r && selected?.c === c ? 'ring-2 ring-amber' : '',
              validMoves.some((m) => m.r === r && m.c === c) ? 'ring-2 ring-cyan' : '',
            ]"
            @click="select(r, c)"
          >
            <span :class="piece?.color === 'w' ? 'text-amber' : 'text-ink'">{{ piece ? PIECE_GLYPH[piece.color + piece.type] : '' }}</span>
          </div>
        </template>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">{{ locale.isPt ? '★ VOCÊ VENCEU ★' : '★ YOU WIN ★' }}</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ DERROTADO ✕</p>
    </div>
  </CrtFrame>
</template>
