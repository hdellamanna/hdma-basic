<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 12, H = 9
const player = ref({ x: 0, y: 4 })
const hasKey = ref(false)
const turns = ref(0)
const maxTurns = 30
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')

// 0 = floor, 1 = wall, 2 = key, 3 = door, 4 = exit
const map = ref([
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
])
// place key and door + exit
const keyPos = { x: 8, y: 1 }
const doorPos = { x: 5, y: 4 }
const exitPos = { x: 10, y: 7 }

function start() {
  player.value = { x: 0, y: 4 }
  hasKey.value = false
  turns.value = 0
  status.value = 'playing'
}

function move(dx: number, dy: number) {
  if (status.value !== 'playing') return
  const nx = player.value.x + dx
  const ny = player.value.y + dy
  if (nx < 0 || nx >= W || ny < 0 || ny >= H) return
  const tile = map.value[ny][nx]
  if (tile === 1) return
  if (tile === 3 && !hasKey.value) return
  player.value = { x: nx, y: ny }
  turns.value++
  sfx.tick()
  if (nx === keyPos.x && ny === keyPos.y) {
    hasKey.value = true
    sfx.coin()
    map.value[ny][nx] = 0
  }
  if (tile === 3) {
    map.value[ny][nx] = 0
    sfx.powerup()
  }
  if (nx === exitPos.x && ny === exitPos.y) {
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
    :status="status"
    :title="locale.current === 'pt-BR' ? 'ESCAPE!' : 'ESCAPE!'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Pegue a chave, abra a porta, chegue à saída em 30 turnos.' : 'Get the key, open the door, reach the exit in 30 turns.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <p class="text-xs flex items-center justify-between">
        <span :class="hasKey ? 'amber-phosphor' : 'text-ink-muted'">🔑 {{ hasKey ? 'KEY ✓' : '—' }}</span>
        <span :class="turns > 22 ? 'danger-phosphor' : 'text-cyan'">TURN {{ turns }}/{{ maxTurns }}</span>
      </p>
      <div class="grid gap-0.5 bg-void-deep p-1 border border-surface-600" :style="{ gridTemplateColumns: `repeat(${W}, 1fr)`, aspectRatio: '1.3' }">
        <template v-for="(row, y) in map" :key="`r-${y}`">
          <div
            v-for="(tile, x) in row"
            :key="`c-${y}-${x}`"
            class="aspect-square border border-surface-700 grid place-items-center text-xs"
            :class="player.x === x && player.y === y ? 'border-amber' : ''"
          >
            <span v-if="player.x === x && player.y === y" class="phosphor text-shadow-neon font-bold">P</span>
            <span v-else-if="tile === 1" class="text-ink-dim">#</span>
            <span v-else-if="x === keyPos.x && y === keyPos.y && !hasKey" class="amber-phosphor">K</span>
            <span v-else-if="x === doorPos.x && y === doorPos.y && tile === 3" class="cyan-phosphor">D</span>
            <span v-else-if="x === exitPos.x && y === exitPos.y" class="phosphor">▶</span>
          </div>
        </template>
      </div>
      <div class="grid grid-cols-3 gap-1 sm:hidden">
        <div></div>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(0, -1)">↑</button>
        <div></div>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(-1, 0)">←</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(0, 1)">↓</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(1, 0)">→</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ ESCAPED ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ CAUGHT ✕</p>
    </div>
  </CrtFrame>
</template>
