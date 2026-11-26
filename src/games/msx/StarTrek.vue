<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import GameLog from '../../components/GameLog.vue'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 8
const SHIP = { x: 3, y: 3 }
const energy = ref(1000)
const shields = ref(0)
const klingons = ref<{ x: number; y: number; hp: number }[]>([])
const stars = ref<{ x: number; y: number }[]>([])
const bases = ref<{ x: number; y: number }[]>([])
const log = ref<string[]>([])
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')
const score = ref(0)
const timeLeft = ref(30)
let timer: number | null = null

function start() {
  energy.value = 1000
  shields.value = 0
  score.value = 0
  timeLeft.value = 30
  status.value = 'playing'
  klingons.value = []
  stars.value = []
  bases.value = []
  const cells = Array.from({ length: W * W }, (_, i) => ({ x: i % W, y: Math.floor(i / W) }))
    .filter(({ x, y }) => x !== SHIP.x || y !== SHIP.y)
  for (let i = 0; i < 5; i++) {
    const [position] = cells.splice(Math.floor(Math.random() * cells.length), 1)
    klingons.value.push({ ...position, hp: 30 })
  }
  for (let i = 0; i < 15; i++) {
    stars.value.push({ x: Math.floor(Math.random() * W), y: Math.floor(Math.random() * 8) })
  }
  bases.value.push({ x: 0, y: 7 })
  log.value = [locale.current === 'pt-BR' ? `▶ ${klingons.value.length} Klingons detectados!` : `▶ ${klingons.value.length} Klingons detected!`]
  if (timer) clearInterval(timer)
  timer = window.setInterval(() => {
    timeLeft.value--
    energy.value = Math.max(0, energy.value - 1)
    if (timeLeft.value <= 0 || energy.value <= 0) {
      status.value = 'lost'
      sfx.lose()
      if (timer) clearInterval(timer)
    }
  }, 1000)
}

type Direction = 'fwd' | 'aft' | 'port' | 'stbd'

function bearing(x: number, y: number): Direction {
  const dx = x - SHIP.x
  const dy = y - SHIP.y
  if (Math.abs(dy) >= Math.abs(dx)) return dy < 0 ? 'fwd' : 'aft'
  return dx < 0 ? 'port' : 'stbd'
}

function fire(dir: Direction, torpedo: boolean) {
  if (status.value !== 'playing') return
  const cost = torpedo ? 30 : 50
  if (energy.value < cost) { sfx.error(); return }
  energy.value -= cost
  sfx.shoot()
  const targets = klingons.value.filter(k => bearing(k.x, k.y) === dir)
    .sort((a, b) => Math.hypot(a.x - SHIP.x, a.y - SHIP.y) - Math.hypot(b.x - SHIP.x, b.y - SHIP.y))
  const hits = torpedo ? targets.slice(0, 1) : targets
  log.value.push(`${torpedo ? 'Torpedo' : 'Phaser'} ${dir}: ${hits.length}`)
  for (const enemy of hits) {
    enemy.hp -= torpedo ? 50 : 25
    if (enemy.hp <= 0) {
      score.value += torpedo ? 100 : 50
      sfx.explode()
    }
  }
  klingons.value = klingons.value.filter(enemy => enemy.hp > 0)
  if (klingons.value.length === 0) {
    status.value = 'won'
    if (timer) clearInterval(timer)
    sfx.win()
  }
}

function shield() {
  if (status.value !== 'playing') return
  if (energy.value < 20) { sfx.error(); return }
  energy.value -= 20
  shields.value = 200
  sfx.tick()
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === '1') fire('fwd', false)
  if (e.key === '2') fire('aft', false)
  if (e.key === '3') fire('port', false)
  if (e.key === '4') fire('stbd', false)
  if (e.key === 'q') fire('fwd', true)
  if (e.key === 'w') fire('aft', true)
  if (e.key === 'e') fire('port', true)
  if (e.key === 'r') fire('stbd', true)
  if (e.key === 's') shield()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (timer) clearInterval(timer)
})

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :score="score"
    :status="status"
    title="STAR TREK"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-2">
        {{ locale.current === 'pt-BR' ? '1-4: Phasers (F/A/P/S). QWER: Torpedos. S: Escudos. Destrua os Klingons!' : '1-4: Phasers (F/A/P/S). QWER: Torpedoes. S: Shields. Destroy Klingons!' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="font-mono space-y-2">
      <p class="text-xs flex items-center justify-between">
        <span :class="energy < 200 ? 'danger-phosphor' : 'text-amber'">E {{ energy }}</span>
        <span class="text-cyan">⏱ {{ timeLeft }}s</span>
        <span class="text-amber">S {{ shields }}</span>
      </p>
      <div class="grid gap-0.5 bg-void-deep p-1 border border-surface-600" :style="{ gridTemplateColumns: `repeat(${W}, 1fr)` }">
        <template v-for="y in 8" :key="`r-${y}`">
          <div
            v-for="x in W"
            :key="`c-${y}-${x}`"
            class="aspect-square border border-surface-700 grid place-items-center text-[10px]"
          >
            <span v-if="x - 1 === SHIP.x && y - 1 === SHIP.y" class="phosphor font-bold">E</span>
            <span v-else-if="klingons.some((k) => k.x === x - 1 && k.y === y - 1)" class="danger-phosphor">K</span>
            <span v-else-if="bases.some((b) => b.x === x - 1 && b.y === y - 1)" class="amber-phosphor">B</span>
            <span v-else-if="stars.some((s) => s.x === x - 1 && s.y === y - 1)" class="text-ink-dim">·</span>
          </div>
        </template>
      </div>
      <GameLog :entries="log" class="border border-surface-600 bg-surface-800 p-2 h-20 text-xs space-y-0.5" />
      <div class="grid grid-cols-4 gap-1">
        <button class="arcade-btn-cyan text-[10px] py-1" @click="fire('fwd', false)">1 F</button>
        <button class="arcade-btn-cyan text-[10px] py-1" @click="fire('aft', false)">2 A</button>
        <button class="arcade-btn-cyan text-[10px] py-1" @click="fire('port', false)">3 P</button>
        <button class="arcade-btn-cyan text-[10px] py-1" @click="fire('stbd', false)">4 S</button>
        <button class="arcade-btn-magenta text-[10px] py-1" @click="fire('fwd', true)">Q T</button>
        <button class="arcade-btn-magenta text-[10px] py-1" @click="fire('aft', true)">W T</button>
        <button class="arcade-btn-magenta text-[10px] py-1" @click="fire('port', true)">E T</button>
        <button class="arcade-btn-magenta text-[10px] py-1" @click="fire('stbd', true)">R T</button>
      </div>
      <button class="arcade-btn w-full" @click="shield">⌬ SHIELDS</button>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ GALAXY SAVED ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ DESTROYED ✕</p>
    </div>
  </CrtFrame>
</template>
