<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import { useGameLoop } from '../../composables/useGameLoop'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 20
const H = 14
const playerX = ref(0)
const lightOn = ref(false)
const obstacles = ref<string[]>([])
const obstaclesLine = ref('')
const f = ref(0)  // 0=going right, 1=at right, 2=going back
const missions = ref(0)
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')

const OBSTACLES = [
  '== = = == == = = ==',
  '= ==== = = = =',
  '= = = = == =',
  '= = = a =',
  '= = = ',
  '= = ',
]

function start() {
  cycle.stop()
  cycleT = 0
  lightOn.value = false
  log.value = []
  playerX.value = 0
  f.value = 0
  missions.value = 0
  obstaclesLine.value = OBSTACLES[0]
  obstacles.value = OBSTACLES[0].padEnd(W).split('')
  status.value = 'playing'
  sfx.start()
  cycle.start()
}
let cycleT = 0

const log = ref<string[]>([])
const cycle = useGameLoop((dt) => {
  cycleT += dt
  if (cycleT >= 400) {
    cycleT -= 400
    lightOn.value = !lightOn.value
  }
  // Check capture
  const cell = obstacles.value[playerX.value] || ' '
  if (cell === ' ' && lightOn.value) {
    sfx.lose()
    log.value.push(locale.current === 'pt-BR' ? 'Você foi visto!' : 'You were seen!')
    status.value = 'lost'
    cycle.stop()
  }
})

function move(d: number) {
  if (status.value !== 'playing') return
  const nx = playerX.value + d
  if (nx < 0 || nx >= W) return
  if (f.value === 0 && nx === W - 1) f.value = 1
  else if (f.value === 1 && nx === 0) f.value = 2
  playerX.value = nx
  sfx.tick()
  if (f.value === 2) {
    // completed
    missions.value++
    log.value.push(locale.current === 'pt-BR' ? `✓ Missão ${missions.value}` : `✓ Mission ${missions.value}`)
    sfx.coin()
    if (missions.value >= 8) {
      status.value = 'won'
      cycle.stop()
      sfx.win()
      return
    }
    f.value = 0
    const nextLine = OBSTACLES[missions.value % OBSTACLES.length]
    obstaclesLine.value = nextLine
    obstacles.value = nextLine.padEnd(W).split('')
  }
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowLeft') move(-1)
  if (e.key === 'm' || e.key === 'M' || e.key === 'ArrowRight') move(1)
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="missions"
    :status="status"
    title="HOLOFOTE"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'N/M = esquerda/direita. Atravesse ida e volta. Cuidado com o holofote.' : 'N/M = left/right. Cross there and back. Watch the spotlight.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <p class="text-xs text-cyan">MISSÕES <span class="text-amber">{{ missions }}</span>/8 · <span :class="lightOn ? 'danger-phosphor' : 'text-ink-dim'">LUZ {{ lightOn ? 'ON' : 'OFF' }}</span></p>
      <div class="relative bg-void-deep border border-surface-600 overflow-hidden" :style="{ aspectRatio: '20/14', maxWidth: '400px' }">
        <div class="absolute inset-0">
          <div
            v-for="(c, i) in obstacles"
            :key="i"
            class="absolute top-0 bottom-0 grid place-items-center text-surface-500 text-2xl"
            :style="{ left: `${(i / W) * 100}%`, width: `${100 / W}%` }"
          >{{ c === '=' ? '▓' : '' }}</div>
        </div>
        <!-- Spotlight beam -->
        <div
          v-if="lightOn"
          class="absolute top-0 bottom-0 bg-amber/10"
          :style="{ left: `${(playerX / W) * 100}%`, width: `${100 / W}%` }"
        ></div>
        <div
          class="absolute bottom-2 amber-phosphor text-shadow-neon font-display text-xl"
          :style="{ left: `${(playerX / W) * 100 + (100 / W) / 2}%`, transform: 'translateX(-50%)' }"
        >☻</div>
      </div>
      <div class="grid grid-cols-2 gap-1 sm:hidden">
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(-1)">N ◀</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(1)">▶ M</button>
      </div>
      <div class="border border-surface-600 bg-surface-800 p-2 h-12 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log.slice(-3)" :key="i" :class="i === log.slice(-3).length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ AGENTE MESTRE ★</p>
    </div>
  </CrtFrame>
</template>
