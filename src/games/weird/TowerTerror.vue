<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const room = ref(0)
const floor = ref(0)
const time = ref(21 * 60)
const pulse = ref(50)
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')

const NASTIES = ['skeleton', 'ghost', 'headless axeman']

function start() {
  room.value = 0
  floor.value = 0
  time.value = 21 * 60
  pulse.value = 50
  log.value = [locale.current === 'pt-BR' ? 'Suba os andares antes da meia-noite.' : 'Climb the floors before midnight.']
  status.value = 'playing'
}

function go() {
  if (status.value !== 'playing') return
  room.value++
  if (room.value > 4) {
    floor.value++
    room.value = 0
  }
  advanceClock()
  if (status.value !== 'playing') return
  if (Math.random() < 0.6) {
    const nasty = NASTIES[Math.floor(Math.random() * NASTIES.length)]
    pulse.value += 10 + Math.floor(Math.random() * 20)
    log.value.push(`▶ ${nasty}! +pulse`)
    sfx.error()
  } else {
    pulse.value = Math.max(40, pulse.value - 2)
  }
  if (pulse.value >= 150) {
    log.value.push(locale.current === 'pt-BR' ? '✕ Você enlouqueceu e saltou.' : '✕ You went mad.')
    status.value = 'lost'
    sfx.lose()
  } else if (floor.value >= 6) {
    log.value.push(locale.current === 'pt-BR' ? '★ Tesouros! Pulso: ' + pulse.value : '★ Treasure! Pulse: ' + pulse.value)
    status.value = 'won'
    sfx.win()
  }
}

function advanceClock() {
  time.value += 1 + Math.floor(Math.random() * 3)
  if (time.value >= 24 * 60) {
    log.value.push(locale.current === 'pt-BR' ? '✕ Meia-noite.' : '✕ Midnight.')
    status.value = 'lost'
    sfx.lose()
  }
}

function retreat() {
  if (status.value !== 'playing') return
  pulse.value = Math.max(40, pulse.value - 5)
  if (room.value === 0 && floor.value > 0) {
    floor.value--
    room.value = 4
  } else {
    room.value = Math.max(0, room.value - 1)
  }
  advanceClock()
  sfx.tick()
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'g' || e.key === 'G') go()
  if (e.key === 'r' || e.key === 'R') retreat()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :status="status"
    title="TOWER OF TERROR"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="floor === 0 && room === 0 && log.length === 1" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-2">{{ log[0] }}</p>
      <p class="text-cyan text-xs mb-4">
        {{ locale.current === 'pt-BR' ? 'G = avançar (pode dar susto). R = recuar (calma).' : 'G = advance (may shock). R = retreat (calm).' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="go">▶ G</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <div class="grid grid-cols-3 gap-2 text-xs">
        <div class="border border-surface-600 bg-surface-800 p-2 text-center">
          <div class="text-ink-dim text-[9px]">FLOOR</div>
          <div class="cyan-phosphor">{{ floor }}/6</div>
        </div>
        <div class="border border-surface-600 bg-surface-800 p-2 text-center">
          <div class="text-ink-dim text-[9px]">TIME</div>
          <div :class="time >= 23 * 60 ? 'danger-phosphor' : 'amber-phosphor'">{{ Math.floor(time / 60) % 24 }}:{{ String(time % 60).padStart(2, '0') }}</div>
        </div>
        <div class="border border-surface-600 bg-surface-800 p-2 text-center">
          <div class="text-ink-dim text-[9px]">PULSE</div>
          <div :class="pulse > 100 ? 'danger-phosphor' : 'text-amber'">{{ pulse }}</div>
        </div>
      </div>
      <div class="border border-surface-600 bg-surface-800 p-2 h-32 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <div v-if="status === 'playing'" class="grid grid-cols-2 gap-1">
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1.5" @click="retreat">R Retreat</button>
        <button class="arcade-btn arcade-btn-amber" @click="go">G Go</button>
      </div>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ TREASURE ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center">✕ DOOMED ✕</p>
    </div>
  </CrtFrame>
</template>
