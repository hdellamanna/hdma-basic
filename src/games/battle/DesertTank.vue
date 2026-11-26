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

const missiles = ref(5)
const hits = ref(0)
const targetDist = ref(0)
const targetAngle = ref(0)
const log = ref<string[]>([])
const dir = ref('')
const elev = ref('')
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')

function start() {
  missiles.value = 5
  hits.value = 0
  targetDist.value = 50 + Math.floor(Math.random() * 200)
  targetAngle.value = -60 + Math.floor(Math.random() * 120)
  log.value = []
  dir.value = ''
  elev.value = ''
  status.value = 'playing'
}

function fire() {
  if (status.value !== 'playing' || missiles.value <= 0) return
  const d = parseFloat(dir.value)
  const e = parseFloat(elev.value)
  if (isNaN(d) || isNaN(e)) return
  missiles.value--
  sfx.shoot()
  // simple ballistic: distance = e * 3, angle d
  const dist = e * 3
  const ang = d
  const dDist = Math.abs(dist - targetDist.value)
  const dAng = Math.abs(ang - targetAngle.value)
  if (dDist < 15 && dAng < 10) {
    hits.value++
    log.value.push(`▶ ${d}°/${e}° → ★ HIT!`)
    sfx.explode()
  } else {
    log.value.push(`▶ ${d}°/${e}° → miss (Δd=${dDist.toFixed(0)}, Δa=${dAng.toFixed(0)})`)
    sfx.error()
  }
  if (hits.value >= 3) {
    status.value = 'won'
    sfx.win()
    return
  }
  if (missiles.value <= 0) {
    status.value = hits.value >= 3 ? 'won' : 'lost'
    if (status.value === 'lost') sfx.lose()
  } else {
    // new target
    targetDist.value = 50 + Math.floor(Math.random() * 200)
    targetAngle.value = -60 + Math.floor(Math.random() * 120)
  }
  dir.value = ''
  elev.value = ''
}

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="hits * 100"
    :status="status"
    :title="locale.current === 'pt-BR' ? 'DESERT TANK' : 'DESERT TANK BATTLE'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? '5 mísseis. Acerte a fortaleza 3 vezes. Direção (-90/+90), Elevação (0/90). Cada grau de elevação alcança 3 m.' : '5 missiles. Hit the fortress 3 times. Direction (-90/+90), Elevation (0/90). Each degree of elevation reaches 3 m.' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-xs flex items-center justify-between">
        <span class="text-cyan">MISSILES <span class="text-amber">{{ missiles }}</span></span>
        <span class="text-amber">HITS <span class="text-amber">{{ hits }}</span>/3</span>
      </p>
      <p v-if="status === 'playing'" class="text-xs text-cyan">{{ locale.current === 'pt-BR' ? 'Alvo' : 'Target' }}: {{ targetAngle }}° · {{ targetDist }} m</p>
      <GameLog :entries="log" class="border border-surface-600 bg-surface-800 p-2 h-24 text-xs space-y-0.5" />
      <form v-if="status === 'playing'" class="space-y-1" @submit.prevent="fire">
        <div class="flex items-center gap-2">
          <span class="text-cyan text-xs w-20">DIR:</span>
          <input v-model="dir" :aria-label="locale.isPt ? 'DIR · Direção de tiro em graus' : 'DIR · Firing direction in degrees'" type="number" min="-90" max="90" class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber outline-none focus:border-phosphor-green" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-cyan text-xs w-20">ELEV:</span>
          <input v-model="elev" :aria-label="locale.isPt ? 'ELEV · Elevação em graus' : 'ELEV · Elevation in degrees'" type="number" min="0" max="90" class="flex-1 bg-void-deep border border-surface-600 px-2 py-1 text-amber outline-none focus:border-phosphor-green" />
        </div>
        <button class="arcade-btn arcade-btn-magenta w-full">🔥 FIRE</button>
      </form>
      <p v-else-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ FORTRESS DESTROYED ★</p>
      <p v-else class="danger-phosphor text-shadow-neon font-display text-center">✕ OUT OF MISSILES ✕</p>
    </div>
  </CrtFrame>
</template>
