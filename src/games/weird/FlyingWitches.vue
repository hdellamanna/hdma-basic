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

const INGREDIENTS = computed(() => {
  const r = locale.current
  return [
    { name: 'TOES OF NEWT', letter: 'T' },
    { name: 'EYES OF LIZARDS', letter: 'E' },
    { name: 'BRAINS OF BATS', letter: 'B' },
    { name: 'ROOTS OF IVY', letter: 'R' },
  ]
})

const witch = ref({ x: 5, y: 0 })
const ingredients = ref<{ x: number; y: number; letter: string; isSnatcher: boolean }[]>([])
const collected = ref<string[]>([])
const brooms = ref(3)
const log = ref<string[]>([])
const status = ref<'intro' | 'playing' | 'won' | 'lost'>('intro')

let lastSpawn = 0
let frame: number | null = null

function start() {
  if (frame !== null) cancelAnimationFrame(frame)
  witch.value = { x: 5, y: 0 }
  ingredients.value = []
  collected.value = []
  brooms.value = 3
  log.value = [locale.current === 'pt-BR' ? 'Ingredientes:' : 'Ingredients:']
  status.value = 'playing'
  INGREDIENTS.value.forEach((ing) => log.value.push(`- ${ing.letter} ${ing.name}`))
  frame = requestAnimationFrame(loop)
}

function loop() {
  if (status.value !== 'playing') return
  const now = performance.now()
  if (now - lastSpawn > 1500) {
    lastSpawn = now
    const ing = INGREDIENTS.value[Math.floor(Math.random() * INGREDIENTS.value.length)]
    ingredients.value.push({
      x: 0,
      y: Math.floor(Math.random() * 5),
      letter: ing.letter,
      isSnatcher: Math.random() < 0.25,
    })
  }
  ingredients.value.forEach((i) => (i.x += 0.3))
  ingredients.value = ingredients.value.filter((i) => i.x < 10)
  // Check pickup
  ingredients.value = ingredients.value.filter((i) => {
    if (Math.abs(i.x - witch.value.x) < 1 && Math.abs(i.y - witch.value.y) < 1) {
      if (i.isSnatcher) {
        brooms.value--
        log.value.push(`✕ SNATCHER! brooms ${brooms.value}`)
        sfx.lose()
        if (brooms.value <= 0) {
          status.value = 'lost'
        }
      } else {
        if (!collected.value.includes(i.letter)) {
          collected.value.push(i.letter)
          log.value.push(`✓ ${i.letter}`)
          sfx.coin()
        }
        if (collected.value.length >= INGREDIENTS.value.length) {
          status.value = 'won'
          sfx.win()
        }
      }
      return false
    }
    return true
  })
  frame = requestAnimationFrame(loop)
}

function move(dx: number, dy: number) {
  if (status.value !== 'playing') return
  witch.value.x = Math.max(0, Math.min(9, witch.value.x + dx))
  witch.value.y = Math.max(0, Math.min(4, witch.value.y + dy))
  sfx.tick()
}

function onKey(e: KeyboardEvent) {
  if (status.value !== 'playing') return
  if (e.key === 'ArrowUp' || e.key === 'w') move(0, -1)
  if (e.key === 'ArrowDown' || e.key === 's') move(0, 1)
  if (e.key === 'ArrowLeft' || e.key === 'a') move(-1, 0)
  if (e.key === 'ArrowRight' || e.key === 'd') move(1, 0)
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (frame !== null) cancelAnimationFrame(frame)
})

function onQuit() { router.push('/') }
</script>

<template>
  <CrtFrame
    :lives="brooms"
    :status="status"
    :title="locale.current === 'pt-BR' ? 'BRUXAS VOADORAS' : 'FLYING WITCHES'"
    @restart="start"
    @quit="onQuit"
  >
    <div v-if="status === 'intro'" class="text-center py-6">
      <p class="text-ink-muted text-sm mb-4">
        {{ locale.current === 'pt-BR' ? 'Colete 4 ingredientes para a Superwitch. Cuidado com o Snatcher!' : 'Collect 4 ingredients for Superwitch. Beware the Snatcher!' }}
      </p>
      <button class="arcade-btn arcade-btn-amber" @click="start">▶ START</button>
    </div>
    <div v-else class="space-y-2">
      <p class="text-xs flex items-center justify-between">
        <span class="text-cyan">COLLECTED <span class="text-amber">{{ collected.length }}</span>/4</span>
        <span :class="brooms <= 1 ? 'danger-phosphor' : 'text-amber'">BROOMS {{ brooms }}</span>
      </p>
      <div class="relative bg-void-deep border border-surface-600 overflow-hidden" style="aspect-ratio: 10/5; max-width: 400px;">
        <div
          v-for="(i, idx) in ingredients"
          :key="idx"
          class="absolute font-display font-bold text-2xl"
          :class="i.isSnatcher ? 'danger-phosphor' : 'amber-phosphor'"
          :style="{ left: `${i.x * 10}%`, top: `${i.y * 20}%` }"
        >{{ i.letter }}</div>
        <div
          class="absolute magenta-phosphor font-bold text-2xl"
          :style="{ left: `${witch.x * 10}%`, top: `${witch.y * 20}%`, transform: 'translate(-50%, -50%)' }"
        >★</div>
      </div>
      <GameLog :entries="log" class="border border-surface-600 bg-surface-800 p-2 h-24 text-xs space-y-0.5" />
      <div class="grid grid-cols-3 gap-1 sm:hidden">
        <div></div>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(0, -1)">↑</button>
        <div></div>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(-1, 0)">←</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(0, 1)">↓</button>
        <button class="arcade-btn-ghost border border-surface-600 text-[10px] py-1" @click="move(1, 0)">→</button>
      </div>
      <p v-if="status === 'won'" class="amber-phosphor text-shadow-neon font-display text-center">★ POTION DONE ★</p>
      <p v-else-if="status === 'lost'" class="danger-phosphor text-shadow-neon font-display text-center">✕ NO BROOM ✕</p>
    </div>
  </CrtFrame>
</template>

<script lang="ts">
import { computed } from 'vue'
export default {}
</script>
