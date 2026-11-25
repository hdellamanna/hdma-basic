<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const GRID = [
  'DDDDDDDDDD',
  'D........D',
  'D..D.DD..D',
  'D........D',
  'DD.D.DD.DD',
  'D........D',
  'D..D.D...D',
  'D........D',
  'D.DD.DD..D',
  'DDDDDDDDDD',
]
const W = 10, H = 10
const player = ref({ x: 1, y: 1 })
const hunter = ref({ x: 8, y: 8 })
const people = ref<{ x: number; y: number; eaten: boolean }[]>([])
const score = ref(0)
const moves = ref(0)
const status = ref<'playing' | 'won' | 'lost'>('playing')
let keys = ['a', 'z', 'n', 'm'] // up, left, down, right

function start() {
  player.value = { x: 1, y: 1 }
  hunter.value = { x: 8, y: 8 }
  score.value = 0
  moves.value = 0
  people.value = []
  const water = GRID.flatMap((row, y) => Array.from(row, (tile, x) => ({ tile, x, y })))
    .filter(({ tile, x, y }) => tile === '.'
      && (x !== player.value.x || y !== player.value.y)
      && (x !== hunter.value.x || y !== hunter.value.y))
  for (let i = 0; i < 5; i++) {
    const [{ x, y }] = water.splice(Math.floor(Math.random() * water.length), 1)
    people.value.push({ x, y, eaten: false })
  }
  shuffleKeys()
  status.value = 'playing'
}

function shuffleKeys() {
  const arr = ['a', 'z', 'n', 'm']
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  keys = arr
}

const keyDirs = {
  a: { dx: 0, dy: -1, name: 'a' },
  z: { dx: -1, dy: 0, name: 'z' },
  n: { dx: 0, dy: 1, name: 'n' },
  m: { dx: 1, dy: 0, name: 'm' },
}

function move(dir: keyof typeof keyDirs) {
  if (status.value !== 'playing') return
  const d = keyDirs[dir]
  const nx = player.value.x + d.dx
  const ny = player.value.y + d.dy
  if (nx < 1 || nx > W - 2 || ny < 1 || ny > H - 2) return
  if (GRID[ny][nx] === 'D') return
  player.value = { x: nx, y: ny }
  moves.value++
  // Eat person
  const person = people.value.find((p) => p.x === nx && p.y === ny && !p.eaten)
  if (person) {
    person.eaten = true
    score.value++
    sfx.coin()
    shuffleKeys()
  }
  // Move hunter
  if (Math.random() < 0.5) {
    const hdx = Math.sign(player.value.x - hunter.value.x)
    const hdy = Math.sign(player.value.y - hunter.value.y)
    if (Math.random() < 0.5 && hdx !== 0) {
      const hx = hunter.value.x + hdx
      if (GRID[hunter.value.y][hx] !== 'D') hunter.value.x = hx
    } else if (hdy !== 0) {
      const hy = hunter.value.y + hdy
      if (GRID[hy][hunter.value.x] !== 'D') hunter.value.y = hy
    }
  }
  if (hunter.value.x === player.value.x && hunter.value.y === player.value.y) {
    status.value = 'lost'
    sfx.lose()
  } else if (people.value.every((p) => p.eaten)) {
    status.value = 'won'
    sfx.win()
  }
}

function onKey(e: KeyboardEvent) {
  const k = e.key.toLowerCase()
  if (k in keyDirs) move(k as keyof typeof keyDirs)
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="score"
    :status="status"
    :title="locale.current === 'pt-BR' ? 'JAWS' : 'JAWS'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="people.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-2">
        {{ locale.current === 'pt-BR' ? 'Você é a tubarão (J). Mova com A/Z/N/M (você sabe o que cada tecla faz… por enquanto).' : 'You are the shark (J). Move with A/Z/N/M (you know what each key does… for now).' }}
      </p>
      <p class="text-cyan text-xs mb-4">Cada pessoa comida embaralha os controles!</p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <p class="text-xs flex items-center justify-between">
        <span class="text-cyan">EATEN <span class="text-amber">{{ score }}</span>/5</span>
        <span class="text-ink-dim">{{ keys[0] }} {{ keys[1] }} {{ keys[2] }} {{ keys[3] }}</span>
      </p>
      <div class="grid gap-0.5 bg-void-deep p-1 border border-surface-600" :style="{ gridTemplateColumns: `repeat(${W}, 1fr)` }">
        <template v-for="(row, y) in GRID" :key="`r-${y}`">
          <div
            v-for="(cell, x) in row"
            :key="`c-${y}-${x}`"
            class="aspect-square border border-surface-700 grid place-items-center text-xs"
          >
            <span v-if="player.x === x && player.y === y" class="phosphor font-bold">J</span>
            <span v-else-if="hunter.x === x && hunter.y === y" class="danger-phosphor font-bold">H</span>
            <span v-else-if="cell === 'D'" class="text-ink-dim">#</span>
            <span v-else-if="people.some((p) => p.x === x && p.y === y && !p.eaten)" class="amber-phosphor">P</span>
          </div>
        </template>
      </div>
      <p class="text-ink-dim text-xs">Cada pessoa comida embaralha os controles!</p>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ FULL BELLY ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ CAUGHT ✕</p>
    </div>
  </CrtFrame>
</template>
