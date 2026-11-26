<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import GameLog from '../../components/GameLog.vue'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const target = ref(0)
const drops = ref<{ col: number; landed: number }[]>([])
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')

function start() {
  target.value = 10 + Math.floor(Math.random() * 31)
  drops.value = []
  log.value = []
  status.value = 'playing'
  sfx.start()
}

function drop(col: number) {
  if (drops.value.length >= 5) return
  // Each column has random values 1-9, with cumulative
  let landed = 0
  for (let i = 0; i < drops.value.length; i++) {
    const v = 1 + Math.floor(Math.random() * 9)
    if (drops.value[i].col === col) {
      landed += v
    } else {
      landed += Math.floor(v / 2)
    }
  }
  // The current skull
  const v = 1 + Math.floor(Math.random() * 9)
  landed += v
  drops.value.push({ col, landed })
  sfx.hit()
  if (drops.value.length >= 5) {
    const total = drops.value.reduce((sum, d) => sum + d.landed, 0)
    if (total === target.value) {
      status.value = 'won'
      sfx.win()
    } else {
      status.value = 'lost'
      sfx.lose()
    }
    log.value.push(`TOTAL ${total} (target ${target.value})`)
  }
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    :title="locale.current === 'pt-BR' ? 'SKULLS DA PIRÂMIDE' : 'SKULLS OF THE PYRAMID'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="target === 0 && status === 'playing'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Use 5 caveiras para acertar exatamente o número alvo (10-40).' : 'Use 5 skulls to hit exactly the target number (10-40).' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-cyan text-lg">TARGET <span class="amber-phosphor text-shadow-neon font-display text-2xl">{{ target }}</span></p>
      <p class="text-xs text-ink-muted">DROPS: <span class="text-amber">{{ drops.length }}</span>/5</p>
      <div class="grid grid-cols-4 gap-1 h-40 bg-void-deep border border-surface-600 p-2">
        <div v-for="(_, col) in 4" :key="col" class="flex flex-col items-center justify-end gap-1">
          <span v-for="(d, i) in drops.filter((dd) => dd.col === col + 1)" :key="i" class="text-2xl">💀</span>
          <button
            v-if="drops.length < 5"
            class="arcade-btn-amber text-[10px] py-1 w-full"
            @click="drop(col + 1)"
          >{{ col + 1 }}</button>
        </div>
      </div>
      <GameLog :entries="log" class="border border-surface-600 bg-surface-800 p-2 h-16 text-xs space-y-0.5" />
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ EXACTLY ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ CURSE ✕</p>
    </div>
  </CrtFrame>
</template>
