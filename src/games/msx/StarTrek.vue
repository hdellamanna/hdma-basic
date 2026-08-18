<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocaleStore } from '../../stores/locale'
import { useAudio } from '../../composables/useAudio'
import CrtFrame from '../../components/CrtFrame.vue'

const router = useRouter()
const locale = useLocaleStore()
const { sfx } = useAudio()

const W = 8
const SHIP = { x: 3, y: 0 }
const energy = ref(1000)
const shields = ref(0)
const klingons = ref<{ x: number; y: number; hp: number }[]>([])
const stars = ref<{ x: number; y: number }[]>([])
const bases = ref<{ x: number; y: number }[]>([])
const log = ref<string[]>([])
const status = ref<'playing' | 'won' | 'lost'>('playing')
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
  for (let i = 0; i < 5; i++) {
    klingons.value.push({ x: Math.floor(Math.random() * W), y: 1 + Math.floor(Math.random() * 5), hp: 30 })
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
    if (klingons.value.length === 0) {
      status.value = 'won'
      sfx.win()
      if (timer) clearInterval(timer)
    }
  }, 1000)
}

function firePhaser(dir: 'fwd' | 'aft' | 'port' | 'stbd') {
  if (energy.value < 50) { sfx.error(); return }
  energy.value -= 50
  sfx.shoot()
  // Damage klingon in direction (simplified: any klingon in row 0-2)
  const dxMap: Record<string, number> = { fwd: 0, aft: 0, port: -1, stbd: 1 }
  const dyMap: Record<string, number> = { fwd: -1, aft: 1, port: 0, stbd: 0 }
  const tx = SHIP.x + dxMap[dir] * 3
  const ty = 0 + dyMap[dir] * 3
  let hit = false
  klingons.value.forEach((k) => {
    if (Math.abs(k.x - tx) < 2 && Math.abs(k.y - ty) < 2) {
      k.hp -= 25
      if (k.hp <= 0) {
        klingons.value = klingons.value.filter((kk) => kk !== k)
        score.value += 50
        sfx.explode()
        log.value.push(locale.current === 'pt-BR' ? `★ Klingon destruído!` : `★ Klingon destroyed!`)
      } else {
        hit = true
      }
    }
  })
  if (!hit) log.value.push(locale.current === 'pt-BR' ? `▶ Phaser ${dir} → miss` : `▶ Phaser ${dir} → miss`)
}

function fireTorpedo(dir: 'fwd' | 'aft' | 'port' | 'stbd') {
  if (energy.value < 30) { sfx.error(); return }
  energy.value -= 30
  sfx.shoot()
  const dxMap: Record<string, number> = { fwd: 0, aft: 0, port: -1, stbd: 1 }
  const dyMap: Record<string, number> = { fwd: -1, aft: 1, port: 0, stbd: 0 }
  const tx = SHIP.x + dxMap[dir] * 4
  const ty = 0 + dyMap[dir] * 4
  let hit = false
  klingons.value.forEach((k) => {
    if (Math.abs(k.x - tx) < 1 && Math.abs(k.y - ty) < 1) {
      k.hp -= 50
      if (k.hp <= 0) {
        klingons.value = klingons.value.filter((kk) => kk !== k)
        score.value += 100
        sfx.explode()
        log.value.push(locale.current === 'pt-BR' ? `★ Torpedo!` : `★ Torpedo!`)
        hit = true
      }
    }
  })
  if (!hit) log.value.push(locale.current === 'pt-BR' ? `▶ Torpedo ${dir} → miss` : `▶ Torpedo ${dir} → miss`)
}

function shield() {
  if (energy.value < 20) { sfx.error(); return }
  energy.value -= 20
  shields.value = 200
  sfx.tick()
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === '1') firePhaser('fwd')
  if (e.key === '2') firePhaser('aft')
  if (e.key === '3') firePhaser('port')
  if (e.key === '4') firePhaser('stbd')
  if (e.key === 'q') fireTorpedo('fwd')
  if (e.key === 'w') fireTorpedo('aft')
  if (e.key === 'e') fireTorpedo('port')
  if (e.key === 'r') fireTorpedo('stbd')
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
    <div v-if="klingons.length === 0 && status === 'playing'" class="text-center py-6">
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
            <span v-if="x === 4 && y === 1" class="phosphor font-bold">E</span>
            <span v-else-if="klingons.some((k) => k.x === x - 1 && k.y === y - 1)" class="danger-phosphor">K</span>
            <span v-else-if="bases.some((b) => b.x === x - 1 && b.y === y - 1)" class="amber-phosphor">B</span>
            <span v-else-if="stars.some((s) => s.x === x - 1 && s.y === y - 1)" class="text-ink-dim">·</span>
          </div>
        </template>
      </div>
      <div class="border border-surface-600 bg-surface-800 p-2 h-20 overflow-y-auto text-xs space-y-0.5">
        <p v-for="(m, i) in log" :key="i" :class="i === log.length - 1 ? 'text-amber' : 'text-ink-dim'">{{ m }}</p>
      </div>
      <div class="grid grid-cols-4 gap-1">
        <button class="arcade-btn-cyan text-[10px] py-1" @click="firePhaser('fwd')">1 F</button>
        <button class="arcade-btn-cyan text-[10px] py-1" @click="firePhaser('aft')">2 A</button>
        <button class="arcade-btn-cyan text-[10px] py-1" @click="firePhaser('port')">3 P</button>
        <button class="arcade-btn-cyan text-[10px] py-1" @click="firePhaser('stbd')">4 S</button>
        <button class="arcade-btn-magenta text-[10px] py-1" @click="fireTorpedo('fwd')">Q T</button>
        <button class="arcade-btn-magenta text-[10px] py-1" @click="fireTorpedo('aft')">W T</button>
        <button class="arcade-btn-magenta text-[10px] py-1" @click="fireTorpedo('port')">E T</button>
        <button class="arcade-btn-magenta text-[10px] py-1" @click="fireTorpedo('stbd')">R T</button>
      </div>
      <button class="arcade-btn w-full" @click="shield">⌬ SHIELDS</button>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ GALAXY SAVED ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ DESTROYED ✕</p>
    </div>
  </CrtFrame>
</template>
