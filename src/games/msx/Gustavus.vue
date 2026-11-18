<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import { useRoundTimer } from '../../composables/useRoundTimer'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const SIZE = 5 // 5x5 grid of dots = 4x4 boxes
const horiz = ref<boolean[][]>([])
const vert = ref<boolean[][]>([])
const boxes = ref<string[][]>([])
const turn = ref<'P' | 'A'>('P')
const scores = ref({ P: 0, A: 0 })
const status = ref<'playing' | 'won' | 'lost'>('playing')
const { schedule, cancel } = useRoundTimer()

function start() {
  cancel()
  horiz.value = Array(SIZE).fill(null).map(() => Array(SIZE - 1).fill(false))
  vert.value = Array(SIZE - 1).fill(null).map(() => Array(SIZE).fill(false))
  boxes.value = Array(SIZE - 1).fill(null).map(() => Array(SIZE - 1).fill(null))
  scores.value = { P: 0, A: 0 }
  turn.value = 'P'
  status.value = 'playing'
  sfx.start()
}

function getBox(r: number, c: number) {
  // returns 'P' or 'A' if completed, null if not
  if (r < 0 || r >= SIZE - 1 || c < 0 || c >= SIZE - 1) return null
  if (boxes.value[r][c]) return boxes.value[r][c]
  return null
}

function placeH(r: number, c: number) {
  if (status.value !== 'playing') return
  if (horiz.value[r][c]) return
  if (turn.value !== 'P') return
  horiz.value[r][c] = true
  sfx.tick()
  if (!finish() && status.value === 'playing') {
    turn.value = 'A'
    schedule(aiMove, 300)
  }
}

function placeV(r: number, c: number) {
  if (status.value !== 'playing') return
  if (vert.value[r][c]) return
  if (turn.value !== 'P') return
  vert.value[r][c] = true
  sfx.tick()
  if (!finish() && status.value === 'playing') {
    turn.value = 'A'
    schedule(aiMove, 300)
  }
}

function finish() {
  let made = false
  for (let r = 0; r < SIZE - 1; r++) {
    for (let c = 0; c < SIZE - 1; c++) {
      if (!boxes.value[r][c] && horiz.value[r][c] && horiz.value[r + 1][c] && vert.value[r][c] && vert.value[r][c + 1]) {
        boxes.value[r][c] = turn.value
        scores.value[turn.value as keyof typeof scores.value]++
        made = true
        sfx.coin()
      }
    }
  }
  // Check game over
  const totalBoxes = (SIZE - 1) * (SIZE - 1)
  if (scores.value.P + scores.value.A >= totalBoxes) {
    status.value = scores.value.P > scores.value.A ? 'won' : 'lost'
    if (status.value === 'won') sfx.win(); else sfx.lose()
  }
  return made
}

function aiMove() {
  if (status.value !== 'playing' || turn.value !== 'A') return
  const options: { r: number; c: number; dir: 'h' | 'v' }[] = []
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE - 1; c++) {
      if (!horiz.value[r][c]) options.push({ r, c, dir: 'h' })
    }
  }
  for (let r = 0; r < SIZE - 1; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!vert.value[r][c]) options.push({ r, c, dir: 'v' })
    }
  }
  if (options.length === 0) return
  function wouldCloseBox(r: number, c: number) {
    if (r < 0 || r >= SIZE - 1 || c < 0 || c >= SIZE - 1 || boxes.value[r][c]) return false
    return [
      horiz.value[r][c], horiz.value[r + 1][c],
      vert.value[r][c], vert.value[r][c + 1],
    ].filter(Boolean).length === 3
  }
  const scoring = options.filter(({ dir, r, c }) => {
    const adjacent = dir === 'h' ? [r - 1, c] : [r, c - 1]
    return wouldCloseBox(r, c) || wouldCloseBox(adjacent[0], adjacent[1])
  })
  const choices = scoring.length ? scoring : options
  const choice = choices[Math.floor(Math.random() * choices.length)]
  if (choice.dir === 'h') horiz.value[choice.r][choice.c] = true
  else vert.value[choice.r][choice.c] = true
  const made = finish()
  if (status.value !== 'playing') return
  if (made) schedule(aiMove, 300)
  else turn.value = 'P'
}

function onQuit() { router.push('/') }

const totalBoxes = (SIZE - 1) * (SIZE - 1)
</script>

<template>
  <CrtFrame
    :status="status"
    title="GUSTAVUS"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="horiz.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Dots and boxes. Conecte sem fechar quadrados. Você é P, AI é A.' : 'Dots and boxes. Connect without closing boxes. You are P, AI is A.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <p class="text-xs flex items-center justify-between">
        <span class="cyan-phosphor">P <span class="text-amber">{{ scores.P }}</span></span>
        <span class="text-ink-muted">/ {{ totalBoxes }}</span>
        <span class="magenta-phosphor">A <span class="text-amber">{{ scores.A }}</span></span>
      </p>
      <div class="relative bg-void-deep border border-surface-600 mx-auto p-2" style="max-width: 360px;">
        <svg viewBox="0 0 200 200" class="w-full h-auto">
          <!-- Dots -->
          <g fill="#39ff14">
            <template v-for="r in SIZE" :key="`dr-${r}`">
              <circle
                v-for="c in SIZE"
                :key="`d-${r}-${c}`"
                :cx="20 + (c - 1) * 40"
                :cy="20 + (r - 1) * 40"
                r="2"
              />
            </template>
          </g>
          <!-- Boxes -->
          <template v-for="(row, r) in boxes" :key="`br-${r}`">
            <g v-for="(owner, c) in row" :key="`b-${r}-${c}`">
              <rect
                v-if="owner"
                :x="20 + c * 40"
                :y="20 + r * 40"
                width="40"
                height="40"
                :fill="owner === 'P' ? '#00f0ff' : '#ff00ff'"
                opacity="0.4"
              />
              <text
                v-if="owner"
                :x="40 + c * 40"
                :y="45 + r * 40"
                text-anchor="middle"
                :fill="owner === 'P' ? '#00f0ff' : '#ff00ff'"
                font-family="monospace"
                font-size="14"
                font-weight="bold"
              >{{ owner }}</text>
            </g>
          </template>
          <!-- Horizontal lines (clickable) -->
          <g v-for="(row, r) in horiz" :key="`hr-${r}`">
            <rect
              v-for="(used, c) in row"
              :key="`h-${r}-${c}`"
              :x="20 + c * 40 + 4"
              :y="20 + r * 40 - 2"
              width="32"
              height="4"
              :fill="used ? '#ffb000' : 'transparent'"
              class="cursor-pointer hover:fill-amber/30"
              @click="placeH(r, c)"
            />
          </g>
          <!-- Vertical lines (clickable) -->
          <g v-for="(row, r) in vert" :key="`vr-${r}`">
            <rect
              v-for="(used, c) in row"
              :key="`v-${r}-${c}`"
              :x="20 + c * 40 - 2"
              :y="20 + r * 40 + 4"
              width="4"
              height="32"
              :fill="used ? '#ffb000' : 'transparent'"
              class="cursor-pointer hover:fill-amber/30"
              @click="placeV(r, c)"
            />
          </g>
        </svg>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ VENCEU ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ PERDEU ✕</p>
    </div>
  </CrtFrame>
</template>
