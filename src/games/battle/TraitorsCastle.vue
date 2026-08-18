<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 5, H = 5
const troops = ref<{ x: number; y: number; team: 'A' | 'B' }[]>([])
const turn = ref(0)
const selectedIdx = ref<number | null>(null)
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')

function start() {
  turn.value = 0
  selectedIdx.value = null
  status.value = 'playing'
  troops.value = [
    { x: 0, y: 4, team: 'A' }, { x: 1, y: 4, team: 'A' },
    { x: 0, y: 3, team: 'A' }, { x: 1, y: 3, team: 'A' },
    { x: 2, y: 0, team: 'B' }, { x: 2, y: 1, team: 'B' },
    { x: 3, y: 0, team: 'B' }, { x: 3, y: 1, team: 'B' },
  ]
  log.value = [locale.current === 'pt-BR' ? 'Vire o castelo (W=B) em 8 turnos.' : 'Take the castle (B) in 8 turns.']
}

function select(i: number) {
  if (status.value !== 'playing') return
  if (troops.value[i].team !== 'A') return
  selectedIdx.value = i
}

function moveTo(x: number, y: number) {
  if (selectedIdx.value === null) return
  if (status.value !== 'playing') return
  if (x < 0 || x >= W || y < 0 || y >= H) return
  // adjacent only
  const t = troops.value[selectedIdx.value]
  if (Math.abs(t.x - x) + Math.abs(t.y - y) !== 1) return
  // check if enemy there -> fight
  const enemyIdx = troops.value.findIndex((tt) => tt.x === x && tt.y === y)
  if (enemyIdx !== -1) {
    if (troops.value[enemyIdx].team === 'B') {
      // 50% win
      if (Math.random() < 0.6) {
        troops.value.splice(enemyIdx, 1)
        troops.value[selectedIdx.value].x = x
        troops.value[selectedIdx.value].y = y
        log.value.push(locale.current === 'pt-BR' ? `⚔ Vitória em (${x},${y})` : `⚔ Victory at (${x},${y})`)
        sfx.hit()
      } else {
        log.value.push(locale.current === 'pt-BR' ? `✕ Perdeu em (${x},${y})` : `✕ Lost at (${x},${y})`)
        sfx.error()
      }
    } else {
      return // friend
    }
  } else {
    troops.value[selectedIdx.value].x = x
    troops.value[selectedIdx.value].y = y
    sfx.tick()
  }
  selectedIdx.value = null
  turn.value++
  if (turn.value >= 8) {
    status.value = troops.value.some((t) => t.team === 'B') ? 'lost' : 'won'
    sfx[status.value === 'won' ? 'win' : 'lose']()
  } else if (!troops.value.some((t) => t.team === 'B')) {
    status.value = 'won'
    sfx.win()
  }
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'TRAITOR\'S CASTLE' : 'TRAITOR\'S CASTLE'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="troops.length === 0" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Tome o castelo em 8 turnos. Verde = você, Vermelho = inimigo.' : 'Take the castle in 8 turns. Green = you, Red = enemy.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <p class="text-xs text-ink-muted">TURN <span class="text-amber">{{ turn }}</span>/8</p>
      <div class="grid gap-0.5 bg-void-deep p-1 border border-surface-600" :style="{ gridTemplateColumns: `repeat(${W}, 1fr)`, aspectRatio: '1' }">
        <template v-for="y in H" :key="`r-${y}`">
          <div
            v-for="x in W"
            :key="`c-${y}-${x}`"
            class="aspect-square border border-surface-700 grid place-items-center text-sm cursor-pointer hover:border-cyan"
            :class="selectedIdx !== null && troops[selectedIdx]?.x === x - 1 && troops[selectedIdx]?.y === y - 1 ? 'border-amber' : ''"
            @click="moveTo(x - 1, y - 1)"
          >
            <span
              v-if="troops.some((t) => t.x === x - 1 && t.y === y - 1 && t.team === 'A')"
              class="phosphor text-shadow-neon font-bold"
            >W</span>
            <span
              v-else-if="troops.some((t) => t.x === x - 1 && t.y === y - 1 && t.team === 'B')"
              class="danger-phosphor text-shadow-neon font-bold"
            >B</span>
          </div>
        </template>
      </div>
      <p class="text-cyan text-xs">Selecione W primeiro, depois clique no destino.</p>
      <div class="grid grid-cols-4 gap-1">
        <button
          v-for="(t, i) in troops.filter((tt) => tt.team === 'A')"
          :key="i"
          class="arcade-btn-ghost border border-surface-600 text-[10px] py-1"
          :class="selectedIdx === troops.indexOf(t) ? 'border-amber' : ''"
          @click="select(troops.indexOf(t))"
        >W{{ i + 1 }}</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ CASTLE TAKEN ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ DEFEATED ✕</p>
    </div>
  </CrtFrame>
</template>
